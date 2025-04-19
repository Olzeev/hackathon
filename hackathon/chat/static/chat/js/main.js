
csrf = document.getElementsByName("csrfmiddlewaretoken")[0].value
function get_username(callback) {
    $.ajax({
        type: "POST",
        url: '/chat/getUsername',
        data: {
            "csrfmiddlewaretoken": csrf
        },
        success: (res)=> {
            callback(res.username);
        },
        error: (err)=> {
            callback('-anon-')
        }
    })
}


var mapPeers = {}

function getHelperId() {
    const path = window.location.pathname; // "/chat/456/"
    const segments = path.split('/').filter(Boolean); // ["chat", "456"]
    return segments[1]; 
}

const helperId = getHelperId();
console.log(helperId); // Выведет "456" (как строка)

username = ''
document.getElementById('join-btn').onclick = function () {
    username = document.getElementById('username-input').textContent
    console.log(username)

    var loc = window.location
    var wsStart = 'ws://'
    
    if (loc.protocol == 'https:') {
        wsStart = 'wss://'
    }
    var endPoint = wsStart + loc.host + '/chat/'
    webSocket = new WebSocket(endPoint)



    document.querySelector("#id_message_send_input").focus();
    document.querySelector("#id_message_send_input").onkeyup = function (e) {
        if (e.keyCode == 13) {
            document.querySelector("#id_message_send_button").click();
        }
    };

    document.querySelector("#id_message_send_button").onclick = function (e) {
        var messageInput = document.querySelector(
            "#id_message_send_input"
        ).value;
        get_username(function(username) {
            webSocket.send(JSON.stringify({ action: 'new-answer', message: messageInput, username : username}));
        })
        
    };
    webSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);

        var peerUsername = data['peer']
        var action = data['action']

        if (username == peerUsername) return;
        var receiver_channel_name = data['message']['receiver_channel_name']
        if (action == 'new-peer') {
            createOfferer(peerUsername, receiver_channel_name);

            return;
        }

        if (action == 'new-offer') {
            var offer = data['message']['sdp'];
            createAnswerer(offer, peerUsername, receiver_channel_name);
            return;
        }

        if (action == 'new-answer') {
            var answer = data['message']['sdp']

            var peer = mapPeers[peerUsername][0];

            peer.setRemoteDescription(answer);
            return ;
        }

        //var div = document.createElement("div");
        //div.innerHTML = data.username + " : " + data.message;
        //document.querySelector("#id_message_send_input").value = "";
        //document.querySelector("#id_chat_item_container").appendChild(div);
    };
    webSocket.onopen = function (e) {
        console.log("The connection was setup successfully !");

        sendSignal('new-peer', {});
    };

    webSocket.onclose = function (e) {
        console.log("The connection was closed!");
    };

    webSocket.addEventListener('error', (e) => {
        console.log('Error occurred! ');
    })
}
var localStream = new MediaStream()

const constraints = {
    'video': true, 
    'audio': true
}

const localVideo = document.querySelector('#local-video')

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = localStream;
        localVideo.muted = true;
    })
    .catch(error => {
        console.log('Error accessing media devices', error);
    })

 

function sendSignal(action, message){
    var jsonStr = JSON.stringify({
        'peer': username, 
        'action': action,
        'message': message
    })

    webSocket.send(jsonStr)
}

function createOfferer(peerUsername, receiver_channel_name) {
    var peer = new RTCPeerConnection(null); // TODO: provide different connections TUN STUN
    addLocalTracks(peer);

    var dc = peer.createDataChannel('channel');
    dc.addEventListener('open', () =>{
        console.log('Connection opened');
    });
    dc.addEventListener('message', dcOnMessage);

    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, peerUsername);

    mapPeers[peerUsername] = [peer, dc];    

    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;

        if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed') {
            delete mapPeers[peerUsername];
            if (!iceConnectionState != 'closed') {
                peer.close();
            }

            removeVideo(remoteVideo);

        }
    })

    peer.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
            console.log('New ice candidate: ', JSON.stringify(peer.localDescription))

            return
        }

        sendSignal('new-offer', {
            'sdp': peer.localDescription, 
            'receiver_channel_name': receiver_channel_name
        })
    })

    peer.createOffer()
        .then(o => peer.setLocalDescription(o))
        .then(() => 
            console.log('Local description set successfully.')
        )
}

function createAnswerer(offer, peerUsername, receiver_channel_name) {
    var peer = new RTCPeerConnection(null); // TODO: provide different connections TUN STUN
    addLocalTracks(peer);


    var remoteVideo = createVideo(peerUsername);
    setOnTrack(peer, remoteVideo);

    peer.addEventListener('datachannel', e => {
        peer.dc = e.channel;
        peer.dc.addEventListener('open', () =>{
            console.log('Connection opened');
        });
        peer.dc.addEventListener('message', dcOnMessage);

        mapPeers[peerUsername] = [peer, peer.dc];   
    })

     

    peer.addEventListener('iceconnectionstatechange', () => {
        var iceConnectionState = peer.iceConnectionState;

        if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected' || iceConnectionState === 'closed') {
            delete mapPeers[peerUsername];
            if (iceConnectionState != 'closed') {
                peer.close();
            }

            removeVideo(remoteVideo);

        }
    })

    peer.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
            console.log('New ice candidate: ', JSON.stringify(peer.localDescription))

            return
        }

        sendSignal('new-answer', {
            'sdp': peer.localDescription, 
            'receiver_channel_name': receiver_channel_name
        })
    })

    peer.setRemoteDescription(offer)
        .then(() => {
            console.log('Remote description set successfully for %s.', peerUsername);
            return peer.createAnswer()
        })
        .then(a => {
            console.log('Answer created!');

            peer.setLocalDescription(a);

        })
}

function addLocalTracks(peer) {
    localStream.getTracks().forEach(track => {
        peer.addTrack(track, localStream)
    })
    return;
}

function dcOnMessage(event) {
    var message = event.data


    var div = document.createElement("div");
    div.innerHTML = message
    document.querySelector("#id_message_send_input").value = "";
    document.querySelector("#id_chat_item_container").appendChild(div);
}

function createVideo(peerUsername) {
    var videoContainer = document.querySelector("#remote-video");
    return videoContainer
}

function setOnTrack(peer, remoteVideo) {
    var remoteStream = new MediaStream();

    remoteVideo.srcObject = remoteStream

    

    peer.addEventListener('track', async (event) => {
        remoteStream.addTrack(event.track, remoteStream);
    })
}

function removeVideo(remoteVideo) {
    var videoContainer = document.querySelector("#remote-video");
    videoContainer.src = "";
}