import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { FaPhone, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import "./css/VideoCall.css";

const VideoCall = () => {
  const [blinkEffect, setBlinkEffect] = useState(false);

  const [email, setEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localPrediction, setLocalPrediction] = useState({ class: '', confidence: 0 });
  const [remotePrediction, setRemotePrediction] = useState({ class: '', confidence: 0 });

  const [localMessage, setLocalMessage] = useState('');
const [remoteMessage, setRemoteMessage] = useState('');
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const predictionIntervalRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ]
  };
  useEffect(() => {
    console.log('Call status changed:', isInCall);
  }, [isInCall]);
  
  useEffect(() => {
    console.log('Video status changed:', isVideoOff);
  }, [isVideoOff]);
  
const captureImageFromVideo = () => {
  if (!localVideoRef.current) return null;

  const canvas = document.createElement('canvas');
  const video = localVideoRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  // Get base64 string
  return canvas.toDataURL('image/jpeg', 0.8);
};
const getPrediction = async () => {
  console.log('getPrediction called');
  try {
      console.log('Capturing image from video');
      const imageData = captureImageFromVideo();
      if (!imageData) {
          console.log('No image data captured from video');
          return;
      }
      console.log('Image captured successfully');

      console.log('Sending prediction request to server');
      const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData })
      });

      console.log('Prediction response received:', response.status);

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const prediction = await response.json();
      console.log('Prediction result:', prediction);

      if (prediction.error) {
          console.error('Prediction error:', prediction.error);
          return;
      }

      console.log('Setting local prediction:', prediction);
       setLocalPrediction(prediction);


      console.log('Emitting prediction to peer:', currentCallId);
      socketRef.current.emit('asl-prediction', { toSocketId: currentCallId, prediction });

  } catch (error) {
      console.error('Error in getPrediction:', error);
  }
};


