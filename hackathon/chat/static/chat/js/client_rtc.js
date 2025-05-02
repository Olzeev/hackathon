// client_rtc.js — мультиплеерная версия с историей и без дублирования
// Метатеги в chat.html:
// <meta name="current-user-id" content="{{ request.user.id }}">
// <meta name="page-user-id"    content="{{ helper.id }}">
// <script>var username = "{{ username }}";</script>

const curId   = +document.querySelector('meta[name="current-user-id"]').content;
const pageId  = +document.querySelector('meta[name="page-user-id"]').content;
const isOwner = curId === pageId;

// UI
const videoEl   = document.getElementById('callVideo');
const chatUl    = document.getElementById('chat-log');
const inputBox  = document.getElementById('messageInput');
const btnSend   = document.querySelector('.message-input button');
const btnCamera = document.getElementById('getMedia');

// WebSocket для сигналинга + чата
const ws = new WebSocket(`wss://${location.host}/chat/${pageId}`);
ws.addEventListener('open', () => {
  if (!isOwner) {
    // зритель говорит «привет» стримеру, чтобы тот установил WebRTC
    sendWS({ type:'hello', from:curId, to:pageId });
  }
});
ws.addEventListener('message', async ev => {
  const msg = JSON.parse(ev.data);
  // если указан to и не нам — игнорируем
  if (msg.to != null && msg.to !== curId) return;
  await handleSignal(msg);
});
function sendWS(obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}

// WebRTC setup
/*
const iceConfig = { iceServers:[{ urls:'stun:stun.l.google.com:19302' }, 
  {
    urls: [
      "turn:global.xirsys.net:3478?transport=udp",
      "turn:global.xirsys.net:3478?transport=tcp",
      "turns:global.xirsys.net:443?transport=tcp"
    ],
    username: "ваш-username",  // из ответа Xirsys
    credential: "ваш-credential"  // из ответа Xirsys
  }
] };
 */
const iceConfig = {iceServers:[{
  "username": "6j17pWChPpZ0fP7rDSc86kHmAqM_zfh6VbqRlXDc8IXuA7I7yfyMqYxo_DornWxFAAAAAGgUketvbHplZXY=", 
  "urls": [
    "stun:fr-turn3.xirsys.com",
    "turn:fr-turn3.xirsys.com:80?transport=udp",
    "turn:fr-turn3.xirsys.com:3478?transport=udp",
    "turn:fr-turn3.xirsys.com:80?transport=tcp",
    "turn:fr-turn3.xirsys.com:3478?transport=tcp",
    "turns:fr-turn3.xirsys.com:443?transport=tcp",
    "turns:fr-turn3.xirsys.com:5349?transport=tcp"],
  "credential": "ceda6496-2738-11f0-b1b0-0242ac120004"
}]
}

let localStream = null;
const pcs = {};  // RTCPeerConnection по viewerId
const dcs = {};  // DataChannel по viewerId

// Стример может включить камеру
async function startCamera() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
    videoEl.srcObject = localStream;
    videoEl.muted = true;
    await videoEl.play().catch(()=>{});
    btnCamera.disabled = true;
  } catch (e) {
    alert('Не удалось получить камеру: '+e);
  }
}
if (btnCamera) btnCamera.onclick = startCamera;

// Обработка всех входящих сигналов
async function handleSignal({ type, from, to, payload }) {
  // --- ЗРИТЕЛЬ ---
  if (!isOwner) {
    switch(type) {
      case 'offer':
        // получили SDP‑офер от стримера
        const pc = new RTCPeerConnection(iceConfig);
        pcs[pageId] = pc;
        pc.ontrack = e => {
          videoEl.srcObject = e.streams[0];
          videoEl.play();
        };
        pc.ondatachannel = e => {
          // DataChannel только для чата стримера
          dcs[pageId] = e.channel;
          e.channel.onmessage = ev => addMsg(ev.data);
        };
        pc.onicecandidate = e => {
          if (e.candidate) {
            sendWS({ type:'candidate', from:curId, to:from, payload:e.candidate });
          }
        };
        await pc.setRemoteDescription(payload);
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        sendWS({ type:'answer', from:curId, to:from, payload:ans });
        break;

      case 'candidate':
        pcs[pageId]?.addIceCandidate(new RTCIceCandidate(payload));
        break;

      case 'chat':
        // WS‑рассылка: показываем только чужие и историю (from неопределён)
        if (from !== pageId) {
          addMsg(payload);
        }
        break;
    }
    return;
  }

  // --- СТРИМЕР ---
  switch(type) {
    case 'hello':
      if (localStream) createConnectionForViewer(from);
      break;

    case 'answer':
      pcs[from]?.setRemoteDescription(payload);
      break;

    case 'candidate':
      pcs[from]?.addIceCandidate(new RTCIceCandidate(payload));
      break;

    case 'chat':
      // WS‑рассылка: стример видит все, но дублируем по DC только свои
      addMsg(payload);
      if (from === curId) {
        broadcastDC(payload);
      }
      break;
  }
}

// Стример создаёт RTCPeerConnection + DataChannel для каждого зрителя
async function createConnectionForViewer(viewerId) {
  if (pcs[viewerId]) return;
  const pc = new RTCPeerConnection(iceConfig);
  pcs[viewerId] = pc;

  // видео‑трек
  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.onicecandidate = e => {
    if (e.candidate) {
      sendWS({ type:'candidate', from:curId, to:viewerId, payload:e.candidate });
    }
  };

  // DataChannel: стример → зритель
  const dc = pc.createDataChannel('chat');
  dcs[viewerId] = dc;
  dc.onopen = () => console.log('Chat DC open with', viewerId);

  // Получаем сообщения от зрителя (теоретически; но мы их не ретранслируем через DC)
  dc.onmessage = ev => {
    // ничего не делаем — WS уже покроет их чатом
  };

  // создаём офер
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  sendWS({ type:'offer', from:curId, to:viewerId, payload:offer });
}

// Добавление сообщения в HTML
function addMsg(text) {
  const li = document.createElement('li');
  li.textContent = text;
  chatUl.appendChild(li);
  chatUl.scrollTop = chatUl.scrollHeight;
}

// Отправка нового сообщения из input
btnSend?.addEventListener('click', sendMessage);
function sendMessage() {
  const txt = inputBox.value.trim();
  if (!txt) return;
  const message = `${username || 'Гость'}: ${txt}`;

  // шлём ВСЕМ через WS (сохранение в БД + история)
  sendWS({ type:'chat', from:curId, to:pageId, payload:message });

  // сбрасываем input
  inputBox.value = '';
}

// Дублируем только стримерские сообщения по DataChannel
function broadcastDC(message) {
  Object.values(dcs).forEach(dc => {
    if (dc.readyState === 'open') {
      dc.send(message);
    }
  });
}


document.getElementById('play_remote_video').addEventListener('click', function() {
  document.getElementById('callVideo').play()
})