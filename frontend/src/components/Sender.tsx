import { useEffect, useState } from "react";
export const Sender = () =>{
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
         setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }
    }, []);
    const initiateConn = async () => {

        if (!socket) {
            alert("Socket not found");
            return;
        }
        const pc = new RTCPeerConnection();
        pc.onnegotiationneeded = async() =>{
            console.log("onnegotiationneeded");
            const offer = await pc.createOffer(); // setPC(pc);
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                type: 'createOffer',
                sdp: pc.localDescription
            }));

        }
       

        pc.onicecandidate = (event) => {
            console.log(event);
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        }
        
        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createAnswer') {
                await pc.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        }
        
       
       const stream = await navigator.mediaDevices.getUserMedia({ video : true, audio : false});
       pc.addTrack(stream.getVideoTracks()[0])

    }
    return <div><button onClick={initiateConn}> Send data </button></div>
}