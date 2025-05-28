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
  const [isOpen, setIsOpen] = useState(false);
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
      if (!data.courseId || !data.roomId) {
        console.error("Invalid call request data:", data);
        toast.error("Received invalid call request");
        return;
      }
      activeRoomId.current = data.roomId;
      setCallRequest(data);
      setIsOpen(true);
      toast.info(`Incoming call for ${data.courseTitle ?? "Unknown Course"}`);
    },
    [isOpen]
  );

  useEffect(() => {
    if (!socket || !tutorId) {
      console.warn("Socket or tutorId missing:", { socket: !!socket, tutorId });
      return;
    }

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
    if (!callRequest) {
      console.warn("No call request to accept");
      return;
    }
    if (!callRequest.courseId || !callRequest.roomId) {
      console.error("Invalid call request data:", callRequest);
      toast.error("Cannot accept call: Invalid course or room ID");
      setIsOpen(false);
      setCallRequest(null);
      activeRoomId.current = null;
      return;
    }
    console.log("Accepting call:", {
      courseId: callRequest.courseId,
      roomId: callRequest.roomId,
    });
    const navigateUrl = `/tutor/courses/${callRequest.courseId}?call=${callRequest.roomId}`;
    console.log("Navigating to:", navigateUrl);
    setIsOpen(false);
    setCallRequest(null);
    activeRoomId.current = null;
    if (socket) {
      socket.off("call_request");
    } else {
      console.warn("Socket is null; cannot disable call_request events");
    }
    navigate(navigateUrl);
  }, [callRequest, socket, navigate]);

  const handleReject = useCallback(() => {
    if (!callRequest) {
      console.warn("No call request to reject");
      return;
    }
    console.log("Rejecting call for room:", callRequest.roomId);
    if (socket && callRequest.roomId) {
      socket.emit("call_rejected", {
        roomId: callRequest.roomId,
        tutorId,
      });
    } else {
      console.warn("Socket or roomId is null; cannot emit call_rejected");
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
              ? `A student is requesting a video call for the course "${
                  callRequest.courseTitle ?? "Unknown Course"
                }".`
              : "No call request available."}
          </DialogDescription>
        </DialogHeader>
        {callRequest && (
          <div className="space-y-2">
            <p>
              <strong>Course:</strong> {callRequest.courseTitle ?? "N/A"}
            </p>
            <p>
              <strong>Student ID:</strong> {callRequest.studentId ?? "N/A"}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {callRequest.timestamp
                ? new Date(callRequest.timestamp).toLocaleString()
                : "N/A"}
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
          handleReject();
        }
        setIsOpen(open);
      }}
    >
      {dialogContentUI}
    </Dialog>
  );
}

export default memo(CallNotification);
