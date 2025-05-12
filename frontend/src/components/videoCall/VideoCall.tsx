import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import io from "socket.io-client";
import { toast } from "sonner";
import {
  Loader2,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Maximize2,
  X,
} from "lucide-react";

const socket = io("https://edushare.arshadrahim.tech", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export interface VideoCallProps {
  roomId: string;
  userId: string;
  isInitiator: boolean;
  courseTitle?: string;
  onEndCall: () => void;
}

export function VideoCall({
  roomId,
  userId,
  isInitiator,
  courseTitle,
  onEndCall,
}: VideoCallProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldEndCall, setShouldEndCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "failed"
  >("connecting");
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasJoinedRoom = useRef(false);
  const hasInitializedPeer = useRef(false);
  const pendingSignals = useRef<{ signal: any; callerID: string }[]>([]);
  const candidateQueue = useRef<RTCIceCandidateInit[]>([]);

  // Toggle audio
  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        const newMuteState = !isMuted;
        audioTracks.forEach((track) => {
          track.enabled = !newMuteState;
        });
        setIsMuted(newMuteState);
      }
    }
  }, [localStream, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        const newVideoState = !isVideoOff;
        videoTracks.forEach((track) => {
          track.enabled = !newVideoState;
        });
        setIsVideoOff(newVideoState);
      }
    }
  }, [localStream, isVideoOff]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!callContainerRef.current) return;

    if (!document.fullscreenElement) {
      callContainerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error("Error attempting to exit fullscreen:", err);
        });
    }
  }, []);

  // Proper call cleanup function
  const cleanupCall = useCallback(() => {
    console.log("Cleaning up call resources");

    // Reset connection state first to hide remote video
    setIsConnected(false);
    setConnectionStatus("connecting");

    // Send disconnect signal to other party
    if (socket.connected) {
      socket.emit("disconnect_call", { roomId });
      console.log("Sent disconnect_call signal");
    }

    // Close peer connection
    if (peerRef.current) {
      try {
        peerRef.current.close();
        console.log("Closed peer connection");
      } catch (err) {
        console.error("Error closing peer connection:", err);
      }
      peerRef.current = null;
    }

    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      setLocalStream(null);
    }

    // Clean remote stream reference and hide video
    if (remoteVideoRef.current) {
      try {
        remoteVideoRef.current.pause();
        remoteVideoRef.current.srcObject = null;
        remoteVideoRef.current.currentTime = 0; // Reset video
        remoteVideoRef.current.style.display = "none"; // Hide video
        console.log("Cleared, paused, and hid remote video");
      } catch (err) {
        console.error("Error clearing remote video:", err);
      }
    }
    setRemoteStream(null);

    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log("Cleared timeout");
    }

    // Clear pending signals
    pendingSignals.current = [];
    console.log("Cleared pending signals");

    // Disconnect socket
    socket.disconnect();
    console.log("Socket disconnected");

    // Call the parent component's onEndCall handler
    onEndCall();

    // Delay modal closure to ensure UI updates
    setTimeout(() => {
      setIsDialogOpen(false);
      console.log("Closed dialog after cleanup");
    }, 100);
  }, [localStream, onEndCall, roomId]);

  // Check WebRTC support
  useEffect(() => {
    const isWebRTCSupported = !!window.RTCPeerConnection;
    console.log("WebRTC supported:", isWebRTCSupported);
    if (!isWebRTCSupported) {
      toast.error("WebRTC is not supported in this browser");
      setShouldEndCall(true);
    }
  }, []);

  // Initialize media stream
  useEffect(() => {
    let isMounted = true;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!isMounted) return;
        console.log("Media stream acquired:", stream);
        console.log("Stream tracks:", stream.getTracks());
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((err) => {
            console.error("Error playing local video:", err);
          });
          console.log("Local video set");
        }
      })
      .catch((err) => {
        console.error("Failed to get media:", err);
        toast.error("Failed to access camera or microphone: " + err.message);
        if (isMounted) {
          setShouldEndCall(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Clear timeout when connection is established
  useEffect(() => {
    if (isConnected && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      console.log("Timeout cleared due to connection established");
    }
  }, [isConnected]);

  // Handle Socket.IO and WebRTC
  useEffect(() => {
    if (!localStream) return;
    console.log("VideoCall mounted", { roomId, userId, isInitiator });

    let isMounted = true;

    // Connect to Socket.IO
    if (!socket.connected) {
      socket.connect();
    }
    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
      // Join room only if not already joined
      if (!hasJoinedRoom.current) {
        socket.emit("join room", roomId);
        console.log("Emitted join room on connect:", roomId);
        hasJoinedRoom.current = true;
      }
    });
    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err);
      toast.error("Failed to connect to call server: " + err.message);
      if (isMounted) {
        setShouldEndCall(true);
      }
    });

    // Join room only once
    if (!hasJoinedRoom.current) {
      socket.emit("join room", roomId);
      console.log("Emitted join room:", roomId);
      hasJoinedRoom.current = true;
    }

    // Set timeout for initiator
    if (isInitiator) {
      timeoutRef.current = setTimeout(() => {
        if (isConnected) {
          console.log("Timeout ignored, already connected");
          return;
        }
        console.log("Call timed out, no tutor response");
        toast.error("No tutor response, call ended");
        if (isMounted) {
          setShouldEndCall(true);
        }
      }, 45000); // 45s timeout
    }

    // Handle all users (initiator)
    socket.on("all users", (users: string[]) => {
      console.log("Received all users:", users);
      const otherUsers = users.filter((id) => id !== socket.id);
      console.log("Other users:", otherUsers);
      if (
        isInitiator &&
        otherUsers.length > 0 &&
        isMounted &&
        localStream &&
        !hasInitializedPeer.current
      ) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          console.log("Timeout cleared, tutor joined");
        }

        hasInitializedPeer.current = true;

        try {
          if (!localStream.active || localStream.getTracks().length === 0) {
            throw new Error("Invalid local stream");
          }

          const peerConnection = new RTCPeerConnection({
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
            ],
          });

          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
            console.log("Added track:", track);
          });

          peerConnection.ontrack = (event) => {
            console.log("Received remote stream:", event.streams[0]);
            console.log("Remote stream tracks:", event.streams[0].getTracks());
            event.streams[0].getTracks().forEach((track) => {
              console.log(
                `Track ${track.kind} - enabled: ${track.enabled}, readyState: ${track.readyState}`
              );
            });
            // Prevent redundant stream assignments
            if (!remoteStream || remoteStream.id !== event.streams[0].id) {
              setRemoteStream(event.streams[0]);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.style.display = "block"; // Show video
                remoteVideoRef.current
                  .play()
                  .then(() => console.log("Remote video playing"))
                  .catch((err) =>
                    console.error("Error playing remote video:", err)
                  );
                console.log("Remote video set");
              }
              setIsConnected(true);
              setConnectionStatus("connected");
            } else {
              console.log("Skipping redundant remote stream assignment");
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              console.log("Queueing ICE candidate:", event.candidate);
              candidateQueue.current.push(event.candidate);
              // Debounce sending candidates
              if (!timeoutRef.current) {
                timeoutRef.current = setTimeout(() => {
                  while (candidateQueue.current.length > 0) {
                    const candidate = candidateQueue.current.shift();
                    socket.emit("sending signal", {
                      userToSignal: otherUsers[0],
                      callerID: socket.id,
                      signal: { candidate },
                    });
                    console.log("Sent ICE candidate:", candidate);
                  }
                  timeoutRef.current = null;
                }, 100);
              }
            }
          };

          peerConnection.onconnectionstatechange = () => {
            console.log("Connection state:", peerConnection.connectionState);
            if (peerConnection.connectionState === "failed") {
              toast.error("Connection failed");
              setConnectionStatus("failed");
              setShouldEndCall(true);
            } else if (peerConnection.connectionState === "connected") {
              setConnectionStatus("connected");
            }
          };

          peerConnection
            .createOffer()
            .then((offer) => peerConnection.setLocalDescription(offer))
            .then(() => {
              console.log(
                "Emitting sending signal:",
                peerConnection.localDescription
              );
              socket.emit("sending signal", {
                userToSignal: otherUsers[0],
                callerID: socket.id,
                signal: peerConnection.localDescription,
              });
            })
            .catch((err) => {
              console.error("Error creating offer:", err);
              toast.error("Failed to initialize call");
              setShouldEndCall(true);
            });

          peerRef.current = peerConnection;
        } catch (err) {
          console.error("Failed to initialize WebRTC:", err);
          toast.error("Failed to initialize call");
          if (isMounted) {
            setShouldEndCall(true);
          }
        }
      } else {
        console.log("Skipping all users handler:", {
          isInitiator,
          otherUsersLength: otherUsers.length,
          isMounted,
          localStreamExists: !!localStream,
          hasInitializedPeer: hasInitializedPeer.current,
        });
      }
    });

    // Handle user joined (non-initiator)
    socket.on("user joined", ({ signal, callerID }) => {
      console.log("Received user joined", { callerID, signal });
      if (!isMounted || !localStream || hasInitializedPeer.current) {
        console.log("Storing pending signal", { callerID, signal });
        pendingSignals.current.push({ signal, callerID });
        return;
      }

      hasInitializedPeer.current = true;

      const processSignal = async ({
        signal,
        callerID,
      }: {
        signal: any;
        callerID: string;
      }) => {
        try {
          if (!localStream.active || localStream.getTracks().length === 0) {
            throw new Error("Invalid local stream");
          }

          const peerConnection = new RTCPeerConnection({
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
              {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
              },
            ],
          });

          localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStream);
            console.log("Added track (non-initiator):", track);
          });

          peerConnection.ontrack = (event) => {
            console.log(
              "Received remote stream (non-initiator):",
              event.streams[0]
            );
            console.log(
              "Remote stream tracks (non-initiator):",
              event.streams[0].getTracks()
            );
            event.streams[0].getTracks().forEach((track) => {
              console.log(
                `Track ${track.kind} - enabled: ${track.enabled}, readyState: ${track.readyState}`
              );
            });
            // Prevent redundant stream assignments
            if (!remoteStream || remoteStream.id !== event.streams[0].id) {
              setRemoteStream(event.streams[0]);
              if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                remoteVideoRef.current.style.display = "block"; // Show video
                remoteVideoRef.current
                  .play()
                  .then(() =>
                    console.log("Remote video playing (non-initiator)")
                  )
                  .catch((err) =>
                    console.error(
                      "Error playing remote video (non-initiator):",
                      err
                    )
                  );
                console.log("Remote video set (non-initiator)");
              }
              setIsConnected(true);
              setConnectionStatus("connected");
              // Clear pending signals after successful connection
              pendingSignals.current = [];
              console.log("Cleared pending signals after connection");
            } else {
              console.log(
                "Skipping redundant remote stream assignment (non-initiator)"
              );
            }
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              console.log(
                "Queueing ICE candidate (non-initiator):",
                event.candidate
              );
              candidateQueue.current.push(event.candidate);
              // Debounce sending candidates
              if (!timeoutRef.current) {
                timeoutRef.current = setTimeout(() => {
                  while (candidateQueue.current.length > 0) {
                    const candidate = candidateQueue.current.shift();
                    socket.emit("returning signal", {
                      signal: { candidate },
                      callerID,
                    });
                    console.log(
                      "Sent ICE candidate (non-initiator):",
                      candidate
                    );
                  }
                  timeoutRef.current = null;
                }, 100);
              }
            }
          };

          peerConnection.onconnectionstatechange = () => {
            console.log(
              "Connection state (non-initiator):",
              peerConnection.connectionState
            );
            if (peerConnection.connectionState === "failed") {
              toast.error("Connection failed");
              setConnectionStatus("failed");
              setShouldEndCall(true);
            } else if (peerConnection.connectionState === "connected") {
              setConnectionStatus("connected");
            }
          };

          // Handle SDP signal
          if (signal.type === "offer") {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(signal)
            );
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log(
              "Emitting returning signal:",
              peerConnection.localDescription
            );
            socket.emit("returning signal", {
              signal: peerConnection.localDescription,
              callerID,
            });
          } else {
            console.warn("Unexpected signal type in user joined:", signal);
          }

          peerRef.current = peerConnection;
        } catch (err) {
          console.error("Failed to initialize WebRTC (non-initiator):", err);
          toast.error("Failed to initialize call");
          if (isMounted) {
            setShouldEndCall(true);
          }
        }
      };

      processSignal({ signal, callerID });

      // Process any pending signals
      while (pendingSignals.current.length > 0) {
        const pending = pendingSignals.current.shift();
        if (pending) {
          console.log("Processing pending signal:", pending);
          processSignal(pending);
        }
      }
    });

    // Handle receiving returned signal
    socket.on("receiving returned signal", ({ signal, id }) => {
      console.log("Received returned signal from:", id, "signal:", signal);
      if (peerRef.current && isMounted) {
        try {
          if (signal.candidate) {
            // Handle ICE candidate
            peerRef.current.addIceCandidate(
              new RTCIceCandidate(signal.candidate)
            );
            console.log("Added ICE candidate:", signal.candidate);
          } else if (signal.type === "answer") {
            // Handle SDP answer
            peerRef.current.setRemoteDescription(
              new RTCSessionDescription(signal)
            );
            console.log("Set remote description (answer)");
          } else {
            console.warn("Invalid signal type received:", signal);
          }
        } catch (err) {
          console.error("Error processing returned signal:", err);
          toast.error("Failed to process signal");
          if (isMounted) {
            setShouldEndCall(true);
          }
        }
      } else {
        console.warn("No peer connection to process returned signal");
      }
    });

    // Handle call rejected
    socket.on("call_rejected", ({ message }) => {
      console.log("Call rejected:", message);
      toast.error(message);
      if (isMounted) {
        setShouldEndCall(true);
      }
    });

    // Handle remote user disconnect
    socket.on("user_disconnected", () => {
      console.log("Remote user disconnected");
      toast.info("The other participant has left the call");
      if (isMounted) {
        setShouldEndCall(true);
      }
    });

    // Cleanup
    return () => {
      console.log("VideoCall unmounting, shouldEndCall:", shouldEndCall);
      isMounted = false;
      if (shouldEndCall) {
        cleanupCall();
      }
      socket.off("all users");
      socket.off("user joined");
      socket.off("receiving returned signal");
      socket.off("call_rejected");
      socket.off("user_disconnected");
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [
    roomId,
    userId,
    isInitiator,
    localStream,
    onEndCall,
    shouldEndCall,
    remoteStream,
  ]);

  // Watch for shouldEndCall changes to trigger cleanup
  useEffect(() => {
    if (shouldEndCall) {
      cleanupCall();
    }
  }, [shouldEndCall, cleanupCall]);

  // Reset remote video visibility when isConnected changes
  useEffect(() => {
    if (!isConnected && remoteVideoRef.current) {
      remoteVideoRef.current.style.display = "none";
      console.log("Hid remote video due to isConnected false");
    }
  }, [isConnected]);

  const endCall = useCallback(() => {
    console.log("Ending call");
    setShouldEndCall(true);
  }, []);

  // Handle dialog close via the close button or ESC key
  const handleDialogClose = useCallback(() => {
    console.log("Dialog close requested");
    endCall();
    return false; // Prevent default close behavior
  }, [endCall]);

  // Get connection status badge color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-amber-500";
    }
  };

  // Get connection status text
  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "failed":
        return "Connection Failed";
      default:
        return "Connecting...";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogContent
        className="max-w-5xl p-0 overflow-hidden bg-zinc-900 text-white rounded-xl border-0"
        ref={callContainerRef}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-4 bg-zinc-800 border-b border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor()} text-white border-0 px-2 py-0.5`}
                  >
                    {getStatusText()}
                  </Badge>
                  {courseTitle && <span className="ml-2">{courseTitle}</span>}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 mt-1">
                  Room ID: {roomId.substring(0, 8)}...
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-zinc-700 text-zinc-300 border-0"
                >
                  {isInitiator ? "Student Session" : "Tutor Session"}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-zinc-700 text-zinc-300 border-0"
                >
                  {new Date().toLocaleTimeString()}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={endCall}
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 rounded-full bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Close Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </DialogHeader>

          {/* Video Area */}
          <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px] max-h-[70vh]">
            {/* Remote Video (Larger on desktop) */}
            <div
              className={`relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-lg aspect-video ${
                isConnected ? "md:col-span-1" : "md:col-span-2"
              }`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {!isConnected && (
                  <div className="flex flex-col items-center justify-center text-zinc-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-2" />
                    <p>
                      Waiting for {isInitiator ? "tutor" : "student"} to join...
                    </p>
                  </div>
                )}
              </div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover ${
                  !isConnected ? "opacity-0" : "opacity-100"
                }`}
              />
              {isConnected && (
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {isInitiator ? "Tutor" : "Student"}
                </div>
              )}
            </div>

            {/* Local Video */}
            <div
              className={`relative rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shadow-lg aspect-video ${
                isConnected ? "" : "hidden md:block"
              }`}
            >
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${
                  isVideoOff ? "opacity-0" : "opacity-100"
                }`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center">
                    <VideoOff className="w-10 h-10 text-zinc-400" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                You {isMuted && <MicOff className="w-3 h-3 text-red-500" />}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 bg-zinc-800 border-t border-zinc-700">
            <div className="flex items-center justify-center overflow-x-auto">
              <div className="flex flex-nowrap items-center gap-1 md:gap-4 lg:gap-6 min-w-fit">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleMute}
                        variant="outline"
                        size="icon"
                        className={`w-10 h-10 rounded-full md:w-12 md:h-12 lg:w-14 lg:h-14 ${
                          isMuted
                            ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50"
                            : "bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
                        }`}
                      >
                        {isMuted ? (
                          <MicOff className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                        ) : (
                          <Mic className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleVideo}
                        variant="outline"
                        size="icon"
                        className={`w-10 h-10 rounded-full md:w-12 md:h-12 lg:w-14 lg:h-14 ${
                          isVideoOff
                            ? "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/50"
                            : "bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
                        }`}
                      >
                        {isVideoOff ? (
                          <VideoOff className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                        ) : (
                          <Video className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isVideoOff ? "Turn on camera" : "Turn off camera"}
                    </TooltipContent>
                  </Tooltip>

                  <Separator
                    orientation="vertical"
                    className="h-6 bg-zinc-700 md:h-8 lg:h-10"
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleFullscreen}
                        variant="outline"
                        size="icon"
                        className="w-10 h-10 rounded-full md:w-12 md:h-12 lg:w-14 lg:h-14 bg-zinc-700 hover:bg-zinc-600 border-zinc-600"
                      >
                        <Maximize2 className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    </TooltipContent>
                  </Tooltip>

                  <Separator
                    orientation="vertical"
                    className="h-6 bg-zinc-700 md:h-8 lg:h-10"
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={endCall}
                        variant="destructive"
                        size="icon"
                        className="w-10 h-10 rounded-full md:w-12 md:h-12 lg:w-14 lg:h-14 bg-red-600 hover:bg-red-700 border-red-700"
                      >
                        <PhoneOff className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>End Call</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}