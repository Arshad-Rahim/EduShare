import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAppContext } from "@/provider/AppProvider";

interface CallRequest {
  roomId: string;
  studentId: string;
  courseId: string;
  courseTitle: string;
  timestamp: string;
}

interface CallNotificationProps {
  tutorId: string;
}

function CallNotification({ tutorId }: CallNotificationProps) {
  const { socket } = useAppContext();
  const navigate = useNavigate();
  const [callRequest, setCallRequest] = useState<CallRequest | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const activeRoomId = useRef<string | null>(null);

  const handleCallRequest = useCallback(
    (data: CallRequest) => {
      console.log("Received call request:", data);
      if (activeRoomId.current === data.roomId) {
        console.log("Ignoring duplicate call request for roomId:", data.roomId);
        return;
      }
      if (isOpen && activeRoomId.current) {
        console.log(
          "Ignoring call request; modal already open for roomId:",
          activeRoomId.current
        );
        return;
      }
      activeRoomId.current = data.roomId;
      setCallRequest(data);
      setIsOpen(true);
      toast.info(`Incoming call request for ${data.courseTitle}`);
    },
    [isOpen]
  );

  useEffect(() => {
    if (!socket || !tutorId) return;

    socket.on("call_request", handleCallRequest);

    socket.on("call_rejected", (data: { message: string }) => {
      console.log("Call rejected:", data);
      setIsOpen(false);
      setCallRequest(null);
      activeRoomId.current = null;
      toast.error(data.message);
    });

    return () => {
      socket.off("call_request", handleCallRequest);
      socket.off("call_rejected");
    };
  }, [socket, tutorId, handleCallRequest]);

  const handleAccept = useCallback(() => {
    if (!callRequest) return;
    console.log("Accepting call for room:", callRequest.roomId);
    const navigateUrl = `/tutor/courses/${callRequest.courseId}?call=${callRequest.roomId}`;
    console.log("Navigating to:", navigateUrl);
    setIsOpen(false);
    setCallRequest(null);
    activeRoomId.current = null;
    if (socket) {
      socket.off("call_request"); // Safely disable call_request events
    } else {
      console.warn("Socket is null; cannot disable call_request events");
    }
    navigate(navigateUrl);
  }, [callRequest, socket, navigate]);

  const handleReject = useCallback(() => {
    if (!callRequest) return;
    console.log("Rejecting call for room:", callRequest.roomId);
    if (socket) {
      socket.emit("call_rejected", {
        roomId: callRequest.roomId,
        tutorId,
      });
    } else {
      console.warn("Socket is null; cannot emit call_rejected");
    }
    setIsOpen(false);
    setCallRequest(null);
    activeRoomId.current = null;
    toast.info("Call rejected");
  }, [callRequest, socket, tutorId]);

  const dialogContentUI = useMemo(
    () => (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Incoming Call Request</DialogTitle>
          <DialogDescription>
            {callRequest
              ? `A student is requesting a video call for the course "${callRequest.courseTitle}".`
              : "No call request available."}
          </DialogDescription>
        </DialogHeader>
        {callRequest && (
          <div className="space-y-2">
            <p>
              <strong>Course:</strong> {callRequest.courseTitle}
            </p>
            <p>
              <strong>Student ID:</strong> {callRequest.studentId}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {new Date(callRequest.timestamp).toLocaleString()}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleAccept}>Accept</Button>
        </DialogFooter>
      </DialogContent>
    ),
    [callRequest, handleAccept, handleReject]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleReject(); // Treat dialog close as reject
        }
        setIsOpen(open);
      }}
    >
      {dialogContentUI}
    </Dialog>
  );
}

export default memo(CallNotification);
