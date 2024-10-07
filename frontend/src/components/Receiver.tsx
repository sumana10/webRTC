import { useEffect, useRef } from "react";

export const Receiver = () =>{
    const videoRef = useRef<HTMLVideoElement>(null)
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        // setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        socket.onmessage = async(event) => {
            const message = JSON.parse(event.data);
            let pc: RTCPeerConnection | null = null;
            if (message.type === 'createOffer') {
            pc = new RTCPeerConnection();
            pc.setRemoteDescription(message.sdp);
            pc.onicecandidate = (event) => {
                console.log(event.candidate);
                if (event.candidate) {
                    socket?.send(JSON.stringify({
                        type: 'iceCandidate',
                        candidate: event.candidate
                    }));
                }
            }
          
            pc.ontrack = (event) => {
                const video = document.createElement('video');
                document.body.appendChild(video);
              
                video.srcObject = new MediaStream([event.track]);
                video.setAttribute("playsinline", "true"); 
                video.controls = true; 
                video.play().catch((error) => {
                  if (error.name === "NotAllowedError") {
                    console.log("Playback was blocked due to autoplay restrictions. Waiting for user interaction...");
                  } else {
                    console.error("Error playing video:", error);
                  }
                });
              };
              
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.send(JSON.stringify({
                type: 'createAnswer',
                sdp: answer
            }));
        }else if(message.type === 'iceCandidate'){
          // const pc = new RTCPeerConnection();
          
          if(pc !== null){
            //@ts-ignore
            pc.addIceCandidate(message.candidate);
          }
        }
        }
    }, []);
    return <div>Receiver</div>
}