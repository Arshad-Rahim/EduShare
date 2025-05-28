"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";

// Define types for type safety
interface TutorResponse {
  tutor: {
    _id: string;
    role: "tutor" | string;
    [key: string]: unknown;
  } | null;
}

interface RootState {
  user: {
    userDatas: { id: string } | null; // Adjust based on your Redux state
  };
}

interface AppContextType {
  socket: Socket | null;
  tutorId: string | null;
}

// Constants for configuration
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "https://edushare.arshadrahim.tech";
const ROLES = {
  TUTOR: "tutor" as const,
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Provides application-wide context for Socket.IO and tutor ID.
 * @param children - The child components to render.
 */
const AppProvider = ({ children }: { children: ReactNode }) => {
  // Initialize socket with memoized configuration
  const socket = useMemo(
    () =>
      io(SOCKET_URL, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }),
    []
  );

  const [tutorId, setTutorId] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user.userDatas);

  // Fetch tutor data when user changes
  const fetchUser = useCallback(async () => {
    if (!user) {
      setTutorId(null);
      return;
    }

    try {
      const response = await authAxiosInstance.get<TutorResponse>("/tutors/me");
      const tutor = response.data.tutor;
      if (tutor?.role === ROLES.TUTOR) {
        setTutorId(tutor._id);
        console.log("Set tutorId:", tutor._id);
      } else {
        console.log("User is not a tutor, role:", tutor?.role);
        setTutorId(null);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Failed to fetch tutor:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      setTutorId(null);
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Manage socket connection
  useEffect(() => {
    if (!tutorId) {
      socket.disconnect();
      return;
    }

    socket.connect();

    const onConnect = () => {
      console.log("Socket.IO connected:", socket.id);
      socket.emit("join_user", tutorId);
      console.log("Emitted join_user:", tutorId);
    };

    const onConnectError = (err: Error) => {
      console.error("Socket.IO connection error:", {
        message: err.message,
      });
      toast.error(`Failed to connect to call server: ${err.message}`);
    };

    const onReconnectAttempt = (attempt: number) => {
      console.log(`Socket.IO reconnection attempt ${attempt}`);
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("reconnect_attempt", onReconnectAttempt);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.disconnect();
    };
  }, [tutorId, socket]);

  return (
    <AppContext.Provider value={{ socket, tutorId }}>
      <ThemeProvider>{children}</ThemeProvider>
    </AppContext.Provider>
  );
};

/**
 * Hook to access the application context.
 * @returns The AppContextType containing socket and tutorId.
 * @throws Error if used outside AppProvider.
 */
export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export default AppProvider;
