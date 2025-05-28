import { useEffect, useState, useRef } from "react";
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

export function CallNotification({ tutorId }: CallNotificationProps) {
  const { socket } = useAppContext();
  const navigate = useNavigate();
  const [callRequest, setCallRequest] = useState<CallRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const activeRoomId = useRef<string | null>(null); // Track active roomId to deduplicate

  useEffect(() => {
    if (!socket || !tutorId) return;

    const handleCallRequest = (data: CallRequest) => {
      console.log("Received call request:", data);
      // Ignore if same roomId is already active
      if (activeRoomId.current === data.roomId) {
        console.log("Ignoring duplicate call request for roomId:", data.roomId);
        return;
      }
      // Ignore if modal is already open for a different roomId
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
    };

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
  }, [socket, tutorId, isOpen]);

  const handleAccept = () => {
    if (!callRequest) return;
    console.log("Accepting call for room:", callRequest.roomId);
    const navigateUrl = `/tutor/courses/${callRequest.courseId}?call=${callRequest.roomId}`;
    console.log("Navigating to:", navigateUrl);
    setIsOpen(false);
    setCallRequest(null);
    activeRoomId.current = null; // Clear active roomId
    socket.off("call_request"); // Disable further call_request events
    navigate(navigateUrl);
  };

  const handleReject = () => {
    if (!callRequest) return;
    console.log("Rejecting call for room:", callRequest.roomId);
    socket.emit("call_rejected", {
      roomId: callRequest.roomId,
      tutorId,
    });
    setIsOpen(false);
    setCallRequest(null);
    activeRoomId.current = null; // Clear active roomId
    toast.info("Call rejected");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReject(); // Treat dialog close as reject
      }
      setIsOpen(open);
    }}>
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
    </Dialog>
  );
}