import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Send, Menu, Check, CheckCheck, Image, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./components/Header";
import { io, Socket } from "socket.io-client";
import { courseService } from "@/services/courseService";
import { profileService } from "@/services/userService/profileService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  _id?: string;
  sender: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  imageUrl?: string;
}

interface Community {
  id: string;
  name: string;
  course: string;
  messages: Message[];
  members?: number;
  activeNow?: number;
}

export function CommunityChat() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userId, setUserId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useSelector((state: any) => state.user.userDatas);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await profileService.userDetails();
        setUserName(
          response.data.users.name ||
            `User_${Math.random().toString(36).substring(7)}`
        );
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        setUserName(`User_${Math.random().toString(36).substring(7)}`);
      }
    };
    if (user) {
      fetchUserDetails();
    }
  }, [user]);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const enrolledCourses = await courseService.getEnrolledCourses();
        const newCommunities: Community[] = enrolledCourses.map(
          (course: any) => ({
            id: course._id,
            name: `${course.title} Community`,
            course: course.title,
            messages: [],
            members: course.enrollments || 100,
            activeNow: Math.floor(Math.random() * 20) + 5,
          })
        );
        setCommunities(newCommunities);
        if (newCommunities.length > 0) {
          setSelectedCommunity(newCommunities[0]);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        toast.error("Failed to load communities");
      }
    };
    if (user) {
      fetchCommunities();
    }
  }, [user]);

  useEffect(() => {
    setUserId(user?.id ? user.id : user?._id || "");
    if (!userId) {
      console.error("No user ID available");
      return;
    }

    socketRef.current = io("https://edushare.arshadrahim.tech", {
      reconnection: true,
    });

    if (selectedCommunity) {
      socketRef.current.emit("join_community", selectedCommunity.id);

      socketRef.current.on("message_history", (history: Message[]) => {
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

      socketRef.current.on("receive_message", (message: Message) => {
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
    }

    return () => {
      socketRef.current?.off("message_history");
      socketRef.current?.off("receive_message");
      socketRef.current?.disconnect();
    };
  }, [selectedCommunity?.id, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setMessages([]);
    setIsSidebarOpen(false);
    socketRef.current?.emit("join_community", community.id);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && userId && selectedCommunity && userName) {
      const newMsg: Message = {
        sender: userName,
        content: newMessage,
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      socketRef.current?.emit("send_message", {
        communityId: selectedCommunity.id,
        message: newMsg,
      });
      console.log("USERID IN FRONTEND", userId);
      // Emit notification for enrolled users
      socketRef.current?.emit("send_notification", {
        communityId: selectedCommunity.id,
        courseTitle: selectedCommunity.course,
        message: newMsg,
        senderId: userId,
      });
      setNewMessage("");
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userId && selectedCommunity && userName) {
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
        socketRef.current?.emit("send_image_message", {
          communityId: selectedCommunity.id,
          message: newMsg,
          image: {
            data: reader.result,
            name: file.name,
            type: file.type,
          },
          senderId: userId,
        });
        // Emit notification for enrolled users
        socketRef.current?.emit("send_notification", {
          communityId: selectedCommunity.id,
          courseTitle: selectedCommunity.course,
          message: { ...newMsg, content: "Sent an image" },
          senderId: userId,
        });
      };
      reader.readAsDataURL(file);
      event.target.value = ""; // Reset file input
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
        <p className="text-slate-600">Please log in to view communities</p>
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
      <Header />
      <div className="flex flex-1 pt-0">
        <aside
          className={cn(
            "fixed top-16 left-0 w-80 bg-white shadow-lg border-r",
            "transform transition-transform duration-300 ease-in-out z-40",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:static md:translate-x-0 md:top-0"
          )}
        >
          <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Learning Communities
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Connect & Learn Together
            </p>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-12rem)]">
            {communities.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No communities yet</p>
              </div>
            ) : (
              communities.map((community) => (
                <div
                  key={community.id}
                  className={cn(
                    "p-4 cursor-pointer transition-colors duration-200",
                    "hover:bg-indigo-50 border-b border-gray-100",
                    selectedCommunity?.id === community.id && "bg-indigo-50"
                  )}
                  onClick={() => handleSelectCommunity(community)}
                >
                  <h3 className="font-semibold text-gray-800">
                    {community.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {community.course}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <span>{community.members} members</span>
                    <span className="mx-2">•</span>
                    <span className="text-emerald-500">
                      {community.activeNow} active now
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          {communities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <Card className="max-w-md w-full shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <Users className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    No Communities Yet
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-lg">
                    Enroll in a course to join its community and start
                    collaborating!
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-4">
                  <button
                    className="md:hidden text-gray-600 hover:text-gray-900"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">
                      {selectedCommunity?.name || "Select a Community"}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {selectedCommunity?.course || ""}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  {selectedCommunity?.activeNow || 0} active now
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
                            "transform transition-all duration-200 hover:scale-[1.01]",
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
                                "text-xs ml-2 flex items-center gap-1",
                                message.sender === userName
                                  ? "text-indigo-100"
                                  : "text-gray-400"
                              )}
                            >
                              {formatTimestamp(message.timestamp)}
                              {message.sender === userName &&
                                message.status && (
                                  <span className="ml-1">
                                    {message.status === "delivered" ? (
                                      <Check className="h-3 w-3" />
                                    ) : message.status === "read" ? (
                                      <CheckCheck className="h-3 w-3" />
                                    ) : null}
                                  </span>
                                )}
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
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
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
                        "transition-all duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      )}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
