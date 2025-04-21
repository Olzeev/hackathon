// client_rtc.js — мультиридерный стрим + ЧАТ (финальная версия 02 May 2025)
// -------------------------------------------------------------
// • Стример ↔ каждый зритель = отдельный RTCPeerConnection + DataChannel.
// • Стример ретранслирует каждое входящее сообщение всем остальным зрителям,
//   поэтому у всех участников чат синхронный и без "каши".
// • Зритель имеет один DataChannel (со стримером).
// -------------------------------------------------------------

const curId   = +document.querySelector('meta[name="current-user-id"]').content;
const pageId  = +document.querySelector('meta[name="page-user-id"]').content;
const isHost  = curId === pageId;

let ws;                             // WebSocket
const pcs  = {};                    // host: viewerId -> RTCPeerConnection
const dcs  = {};                    // host: viewerId -> DataChannel
let viewerPc = null;                // for non‑host
let viewerDc = null;
let localStream = null;
const iceCfg = { iceServers:[{urls:'stun:stun.l.google.com:19302'}] };

// UI
const videoEl  = document.getElementById('callVideo');
const btnCam   = document.getElementById('getMedia');
const input    = document.getElementById('messageInput');
const chatLog  = document.getElementById('chat-log');

window.onload = () => {
  ws = new WebSocket(`ws://${location.host}/chat/${pageId}`);
  ws.onopen    = () => { if(!isHost) wsSend({type:'hello',from:curId,to:pageId}); };
  ws.onmessage = onWsMsg;
  if (isHost) {
    btnCam.style.display = 'inline-block';
    btnCam.onclick = startStream;
  }
};

function wsSend(obj){ ws.readyState===1 && ws.send(JSON.stringify(obj)); }

/* ---------------- host: start camera and create offer for each viewer -------------- */
async function startStream(){
  localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:false});
  videoEl.srcObject = localStream;
  videoEl.muted = true;
  await videoEl.play().catch(()=>{});
  btnCam.disabled = true;
}

/* ---------------- WebSocket messages --------------------------------------------- */
async function onWsMsg(evt){
  const msg = JSON.parse(evt.data);
  const {type,from,to,payload} = msg;

  // HELLO from viewer → host creates pc+dc and sends offer
  if (type==='hello' && isHost) {
    if (!localStream) return;                       // камеру ещё не включили
    if (pcs[from]) return;                          // уже существует

    const pc = new RTCPeerConnection(iceCfg);
    pcs[from] = pc;

    // треки
    localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));

    // ICE → viewer
    pc.onicecandidate = e=>{ if(e.candidate) wsSend({type:'candidate',from:curId,to:from,payload:e.candidate}); };

    // DataChannel
    const dc = pc.createDataChannel('chat');
    dcs[from] = dc;
    dc.onopen = ()=>{};
    dc.onmessage = ev => {
      addMsg(ev.data);                 // показать сообщение хоста
      // трансляция всем КРОМЕ отправившего
      broadcast(ev.data, except=from);
    };

    // SDP‑offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    wsSend({type:'offer',from:curId,to:from,payload:offer});
    return;
  }

  // viewer → host: answer
  if (type==='answer' && isHost && to===curId) {
    const pc = pcs[from];
    if (pc) await pc.setRemoteDescription(payload);
    return;
  }

  // any → host: ICE от viewer
  if (type==='candidate' && isHost && to===curId) {
    const pc = pcs[from];
    if(pc) await pc.addIceCandidate(new RTCIceCandidate(payload));
    return;
  }

  // host → viewer: offer
  if (type==='offer' && !isHost && to===curId) {
    viewerPc = new RTCPeerConnection(iceCfg);

    viewerPc.ontrack = e=>{
      const [stream] = e.streams; videoEl.srcObject=stream; videoEl.play(); };

    viewerPc.onicecandidate = e=>{ if(e.candidate) wsSend({type:'candidate',from:curId,to:from,payload:e.candidate}); };

    viewerPc.ondatachannel = ev=>{
      viewerDc = ev.channel;
      viewerDc.onmessage = ev=> addMsg(ev.data);
    };

    await viewerPc.setRemoteDescription(payload);
    const ans = await viewerPc.createAnswer();
    await viewerPc.setLocalDescription(ans);
    wsSend({type:'answer',from:curId,to:from,payload:ans});
    return;
  }

  // host → viewer ICE
  if (type==='candidate' && !isHost && to===curId && viewerPc) {
    await viewerPc.addIceCandidate(new RTCIceCandidate(payload));
  }
}

/* ---------------- CHAT --------------------------------------------- */
function sendMessage(){
  const txt=input.value.trim(); if(!txt) return; const line=`${username||'User'}: ${txt}`;
  addMsg(line);
  if(isHost){ broadcast(line); } else if(viewerDc && viewerDc.readyState==='open'){ viewerDc.send(line); }
  input.value='';
}

function broadcast(msg, except=null){ // host: отправить всем viewers, кроме except
  Object.entries(dcs).forEach(([vid,dc])=>{
    if(vid===String(except)) return;
    if(dc.readyState==='open') dc.send(msg);
  });
}

function addMsg(m){ const li=document.createElement('li'); li.textContent=m; chatLog.appendChild(li); chatLog.scrollTop=chatLog.scrollHeight; }
