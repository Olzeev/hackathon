// client_rtc.js — «1 стример → зрители», версия 22 апр  ▸ фикс большого видео и чёрного экрана
// -------------------------------------------------------------------------
//  Изменено:
//    • У стримера большой <video> тоже показывает его поток (без маленького превью)
//    • ontrack отдаёт first stream из ev.streams → устранён чёрный экран у зрителей
//    • HTML‑разметка ожидает ТОЛЬКО один тег <video id="callVideo"> в .chat-area
// -------------------------------------------------------------------------

// 1. Переменные -------------------------------------------------------------
const currentUserId = +document.querySelector('meta[name="current-user-id"]').content;
const pageUserId    = +document.querySelector('meta[name="page-user-id"]').content;
const isOwner       = currentUserId === pageUserId;

const remoteVid = document.querySelector('#callVideo');
const btnCamera = document.querySelector('#getMedia');
const chatLog   = document.querySelector('#chat-log');
const input     = document.querySelector('#messageInput');

let conn, peerConnection, dataChannel;
let localStream = null;

const config      = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const constraints = { video: true, audio: false };

// 2. WebSocket и инициализация ---------------------------------------------
window.onload = () => {
  conn = new WebSocket(`ws://${window.location.host}/chat/${pageUserId}`);
  conn.addEventListener('open',  () => initialize(username));
  conn.addEventListener('message', onmessage);
};

function initialize(username) {
  peerConnection = new RTCPeerConnection(config);

  peerConnection.onicecandidate = e => {
    if (e.candidate) send({ peer: username, event: 'candidate', data: e.candidate });
  };

  dataChannel = peerConnection.createDataChannel('chat');
  dataChannel.onmessage = ev => {
    const li = document.createElement('li');
    li.textContent = ev.data;
    chatLog.appendChild(li);
  };
  peerConnection.ondatachannel = ev => (dataChannel = ev.channel);

  // ключевой фикс ▸ кладём remote stream напрямую из события
  peerConnection.ontrack = ev => {
    const stream = ev.streams[0];
    if (remoteVid.srcObject !== stream) {
      remoteVid.srcObject = stream;
      remoteVid.play().catch(() => {});
    }
  };

  if (isOwner) {
    btnCamera.style.display = 'inline-block';
    btnCamera.addEventListener('click', async () => {
      await startStream();
      await createOffer();
      btnCamera.style.display = 'none';
    });
  } else {
    btnCamera.style.display = 'none'; // зрителям кнопка не нужна
  }
}

// 3. Работа с потоками ------------------------------------------------------
async function startStream() {
  localStream = await navigator.mediaDevices.getUserMedia(constraints);
  // показываем собственное видео сразу в большом плеере
  remoteVid.srcObject = localStream;
  remoteVid.muted = true;
  remoteVid.play().catch(() => {});
  // треки в RTCPeerConnection
  localStream.getTracks().forEach(t => peerConnection.addTrack(t, localStream));
}

async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  send({ peer: username, event: 'offer', data: offer });
}

function handleOffer(offer) {
  peerConnection.setRemoteDescription(offer)
    .then(() => peerConnection.createAnswer())
    .then(ans => {
      peerConnection.setLocalDescription(ans);
      send({ peer: username, event: 'answer', data: ans });
    });
}

function handleAnswer(answer) {
  peerConnection.setRemoteDescription(answer);
}

function handleCandidate(candidate) {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
}

// 4. WebSocket --------------------------------------------------------------
function onmessage(msg) {
  const { peer, event, data } = JSON.parse(msg.data);
  if (peer === username) return; // свои не обрабатываем
  if (event === 'offer')     return handleOffer(data);
  if (event === 'answer')    return handleAnswer(data);
  if (event === 'candidate') return handleCandidate(data);
}

function send(obj) { conn.send(JSON.stringify(obj)); }

// 5. Чат --------------------------------------------------------------------
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  const full = `${username}: ${text}`;
  dataChannel.send(full);
  const li = document.createElement('li');
  li.textContent = full;
  chatLog.appendChild(li);
  input.value = '';
}
