// client_rtc.js

// --- 1. Получаем из страницы два id (добавьте эти meta-теги в ваш chat.html):
// <meta name="current-user-id" content="{{ request.user.id }}">
// <meta name="page-user-id"    content="{{ helper.id }}">
const currentUserId = Number(document
    .querySelector('meta[name="current-user-id"]')
    .getAttribute('content')
  );
  const pageUserId = Number(document
    .querySelector('meta[name="page-user-id"]')
    .getAttribute('content')
  );
  const isOwner = currentUserId === pageUserId;
  
  // --- 2. Селекторы:
  let btnCreateChat   = document.querySelector('#btnCreateChat');
  let btnCamera       = document.querySelector('#getMedia');
  let camera          = document.querySelector('#myVideo');
  let chatLog         = document.querySelector('#chat-log');
  let acceptDiv       = document.querySelector('#acceptDiv');
  let input           = document.querySelector('#messageInput');
  
  let conn, peerConnection, dataChannel;
  let localStream = new MediaStream();
  let remoteStream = new MediaStream();
  
  const config = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };
  
  const constraints = { video: true, audio: false };
  
  // --- 3. Прячем кнопку и локальное видео для не‑владельцев:
  if (!isOwner) {
    btnCamera.style.display = 'none';
    camera.style.display = 'none';
  } else {
    // только владелец может включать свою камеру
    btnCamera.addEventListener('click', my_stream);
  }
  
  // --- 4. WebSocket + DataChannel (без изменений) ---
  window.onload = function connect() {
    conn = new WebSocket('ws://' + window.location.host + '/chat/' + pageUserId);
    conn.addEventListener('open', () => initialize(username));
    conn.addEventListener('message', onmessage);
  
    if (isOwner) {
        btnCreateChat.style.display = 'block';
    }
  }
  
  function onmessage(msg) {
    let { peer, event, data } = JSON.parse(msg.data);
    if (peer === username) return;
    if (event === 'offer')  return handleOffer(data);
    if (event === 'answer') return handleAnswer(data);
    if (event === 'candidate') return handleCandidate(data);
  }
  
  function send(message) {
    conn.send(JSON.stringify(message));
  }
  
  function initialize(username) {
    peerConnection = new RTCPeerConnection(config);
    peerConnection.onicecandidate = e => {
      if (e.candidate) send({ peer: username, event: 'candidate', data: e.candidate });
    };
    dataChannel = peerConnection.createDataChannel('dataChannel', { reliable: true });
    dataChannel.onerror   = err => console.log('DC error:', err);
    dataChannel.onmessage = ev => {
      let msg = document.createElement('li');
      msg.textContent = ev.data;
      chatLog.appendChild(msg);
    };
    peerConnection.ondatachannel = ev => { dataChannel = ev.channel; };
  }
  
  function createOffer() {
    // добавляем только те треки, что есть в localStream
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
  
    peerConnection.createOffer(offer => {
      send({ peer: username, event: 'offer', data: offer });
      peerConnection.setLocalDescription(offer);
    }, () => alert('Error creating an offer'));
  
    btnCreateChat.style.display = 'none';
    acceptDiv.style.display  = 'block';
  }
  
  function handleOffer(offer) {
    // для владельца камеры — локальный стрим уже в localStream
    peerConnection.addEventListener('track', ev => {
      remoteStream.addTrack(ev.track, remoteStream);
    });
    let remoteVideo = document.querySelector('#callVideo');
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();
  
    peerConnection.setRemoteDescription(offer)
      .then(() => peerConnection.createAnswer())
      .then(ans => {
        peerConnection.setLocalDescription(ans);
        send({ peer: username, event: 'answer', data: ans });
      });
  }
  
  function handleAnswer(answer) {
    remoteStream = new MediaStream();
    let remoteVideo = document.querySelector('#callVideo');
    remoteVideo.srcObject = remoteStream;
    remoteVideo.play();
  
    peerConnection.addEventListener('track', ev => {
      remoteStream.addTrack(ev.track, remoteStream);
    });
  
    peerConnection.setRemoteDescription(answer);
  }
  
  function handleCandidate(candidate) {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }
  
  function sendMessage() {
    dataChannel.send(username + ': ' + input.value);
    let msg = document.createElement('li');
    msg.textContent = input.value;
    chatLog.appendChild(msg);
    input.value = '';
  }
  
  // --- 5. Функция включения стрима (только для владельца) ---
  function my_stream() {
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        localStream = stream;
        camera.srcObject = stream;
        camera.muted     = true;
        stream.getVideoTracks()[0].enabled = true;
      })
      .catch(err => console.log('getUserMedia error:', err));
  }
  
  // вешаем остальные кнопки уже после объявления функций
  if (isOwner) {
    document.querySelector('#btnCreateChat').addEventListener('click', createOffer);
  }
  

  