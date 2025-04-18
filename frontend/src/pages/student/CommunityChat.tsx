import { useState, useRef, useEffect } from "react";
import { Send, Menu, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "./components/Header";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Community {
  id: number;
  name: string;
  course: string;
  messages: Message[];
  members?: number;
  activeNow?: number;
}

// Static data
const staticCommunities: Community[] = [
  {
    id: 1,
    name: "JavaScript Basics Community",
    course: "JavaScript Fundamentals",
    members: 128,
    activeNow: 23,
    messages: [
      {
        id: 1,
        sender: "Alice Smith",
        content:
          "Hey everyone! Just finished the first module. Any tips for the quiz? 📚",
        timestamp: "2025-04-18 09:00 AM",
        status: "read",
      },
      {
        id: 2,
        sender: "Bob Johnson",
        content:
          "Hi Alice! Make sure to review the array methods section. It's key! 🔑",
        timestamp: "2025-04-18 09:15 AM",
        status: "read",
      },
      {
        id: 3,
        sender: "Charlie Brown",
        content:
          "I found the video on loops really helpful. Anyone else struggling with callbacks? 🤔",
        timestamp: "2025-04-18 10:00 AM",
        status: "delivered",
      },
    ],
  },
  {
    id: 2,
    name: "Python for Beginners",
    course: "Python Essentials",
    members: 95,
    activeNow: 15,
    messages: [
      {
        id: 1,
        sender: "Diana Lee",
        content: "Just started the course! Any advice on Python basics? 🐍",
        timestamp: "2025-04-18 10:30 AM",
        status: "read",
      },
      {
        id: 2,
        sender: "Eve Carter",
        content:
          "Try practicing with small scripts. The exercises in module 2 are great! 💻",
        timestamp: "2025-04-18 10:45 AM",
        status: "delivered",
      },
    ],
  },
];

export function CommunityChat() {
  const [selectedCommunity, setSelectedCommunity] = useState<Community>(
    staticCommunities[0]
  );
  const [messages, setMessages] = useState<Message[]>(
    staticCommunities[0].messages
  );
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setMessages(community.messages);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: "You",
        content: newMessage,
        timestamp: new Date().toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
        status: "sent",
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

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
      <Header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" />
      <div className="flex flex-1 pt-0">
        {" "}
        <aside
          className={cn(
            "fixed top-16 left-0 w-80 bg-white shadow-lg border-r", // top-16 to start below header
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
            {" "}
            {/* Adjust for header and sidebar header */}
            {staticCommunities.map((community) => (
              <div
                key={community.id}
                className={cn(
                  "p-4 cursor-pointer transition-colors duration-200",
                  "hover:bg-indigo-50 border-b border-gray-100",
                  selectedCommunity.id === community.id && "bg-indigo-50"
                )}
                onClick={() => handleSelectCommunity(community)}
              >
                <h3 className="font-semibold text-gray-800">
                  {community.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{community.course}</p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <span>{community.members} members</span>
                  <span className="mx-2">•</span>
                  <span className="text-emerald-500">
                    {community.activeNow} active now
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
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
                  {selectedCommunity.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedCommunity.course}
                </p>
              </div>
            </div>
            <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              {selectedCommunity.activeNow} active now
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="absolute inset-0 overflow-y-auto px-6 py-4">
              <div className="max-w-4xl mx-auto space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex w-full gap-2 items-end animate-fade-in",
                      message.sender === "You" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-md rounded-2xl p-4 shadow-md",
                        "transform transition-all duration-200 hover:scale-[1.01]",
                        message.sender === "You"
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
                            message.sender === "You"
                              ? "text-indigo-100"
                              : "text-gray-400"
                          )}
                        >
                          {formatTimestamp(message.timestamp)}
                          {message.sender === "You" && message.status && (
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
                      <p className="text-[15px] leading-relaxed">
                        {message.content}
                      </p>
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
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
