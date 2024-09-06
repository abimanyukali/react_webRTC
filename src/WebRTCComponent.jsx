import React, { useEffect, useRef, useState } from 'react';

const WebTRCComponent = () => {
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [offerSDP, setOfferSDP] = useState('');
  const [answerSDP, setAnswerSDP] = useState('');

  const user1VideoRef = useRef(null);
  const user2VideoRef = useRef(null);

  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
  };
  const videoError = (error) => {
    console.log('error', error);
  };
  const handleVideo = (stream1) => {
    setLocalStream(stream1);
    if (user1VideoRef.current) {
      user1VideoRef.current.srcObject = stream1;
    }
  };
  useEffect(() => {
    const init = async () => {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia ||
        navigator.oGetUserMedia;
      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          { video: true, Audio: true },
          handleVideo,
          videoError
        );
      }
    };

    init();
  }, []);

  const createOffer = async () => {
    const pc = new RTCPeerConnection(servers);
    setPeerConnection(pc);

    const remoteStream = new MediaStream();
    setRemoteStream(remoteStream);
    if (user2VideoRef.current) {
      user2VideoRef.current.srcObject = remoteStream;
    }

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        setOfferSDP(JSON.stringify(pc.localDescription));
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    setOfferSDP(JSON.stringify(offer));
    console.log(offer);
  };

  const createAnswer = async () => {
    const pc = new RTCPeerConnection(servers);
    setPeerConnection(pc);

    const remoteStream = new MediaStream();
    setRemoteStream(remoteStream);
    if (user2VideoRef.current) {
      user2VideoRef.current.srcObject = remoteStream;
    }

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };
    console.log(offerSDP);
    const offer = JSON.parse(offerSDP);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        setAnswerSDP(JSON.stringify(pc.localDescription));
      }
    };

    setAnswerSDP(JSON.stringify(answer));
    console.log(answerSDP);
  };

  const addAnswer = async () => {
    const answer = JSON.parse(answerSDP);
    if (peerConnection && !peerConnection.currentRemoteDescription) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    }
  };

  return (
    <div>
      <h1>One-to-One WebRTC Video Call TESTING</h1>
      <div>
        <video
          ref={user1VideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '400px' }}
        ></video>
        <video
          ref={user2VideoRef}
          autoPlay
          playsInline
          style={{ width: '400px' }}
        ></video>
      </div>

      <div>
        <h3>Offer SDP</h3>
        <textarea
          rows="6"
          cols="50"
          value={offerSDP}
          onChange={(e) => setOfferSDP(e.target.value)}
        ></textarea>
      </div>

      <div>
        <h3>Answer SDP</h3>
        <textarea
          rows="6"
          cols="50"
          value={answerSDP}
          onChange={(e) => setAnswerSDP(e.target.value)}
        ></textarea>
      </div>

      <button onClick={createOffer}>Create Offer</button>
      <button onClick={createAnswer}>Create Answer</button>
      <button onClick={addAnswer}>Add Answer</button>
    </div>
  );
};

export default WebTRCComponent;