// Update the startASLDetection function to add error handling:
const startASLDetection = () => {
  if (predictionIntervalRef.current) {
      console.log('Clearing existing prediction interval');
      stopASLDetection();
  }

  console.log('Starting ASL detection');
  
  predictionIntervalRef.current = setInterval(() => {
      

      console.log("Attempting to get prediction");
      getPrediction().catch(error => {
          console.error('Error in ASL detection loop:', error);
      });

  }, 1000);
};




  const stopASLDetection = () => {
    if (predictionIntervalRef.current) {
      clearInterval(predictionIntervalRef.current);
      predictionIntervalRef.current = null;
    }
  };

  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket'],
      forceNew: false,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to server with socket ID:', socketRef.current.id);
    });
    socketRef.current.on('receive-message', (message) => {
      console.log('Received message:', message);
      setRemoteMessage(message);
    });

    socketRef.current.on('registration-success', ({ message }) => {
      console.log('Registration successful');
      setIsRegistered(true);
      localStorage.setItem('email', email);
    });

    socketRef.current.on('registration-failed', () => {
      alert('Registration failed. Try another email.');
    });

    socketRef.current.on('incoming-call', async ({ from, offer }) => {
      console.log('Incoming call from:', from);
      setIncomingCall({ from, offer });
      setCurrentCallId(from); // Ensure call ID is set when receiving a call
  });
    socketRef.current.on('call-accepted', async (answer) => {
      console.log('Call accepted, setting remote description');
      try {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    socketRef.current.on('candidate', async (candidate) => {
      try {
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    });

    socketRef.current.on('call-ended', () => {
      cleanupCall();
    });

    socketRef.current.on('asl-prediction', ({ prediction }) => {
      console.log('Received ASL prediction:', prediction);
      setRemotePrediction(prediction);
      updateRemoteMessage(prediction.class);
      setBlinkEffect(true);
      setTimeout(() => setBlinkEffect(false), 1000);
    });
    

    return () => {
      cleanupCall();
      socketRef.current?.disconnect();
    };
    
  }, []);


  const updateLocalMessage = (char) => {
    if (char === 'delete') {
      setLocalMessage((prev) => prev.slice(0, -1));
    } else {
      setLocalMessage((prev) => prev + char);
    }
  };

  const updateRemoteMessage = (char) => {
    console.log(char);
    if (char === 'delete') {
      setRemoteMessage((prev) => prev.slice(0, -1));
    } else {
      setRemoteMessage((prev) => prev + char);
    }
  };
  const registerEmail = () => {
    if (!email.trim()) {
      alert('Please enter a valid email');
      return;
    }
    socketRef.current.emit('register-email', email);
  };

  const createPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(iceServers);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('candidate', {
          to: currentCallId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };
  const startLocalStream = async () => {
    try {
      console.log('Requesting media stream');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('Media stream obtained:', stream);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        console.log('Setting video source');
        localVideoRef.current.srcObject = stream;
        
        localVideoRef.current.onplay = () => {
          console.log('Local video started playing');
        };
        
        localVideoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          console.log('Video dimensions:', {
            width: localVideoRef.current.videoWidth,
            height: localVideoRef.current.videoHeight
          });
        };
      } else {
        console.error('Local video ref not available');
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Cannot access camera or microphone');
      throw error;
    }
  };

  const initiateCall = async () => {
    if (!targetUserId.trim()) {
        alert('Please enter a user email to call');
        return;
    }

    try {
        console.log('Initiating call');
        setCurrentCallId(targetUserId); 
        setIsInCall(true);

        const stream = await startLocalStream();
        const pc = createPeerConnection();

        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit('initiate-call', {
            toEmail: targetUserId, 
            offer: pc.localDescription
        });

        console.log('Call initiated, starting ASL detection');
        startASLDetection();
    } catch (error) {
        console.error('Error initiating call:', error);
        cleanupCall();
    }
};
const acceptCall = async () => {
  if (!incomingCall) return;

  try {
      console.log('Accepting call');
      setCurrentCallId(incomingCall.from); // Ensure call ID is set
      setIsInCall(true);
      const stream = await startLocalStream();
      const pc = createPeerConnection();

      stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit('accept-call', {
          to: incomingCall.from,
          answer: pc.localDescription
      });

      setIncomingCall(null);
      console.log('Call accepted, starting ASL detection');
      startASLDetection();
  } catch (error) {
      console.error('Error accepting call:', error);
      cleanupCall();
  }
};
  
const cleanupCall = () => {
console.log("Cleaning up call and stopping ASL detection.");
stopASLDetection();
if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
}
if (peerConnectionRef.current) {
    peerConnectionRef.current.close();
}
setLocalStream(null);
setIsInCall(false);
setIncomingCall(null);
setCurrentCallId(null);  // Reset call ID
setIsAudioMuted(false);
setIsVideoOff(false);
setLocalPrediction({ class: '', confidence: 0 });
setRemotePrediction({ class: '', confidence: 0 });

if (localVideoRef.current) localVideoRef.current.srcObject = null;
if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
};
  
  const endCall = () => {
    socketRef.current.emit('end-call', { to: currentCallId });
    cleanupCall();
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      console.log('Toggling video');
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!isVideoOff);
      
      console.log('Video enabled:', videoTrack.enabled);
      if (!videoTrack.enabled) {
        console.log('Video disabled, stopping ASL detection');
        stopASLDetection();
      } else {
        console.log('Video enabled, restarting ASL detection');
        startASLDetection();
      }
    }}

    useEffect(() => {
      if (localPrediction.class) {
        updateLocalMessage(localPrediction.class);
      }
    }, [localPrediction]);
  
    const sendMessage = () => {
      if (localMessage.trim()) {
        socketRef.current.emit('send-message', { toSocketId: currentCallId, message: localMessage });
        setLocalMessage('');
      }
    };
    return (
      <div className="app-container">
       <nav className="asl-navbar">
        <div className="asl-container">
          <Link to="/" className="asl-logo">GestureGenius</Link>
          <ul className="asl-nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/self-testing">Self Testing</Link></li>
            <li><Link to="/video-calling">Video Calling</Link></li>
            <li><Link to="/learn">Learn ASL</Link></li>
            <li><Link to="/explore">Explore Model</Link></li>
          </ul>
        </div>
      </nav>

        <div className="main-container">
          {!isRegistered ? (
            <div className="register-box">
              <h2>Register to Start</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to register"
                className="register-input"
              />
              <button onClick={registerEmail} className="register-btn">
                Register
              </button>
            </div>
          ) : (
            <div className="video-call-wrapper">
              {/* User Info Section */}
              <div className="user-panel">
                <div className="user-id">
                  <h2>Your ID: {email}</h2>
                </div>
                <div className="call-actions">
                  <input
                    type="email"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Enter email ID to call"
                    className="call-input"
                  />
                  {!isInCall && (
                    <button onClick={initiateCall} className="call-btn">
                      <FaPhone /> Call
                    </button>
                  )}
                </div>
              </div>
    
              {/* Incoming Call Alert */}
              {incomingCall && (
                <div className="incoming-call-alert">
                  <div className="alert-content">
                    <p>Incoming call from {incomingCall.from}</p>
                    <button onClick={acceptCall} className="accept-btn">
                      <FaPhone /> Accept
                    </button>
                  </div>
                </div>
              )}
    
             
              <div className="maincont">
              <div className="streams-container">
                <div className="video-stream local">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="video-element"
                  />
                  {localPrediction.class && (
                    <div className="prediction-badge local">
                      <p>You: {localPrediction.class} ({(localPrediction.confidence * 100).toFixed(2)}%)</p>
                    </div>
                  )}
                </div>
                <div className="video-stream remote">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="video-element"
                  />
                  {remotePrediction.class && (
                    <div className="prediction-badge remote">
                      <p>Partner: {remotePrediction.class} ({(remotePrediction.confidence * 100).toFixed(2)}%)</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="chat-transcription-container">
                <div className="transcription-box">
                  <h3>Live ASL Transcription</h3>
                  <div className="transcription-content">
                    <div className="transcription-messages">
                      {localMessage && (
                        <div className="message-item outgoing">
                          <span className="message-label">You:</span>
                          <p>{localMessage}</p>
                        </div>
                      )}
                      {remoteMessage && (
                        <div className="message-item incoming">
                          <span className="message-label">Partner:</span>
                          <p>{remoteMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="message-actions">
                    <button onClick={sendMessage} className="send-btn">
                      Send Message
                    </button>
                  </div>
                </div>
              </div>
              </div>
    
              {/* Call Controls */}
              {isInCall && (
                <div className="call-controls">
                  <button
                    className={`control-btn ${isAudioMuted ? 'muted' : ''}`}
                    onClick={toggleAudio}
                  >
                    {isAudioMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                  </button>
                  <button
                    className={`control-btn ${isVideoOff ? 'disabled' : ''}`}
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                  </button>
                  <button
                    className="control-btn end"
                    onClick={endCall}
                  >
                    <FaPhoneSlash />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );}


export default VideoCall;