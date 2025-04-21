// client_rtc.js — финальная мультипеерная версия 02 May 2025
// -------------------------------------------------------------
// • Стример ↔ каждый зритель = отдельный RTCPeerConnection + DataChannel.
// • Чат у всех синхронизирован, скролл всегда внизу (как Twitch).
// • Файл полностью самодостаточный: замените static/chat/js/client_rtc.js.

/* Метатеги в chat.html
<meta name="current-user-id" content="{{ request.user.id }}">
<meta name="page-user-id"    content="{{ helper.id }}">
<script>var username = "{{ username }}";</script>
*/

//--------------------------------------------------
// Общие переменные
//--------------------------------------------------
const curId   = +document.querySelector('meta[name="current-user-id"]').content;
const pageId  = +document.querySelector('meta[name="page-user-id"]').content;
const isOwner = curId === pageId;              // true = стример

// UI элементы
const videoEl   = document.getElementById('callVideo');
const chatUl    = document.getElementById('chat-log');
const inputBox  = document.getElementById('messageInput');
const btnSend   = document.querySelector('.message-input button');
const btnCamera = document.getElementById('getMedia');

//--------------------------------------------------
// WebSocket
//--------------------------------------------------
const ws = new WebSocket(`ws://${location.host}/chat/${pageId}`);
ws.addEventListener('open', () => {
  if (!isOwner) sendWS({type:'hello', from:curId, to:pageId});
});
ws.addEventListener('message', async ev => {
  const msg = JSON.parse(ev.data);
  if (msg.to && msg.to !== curId) return; // сообщение не мне
  await handleSignal(msg);
});
function sendWS(obj){ ws.readyState===1 && ws.send(JSON.stringify(obj)); }

//--------------------------------------------------
// Media + PeerConnections
//--------------------------------------------------
const iceConfig = { iceServers:[{urls:'stun:stun.l.google.com:19302'}] };
let localStream = null;                       // для стримера
const pcs  = {};                              // viewerId -> RTCPeerConnection
const dcs  = {};                              // viewerId -> DataChannel

async function startCamera(){
  try{
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
    videoEl.srcObject = localStream;
    videoEl.muted = true;
    await videoEl.play().catch(()=>{});
    btnCamera.disabled = true;
  }catch(e){ alert('Не удалось получить камеру: '+e); }
}
if (btnCamera) btnCamera.onclick = startCamera;

//--------------------------------------------------
// Обработка сигналов
//--------------------------------------------------
async function handleSignal({type, from, to, payload}){
  // -------- зритель ---------
  if (!isOwner){
    switch(type){
      case 'offer':
        const pc = new RTCPeerConnection(iceConfig);
        pcs[pageId] = pc;
        pc.ontrack = e => { const [s]=e.streams; videoEl.srcObject=s; videoEl.play(); };
        pc.ondatachannel = e => { dcs[pageId]=e.channel; e.channel.onmessage=ev=>addMsg(ev.data); };
        pc.onicecandidate = e=>{ if(e.candidate) sendWS({type:'candidate',from:curId,to:from,payload:e.candidate}); };
        await pc.setRemoteDescription(payload);
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        sendWS({type:'answer',from:curId,to:from,payload:ans});
        break;
      case 'candidate':
        pcs[pageId] && pcs[pageId].addIceCandidate(new RTCIceCandidate(payload));
        break;
      case 'chat':
        addMsg(payload);
        break;
    }
    return;
  }
  // -------- стример ---------
  switch(type){
    case 'hello':
      if(!localStream) return;               // камеру ещё не включили
      createConnectionForViewer(from);
      break;
    case 'answer':
      pcs[from] && pcs[from].setRemoteDescription(payload);
      break;
    case 'candidate':
      pcs[from] && pcs[from].addIceCandidate(new RTCIceCandidate(payload));
      break;
    case 'chat':
      addMsg(payload);                      // показываем в своём чате
      broadcastChat(from, payload);         // репост остальным
      break;
  }
}

//--------------------------------------------------
// Стример: создаём PC + DC на каждого зрителя
//--------------------------------------------------
async function createConnectionForViewer(viewerId){
  if(pcs[viewerId]) return;                  // уже есть
  const pc = new RTCPeerConnection(iceConfig);
  pcs[viewerId] = pc;

  // media tracks
  localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));

  // ICE
  pc.onicecandidate = e=>{ if(e.candidate) sendWS({type:'candidate',from:curId,to:viewerId,payload:e.candidate}); };

  // DataChannel
  const dc = pc.createDataChannel('chat');
  dcs[viewerId] = dc;
  dc.onopen = ()=>console.log('DC open with', viewerId);
  dc.onmessage = ev=>{ addMsg(ev.data); broadcastChat(viewerId, ev.data); };

  // Offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  sendWS({type:'offer',from:curId,to:viewerId,payload:offer});
}

//--------------------------------------------------
// Чат
//--------------------------------------------------
function addMsg(text){
  const li=document.createElement('li');
  li.textContent=text;
  chatUl.appendChild(li);
  chatUl.scrollTop = chatUl.scrollHeight;    // авто‑скролл вниз
}

btnSend?.addEventListener('click', sendMessage);
function sendMessage(){
  const txt = inputBox.value.trim();
  if(!txt) return;
  const message = `${username||'Гость'}: ${txt}`;
  addMsg(message);                           // локально

  if(isOwner){
    broadcastChat(curId, message);           // стример всем
  }else{
    sendWS({type:'chat',from:curId,to:pageId,payload:message});
  }
  inputBox.value='';
}
function broadcastChat(excludeId, message){
  // стример шлёт всем DC, кроме отправителя
  Object.entries(dcs).forEach(([vid,dc])=>{
    if(+vid!==excludeId && dc.readyState==='open') dc.send(message);
  });
}
