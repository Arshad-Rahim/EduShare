"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import io from "socket.io-client";
import { toast } from "sonner";
import { authAxiosInstance } from "@/api/authAxiosInstance";

interface AppContextType {
  socket: any; // Socket.IO client type (use specific type if available)
  tutorId: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider = ({ children }: { children: ReactNode }) => {
  const [socket] = useState(() =>
    io("http://localhost:3000", {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  );
  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAxiosInstance.get("/tutors/me");
        console.log("Fetched user:", response.data);
        if (response.data.tutor?.role === "tutor") {
          setTutorId(response.data.tutor._id);
          console.log("Set tutorId:", response.data.tutor._id);
        } else {
          console.log("User is not a tutor, role:", response.data.tutor?.role);
          setTutorId(null);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setTutorId(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (tutorId) {
      socket.connect();
      socket.on("connect", () => {
        console.log("Socket.IO connected:", socket.id);
        socket.emit("join_user", tutorId);
        console.log("Emitted join_user:", tutorId);
      });
      socket.on("connect_error", (err) => {
        console.error("Socket.IO connection error:", err);
        toast.error("Failed to connect to call server: " + err.message);
      });

      return () => {
        socket.off("connect");
        socket.off("connect_error");
        socket.disconnect();
      };
    }
  }, [tutorId, socket]);

  return (
    <AppContext.Provider value={{ socket, tutorId }}>
      <ThemeProvider>{children}</ThemeProvider>
    </AppContext.Provider>
  );
};

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export default AppProvider;
