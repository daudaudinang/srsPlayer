import videojs from 'video.js';
import "video.js/dist/video-js.css";
import '@videojs/themes/dist/forest/index.css';
import {Button} from "@mui/material";
import {useState, useEffect} from 'react';

function App() {
  const [stream, setStream] = useState(new MediaStream());
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    window.onload = () => {
      setPlayer(videojs("#my-player", {
        autoplay: true,
        controls: true,
        liveui: true,
        width: 1080,
        height: 720
      }));
    }
  }, [player]);

  useEffect(() => {
    if(player) {
      player.tech().el().srcObject = stream;
    }
    
  },[stream, player]);

  const apiUrl = "http://123.31.11.64:1985/rtc/v1/play/";

  var configuration = {
    iceServers: [{ urls: "stun:stun2.1.google.com:19302" }],
  };

  var peer2;
  peer2 = new RTCPeerConnection(configuration);

  const sendSDP = async (sdp) => {
    const data = {
      api: apiUrl,
      tid: Number(parseInt(new Date().getTime() * Math.random() * 100))
        .toString(16)
        .substr(0, 7),
      sdp: sdp,
      clientip: null,
      streamurl:
        "webrtc://123.31.11.64/ywdacow15xwowa0p7jpdg0w470lws2zr/40ae931c-7f83-4ca1-bdcf-59863b8ec71d",
    };
    console.log("Send", data);

    return await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((err) => err);
  };

  peer2.addEventListener("iceconnectionstatechange", (event) => {
    if (peer2.iceConnectionState === "failed") {
      peer2.restartIce();
    }
  });

  peer2.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      console.log("icecandidate");
    }
  });

  peer2.addEventListener("track", async (event) => {
    console.log("Receive track");
    setStream(event.streams[0]);
  });

  const handleClick = (event) => {
    peer2.addTransceiver("audio", {direction: "recvonly"});
      peer2.addTransceiver("video", {direction: "recvonly"});

      peer2
        .createOffer()
        .then((offer) => {
          console.log("Send Offer", offer);
          peer2.setLocalDescription(offer);
          sendSDP(offer.sdp).then((data) => {
            const remoteAnswer = new RTCSessionDescription({
              type: "answer",
              sdp: data.sdp,
            });
            console.log("Receive Answer", remoteAnswer);
            peer2.setRemoteDescription(remoteAnswer);
          });
        })
        .catch((error) => {
          console.log(error);
        });
  }

  return (
    <>
      <Button variant="contained" onClick={handleClick} color='primary'>Click to watch stream</Button>
      <video id="my-player" className="video-js vjs-theme-forest"></video>
      {/* <video id="my-player" className="video-js"></video> */}
    </>
  );
}

export default App;