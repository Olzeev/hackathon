// client_rtc.js — версия 30 Apr 2025, фикс для мультизрителей и чата
// Один стример ↔ несколько зрителей, чат + WebRTC
// -------------------------------------------------------------

// В chat.html должны быть:
// <meta name="current-user-id" content="{{ request.user.id }}">
// <meta name="page-user-id"    content="{{ helper.id }}">
// <script>var username = "{{ username }}";</script>

const currentUserId = +document.querySelector('meta[name="current-user-id"]').content;
const pageUserId    = +document.querySelector('meta[name="page-user-id"]').content;
const isOwner       = currentUserId === pageUserId;

const btnCam  = document.getElementById('getMedia');
const videoEl = document.getElementById('callVideo');
const chatUl  = document.getElementById('chat-log');
const input   = document.getElementById('messageInput');

let ws, pc, dc, localStream;
const cfg   = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const media = { video: true, audio: false };

// ---------- WebSocket + PeerConnection setup ----------
window.onload = () => {
  ws = new WebSocket(`ws://${location.host}/chat/${pageUserId}`);
  ws.onopen    = onWsOpen;
  ws.onmessage = e => handleSignal(JSON.parse(e.data));
};

function onWsOpen() {
  initPeer();
  if (!isOwner) {
    // зритель запрашивает оффер
    sendSignal('hello', null);
  }
}

function sendSignal(type, data = null) {
  if (ws.readyState === 1) ws.send(JSON.stringify({ type, from: currentUserId, data }));
}

function initPeer() {
  pc = new RTCPeerConnection(cfg);

  pc.onicecandidate = e => {
    if (e.candidate) sendSignal('candidate', e.candidate);
  };

  pc.ontrack = e => {
    const [stream] = e.streams;
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
      videoEl.play().catch(() => {});
    }
  };

  if (isOwner) {
    // создаём канал только один раз для стримера
    dc = pc.createDataChannel('chat');
    dc.onmessage = ev => addMsg(ev.data);
  } else {
    // зритель принимает канал
    pc.ondatachannel = ev => {
      dc = ev.channel;
      dc.onmessage = ev2 => addMsg(ev2.data);
    };
  }

  if (isOwner) {
    btnCam.style.display = 'inline-block';
    btnCam.onclick = startStream;
  }
}

// ---------- Стример: start streaming ----------
async function startStream() {
  localStream = await navigator.mediaDevices.getUserMedia(media);

  // показываем свой поток в большом окне
  videoEl.srcObject = localStream;
  videoEl.muted     = true;
  await videoEl.play().catch(() => {});

  // из localStream добавляем треки в PeerConnection
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

  // шлём оффер
  await negotiate();
  btnCam.disabled = true;
}

async function negotiate() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  sendSignal('offer', offer);
}

// ---------- Обработка сигналов ----------
async function handleSignal(msg) {
  const { type, data, from } = msg;
  switch (type) {
    case 'hello':
      // новый зритель запросил оффер
      if (isOwner && localStream) await negotiate();
      break;

    case 'offer':
      // зритель получает оффер от стримера
      if (!isOwner) {
        await pc.setRemoteDescription(data);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal('answer', answer);
      }
      break;

    case 'answer':
      // стример получает ответ
      if (isOwner) {
        await pc.setRemoteDescription(data);
      }
      break;

    case 'candidate':
      if (data) await pc.addIceCandidate(new RTCIceCandidate(data));
      break;
  }
}

// ---------- Чат ----------
function sendMessage() {
  const text = input.value.trim();
  if (!text || !dc) return;
  const msg = `${username || 'Гость'}: ${text}`;
  addMsg(msg);
  dc.send(msg);
  input.value = '';
}

function addMsg(msg) {
  const li = document.createElement('li');
  li.textContent = msg;
  chatUl.appendChild(li);
  chatUl.scrollTop = chatUl.scrollHeight;
}
