import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Send, Image, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { io, Socket } from "socket.io-client";
import { profileService } from "@/services/userService/profileService";
import { tutorService } from "@/services/tutorService/tutorService";
import { toast } from "sonner";
import { Header } from "@/pages/student/components/Header"; // Student header
import { Header as TutorHeader } from "@/pages/tutor/components/Header"; // Tutor header
import { SideBar } from "@/pages/tutor/components/SideBar"; // Tutor sidebar

interface Message {
  _id?: string;
  sender: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  imageUrl?: string;
}

interface PrivateChatProps {
  studentId: string;
  tutorId: string;
  courseId: string;
  courseTitle: string;
}

export function PrivateChat() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId: paramCourseId, studentId: paramStudentId } = useParams<{
    courseId: string;
    studentId?: string;
  }>();
  const {
    studentId: stateStudentId,
    tutorId: stateTutorId,
    courseId: stateCourseId,
    courseTitle,
  } = (location.state as PrivateChatProps) || {};
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState<string>("");
  const [tutorName, setTutorName] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useSelector((state: any) => state.user.userDatas);
  const [isTutor, setIsTutor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Updated to include setter, default to false for mobile

  const courseId = stateCourseId || paramCourseId;
  const studentId = stateStudentId || paramStudentId;
  const tutorId = stateTutorId || user?._id || user?.id;

  useEffect(() => {
    console.log("PrivateChat location.state:", location.state);
    console.log("PrivateChat params:", { courseId, studentId, tutorId });
  }, [location.state, courseId, studentId, tutorId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        let userResponse;
        try {
          userResponse = await tutorService.tutorDetails();
          setIsTutor(true);
        } catch (error) {
          userResponse = await profileService.userDetails();
          setIsTutor(false);
        }
        setUserName(
          userResponse.data.tutor?.name ||
            userResponse.data.users?.name ||
            "User"
        );
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        setUserName("User");
      }
    };

    const fetchTutorDetails = async () => {
      if (!tutorId) return;
      try {
        const response = await profileService.getUserById(tutorId);
        setTutorName(response.data.name || "Tutor");
      } catch (error) {
        console.error("Failed to fetch tutor details:", error);
        setTutorName("Tutor");
      }
    };

    const fetchStudentDetails = async () => {
      if (!studentId) return;
      try {
        const response = await profileService.getUserById(studentId);
        setStudentName(response.data.name || "Student");
      } catch (error) {
        console.error("Failed to fetch student details:", error);
        setStudentName("Student");
      }
    };

    if (user) {
      fetchUserDetails();
      fetchTutorDetails();
      fetchStudentDetails();
    }
  }, [user, tutorId, studentId]);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to access the chat");
      navigate("/login");
      return;
    }

    if (!studentId || !tutorId || !courseId) {
      toast.error("Invalid chat configuration. Please try again.");
      console.error("Missing chat configuration:", {
        studentId,
        tutorId,
        courseId,
      });
      navigate(-1);
      return;
    }

    socketRef.current = io("https://edushare.arshadrahim.tech", {
      reconnection: true,
    });

    socketRef.current.emit("join_private_chat", {
      courseId,
      studentId,
      tutorId,
    });

    socketRef.current.on("private_message_history", (history: Message[]) => {
      setMessages(
        history.map((msg) => ({
          _id: msg._id,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          status: msg.status,
          imageUrl: msg.imageUrl,
        }))
      );
    });

    socketRef.current.on("receive_private_message", (message: Message) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: message._id,
          sender: message.sender,
          content: message.content,
          timestamp: message.timestamp,
          status: message.status,
          imageUrl: message.imageUrl,
        },
      ]);
    });

    return () => {
      socketRef.current?.off("private_message_history");
      socketRef.current?.off("receive_private_message");
      socketRef.current?.disconnect();
    };
  }, [studentId, tutorId, courseId, navigate, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && studentId && tutorId && courseId && userName) {
      const newMsg: Message = {
        sender: userName,
        content: newMessage,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      socketRef.current?.emit("send_private_message", {
        courseId,
        studentId,
        tutorId,
        message: newMsg,
      });
      setNewMessage("");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && studentId && tutorId && courseId && userName) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const newMsg: Message = {
          sender: userName,
          content: "",
          timestamp: new Date().toISOString(),
          status: "sent",
        };
        socketRef.current?.emit("send_private_image_message", {
          courseId,
          studentId,
          tutorId,
          message: newMsg,
          image: {
            data: reader.result,
            name: file.name,
            type: file.type,
          },
          senderId: isTutor ? tutorId : studentId,
        });
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-slate-600">Please log in to access the chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}
      </style>
      {isTutor ? (
        <TutorHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      ) : (
        <Header />
      )}
      <div className="flex flex-1">
        {isTutor && (
          <div className="w-full md:w-64 flex-shrink-0">
            <SideBar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        )}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            isTutor && sidebarOpen ? "md:ml-64" : ""
          }`}
        >
          <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Chat with {isTutor ? studentName : tutorName} (
                  {courseTitle || "Unknown Course"})
                </h1>
                <p className="text-sm text-gray-500">Private Conversation</p>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="absolute inset-0 overflow-y-auto px-6 py-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={cn(
                      "flex w-full gap-2 items-end animate-fade-in",
                      message.sender === userName
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-md rounded-2xl p-4 shadow-md",
                        message.sender === userName
                          ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm"
                      )}
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-medium text-sm">
                          {message.sender}
                        </span>
                        <span
                          className={cn(
                            "text-xs ml-2",
                            message.sender === userName
                              ? "text-indigo-100"
                              : "text-gray-400"
                          )}
                        >
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      {message.imageUrl ? (
                        <img
                          src={message.imageUrl}
                          alt="Uploaded image"
                          className="max-w-full h-auto rounded-lg mt-2"
                        />
                      ) : (
                        <p className="text-[15px] leading-relaxed">
                          {message.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </main>

          <div className="bg-white border-t p-4 shadow-sm">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "p-3 rounded-full",
                    "bg-gray-200 text-gray-600",
                    "hover:bg-gray-300",
                    "transition-all duration-200"
                  )}
                >
                  <Image className="h-5 w-5" />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className={cn(
                    "flex-1 px-4 py-3 rounded-full",
                    "bg-gray-100 border border-gray-200",
                    "focus:ring-2 focus:ring-indigo-500 focus:outline-none",
                    "placeholder-gray-400 text-gray-800 transition-all duration-200"
                  )}
                />
                <button
                  onClick={handleSendMessage}
                  className={cn(
                    "p-3 rounded-full",
                    "bg-gradient-to-r from-indigo-500 to-purple-600",
                    "text-white shadow-md",
                    "hover:from-indigo-600 hover:to-purple-700",
                    "transition-all duration-200"
                  )}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
