

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiCheck, FiCheckCircle, FiX } from "react-icons/fi";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import {
  getUserConversations,
  getUserMessages,
  directFileUpload,
  checkActiveBooking,
  getLatestDoctorPrescription,
  refreshToken,
} from "../../api/user/userApi";
import { message } from "antd";
// import axios from "axios";
import doodle from "../../assets/bg_print.png";
import { useLocation, useNavigate } from "react-router-dom";
import { IUserData } from "../../interfaces/user";
import { ApiError } from "../../interfaces/error";
import { ArrowLeft } from "lucide-react";
import ImageViewer from "../../sharedComponents/ImageViewer";

interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "file";
  fileName?: string;
  timestamp: string;
  readBy: string[];
  status: "sending" | "sent" | "delivered" | "read";
}

interface Conversation {
  _id: string;
  members: { _id: string; name: string; avatar: string }[]; // Standardized
}

interface ImageViewerState {
  isOpen: boolean;
  imageUrl: string;
  title: string;
  description: string;
}

const UserChat = () => {
  const user = useSelector((state: IUserData) => state.user.user);
  const userId = user?._id;
  const [doctorId, setDoctorId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [docMessage, setDocMessage] = useState<File | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const hasInitializedConversation = useRef(false);
  const [activeAppointment, setActiveAppointment] = useState<boolean>(false);
  const [isConversationListVisible, setIsConversationListVisible] = useState(true);
 const [imageViewer, setImageViewer] = useState<ImageViewerState>({
    isOpen: false,
    imageUrl: "",
    title: "",
    description: ""
  });

  const openImageViewer = (imageUrl: string, title: string, description: string = "") => {
    setImageViewer({
      isOpen: true,
      imageUrl,
      title,
      description
    });
  };

  const closeImageViewer = () => {
    setImageViewer(prev => ({ ...prev, isOpen: false }));
  };

  const getAccessToken = async () => {
    try {
      const response = await refreshToken();
      return response.accessToken;
    } catch (error) {
      console.error("Failed to fetch access token:", error);
      message.error("Session expired. Please log in again.");
      throw error;
    }
  };

  const settingCurrentChat = (c: Conversation) => {
    setCurrentChat(c);
    setIsConversationListVisible(false);
    const doctor = c.members[0]; // Assume first is doctor
    if (doctor) {
      setDoctorId(doctor._id);
    } else {
      console.error("Doctor not found in conversation members");
      setDoctorId("");
      setActiveAppointment(false);
    }
  };

  useEffect(() => {
    const conversationIdFromState = location.state?.conversationId;
    if (conversationIdFromState && userId && !hasInitializedConversation.current) {
      // setDoctorId(doctorIdFromState);
      const initializeConversation = async () => {
        try {
          setLoading(true);
          const res = await getUserConversations(userId, "Doctor");
          setConversations(res);

          const existingConversation = res.find((c: Conversation) =>
            c._id === conversationIdFromState
          );

          if (existingConversation) {
            settingCurrentChat(existingConversation);
          } else {
            // // Use api if available, or keep axios
            // const response = await axios.post(
            //   `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/user/conversation`,
            //   { userIds: [userId, doctorIdFromState] },
            //   { withCredentials: true }
            // );
            // const newConversation = response.data;
            // setConversations((prev) => [...prev, newConversation]);
            // settingCurrentChat(newConversation);
          }
          // hasInitializedConversation.current = true;
          // navigate("/chat", { replace: true, state: {} });
        } catch (error) {
          console.error("Failed to initialize conversation:", error);
          message.error("Failed to start chat with doctor.");
        } finally {
          setLoading(false);
        }
      };

      initializeConversation();
    }
  }, [location.state?.conversationId, navigate, userId]);

  useEffect(() => {
    const setupSocket = async () => {
      if (!userId) return;

      let token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("userAccessToken="))
        ?.split("=")[1];

      if (!token) {
        token = await getAccessToken();
      }

      const socket = io(
        import.meta.env.VITE_REACT_APP_SOCKET_URL || "http://localhost:3000",
        {
          transports: ["websocket"],
          reconnection: true,
          auth: { token },
        }
      );

      socketRef.current = socket;

      socket.on("connect_error", async (err) => {
        console.error("Socket connection error:", err.message);
        if (err.message.includes("Invalid or expired token")) {
          try {
            const newToken = await getAccessToken();
            socket.auth = { token: newToken };
            socket.connect();
          } catch {
            message.error("Failed to reconnect. Please log in again.");
          }
        } else {
          message.error("Failed to connect to chat server: " + err.message);
        }
      });

      socket.on("error", ({ message: errMsg }) => {
        console.error("Socket error:", errMsg);
        message.error(errMsg);
      });

      socket.emit("join", userId);

      return () => {
        socket.disconnect();
      };
    };

    setupSocket();
    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const res = await getUserConversations(userId, "Doctor");
        setConversations(res);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
        message.error("Failed to load conversations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    if (!currentChat || !socketRef.current || !doctorId) return;

    socketRef.current.emit("join", currentChat._id);

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await getUserMessages(currentChat._id);
        const active = await checkActiveBooking(userId, doctorId);
        const latestPres = await getLatestDoctorPrescription(userId, doctorId);

        let medicationPeriod = null;
        if (
          latestPres &&
          typeof latestPres.medicationPeriod === "number" &&
          latestPres.medicationPeriod > 0
        ) {
          const dy = new Date(latestPres.createdAt);
          dy.setDate(dy.getDate() + latestPres.medicationPeriod);
          medicationPeriod = dy;
        }

        setMessages(res);
        setActiveAppointment(
          (medicationPeriod && medicationPeriod > new Date()) ||
            active?.status ||
            false
        );
        socketRef.current?.emit("markSeen", {
          conversationId: currentChat._id,
        });
      } catch (err) {
        console.error("Failed to fetch messages or appointment status:", err);
        message.error("Failed to fetch messages. Please try again.");
        setActiveAppointment(false);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      socketRef.current?.emit("leave", currentChat._id);
    };
  }, [currentChat, userId, doctorId]);

  useEffect(() => {
    if (!currentChat || !socketRef.current) return;

    const socket = socketRef.current;

    const handleMessage = async(msg: Message) => {
      if (msg.conversationId === currentChat._id) {
        setMessages((prev) => {
          const tempIndex = prev.findIndex(
            (m) => m.status === "sending" && m.senderId === msg.senderId && m.content === msg.content
          );
          if (tempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempIndex] = msg;
            return newMessages;
          }
          // if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        socket.emit("markSeen", { conversationId: msg.conversationId });

        const res = await getUserConversations(userId, "Doctor");
          setConversations(res);
      }
    };

    const handleSeen = ({
      conversationId,
      userId: seenUserId,
    }: {
      conversationId: string;
      userId: string;
    }) => {
      if (conversationId === currentChat._id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.conversationId === conversationId && !msg.readBy.includes(seenUserId)
              ? { ...msg, readBy: [...msg.readBy, seenUserId], status: "read" }
              : msg
          )
        );
      }
    };

    const handleTyping = ({
      userId,
      role,
      conversationId,
    }: {
      userId: string;
      role: string;
      conversationId: string;
    }) => {
      if (currentChat._id === conversationId && userId !== userId) {
        setTypingUser(`${role} is typing...`);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000);
      }
    };

    const handleStopTyping = ({
      conversationId,
    }: {
      conversationId: string;
    }) => {
      if (currentChat._id === conversationId) {
        setTypingUser(null);
      }
    };

    socket.on("message", handleMessage);
    socket.on("messageSeen", handleSeen);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("message", handleMessage);
      socket.off("messageSeen", handleSeen);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [currentChat, userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        message.error("File size must be less than 10MB");
        return;
      }
      setDocMessage(file);
      setNewMessage("");
    }
  };

  const handleCancelFile = () => {
    setDocMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!currentChat || (!newMessage.trim() && !docMessage) || !activeAppointment) return;

    const tempId = uuidv4();
    let tempMessage: Message = {
      _id: tempId,
      conversationId: currentChat._id,
      senderId: userId,
      content: "",
      type: "text",
      timestamp: new Date().toISOString(),
      readBy: [userId],
      status: "sending",
    };

    try {
      let messageData: {
        senderId: string;
        conversationId: string;
        type: string;
        content: string;
        fileName?: string;
      };

      if (docMessage) {
        const formData = new FormData();
        formData.append("doc", docMessage);
        formData.append("location", "chatDoc");
        const uploadResult = await directFileUpload(formData);
        if (!uploadResult?.url) {
          throw new Error("Failed to upload file");
        }

        messageData = {
          senderId: userId,
          conversationId: currentChat._id,
          type: "file",
          content: uploadResult.fileKey,
          fileName: docMessage.name,
        };

        tempMessage = { ...tempMessage, content: uploadResult.url, type: "file", fileName: docMessage.name };
      } else {
        messageData = {
          senderId: userId,
          conversationId: currentChat._id,
          type: "text",
          content: newMessage,
        };

        tempMessage = { ...tempMessage, content: newMessage };
      }

      // Optimistic update
      setMessages((prev) => [...prev, tempMessage]);

      setNewMessage("");
      setDocMessage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      socketRef.current?.emit("sendMessage", messageData);

      const res = await getUserConversations(userId, "Doctor");
          setConversations(res);
    } catch (error) {
      console.error("Message send failed:", error);
      message.error(
        (error as ApiError).response?.data?.message || "Failed to send message"
      );
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const handleTyping = () => {
    if (!currentChat || !socketRef.current) return;
    socketRef.current.emit("typing", { conversationId: currentChat._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stopTyping", {
        conversationId: currentChat._id,
      });
    }, 3000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateHeader = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const needsDateHeader = (currentMsg: Message, prevMsg?: Message) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).setHours(0, 0, 0, 0);
    const prevDate = new Date(prevMsg.timestamp).setHours(0, 0, 0, 0);
    return currentDate !== prevDate;
  };

  return (
    <div className="flex h-screen bg-gray-50 md:h-[calc(100vh-4rem)]">
      {/* Conversation List */}
      <div
        className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 md:transition-none ${
          isConversationListVisible
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } md:flex fixed md:static top-0 left-0 h-full z-20`}
      >
        <div className="p-4 sm:p-5 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Conversations
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 sm:p-5 text-gray-500 text-sm sm:text-base">
              Loading conversations...
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {conversations.map((c) => {
                const m = c.members[0];
                return (
                  <li
                    key={c._id}
                    className={`p-4 sm:p-5 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                      currentChat?._id === c._id ? "bg-green-50" : ""
                    }`}
                    onClick={() => settingCurrentChat(c)}
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {m.name}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div
        className={`flex-1 flex flex-col transition-transform duration-300 md:transition-none ${
          isConversationListVisible && currentChat
            ? "-translate-x-full md:translate-x-0"
            : "translate-x-0"
        } md:flex fixed md:static top-0 left-0 w-full h-full z-10 bg-gray-50`}
      >
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 sticky top-0 z-10 shadow-sm">
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all"
                onClick={() => setIsConversationListVisible(true)}
              >
                <ArrowLeft size={20} />
              </button>
              <img
                src={currentChat.members[0].avatar || "Unknown User"}
                alt={currentChat.members[0].name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200"
              />
              <div className="flex-1">
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {currentChat.members[0].name}
                </p>
                {typingUser && (
                  <p className="text-xs sm:text-sm text-green-600">
                    {typingUser}
                  </p>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto p-4 sm:p-6"
              style={{
                backgroundImage: `url(${doodle})`,
                backgroundSize: "300px sm:400px",
                backgroundRepeat: "repeat",
                backgroundColor: "rgba(245, 245, 245, 0.9)",
              }}
            >
              {loading ? (
                <div className="text-center text-gray-500 text-sm sm:text-base">
                  Loading messages...
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index}>
                      {needsDateHeader(msg, messages[index - 1]) && (
                        <div className="text-center my-4 sm:my-6">
                          <span className="inline-block bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full">
                            {formatDateHeader(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          msg.senderId === userId
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`relative max-w-[70%] sm:max-w-[60%] p-3 sm:p-4 rounded-lg shadow-md ${
                            msg.senderId === userId
                              ? "bg-green-500 text-white"
                              : "bg-white text-gray-900"
                          } ${msg.status === "sending" ? "opacity-70" : ""}`}
                        >
                          <div
                            className={`absolute top-2 ${
                              msg.senderId === userId ? "-right-2" : "-left-2"
                            } w-0 h-0 border-t-8 border-t-transparent ${
                              msg.senderId === userId
                                ? "border-l-8 border-l-green-500"
                                : "border-r-8 border-r-white"
                            } border-b-8 border-b-transparent`}
                          />
                          {msg.type === "file" ? (
                            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer"
                              onClick={() => openImageViewer(
                                msg.content,
                                "Myhealth-Chat document",
                                `Time: ${formatDateHeader(msg.timestamp)},${formatMessageTime(msg.timestamp)} `
                              )}
                              >
                              <IoDocumentAttachOutline className="text-lg sm:text-xl" />
                              <a
                               
                              
                                rel="noopener noreferrer"
                                className="text-sm sm:text-base underline truncate max-w-[200px] sm:max-w-[300px]"
                              >
                                {msg.fileName || "Document"}
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm sm:text-base break-words">
                              {msg.content}
                            </p>
                          )}
                          <div className="flex items-center justify-end mt-1 sm:mt-2 gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm text-gray-300">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                            {msg.senderId === userId && (
                              <span className="flex items-center">
                                {msg.status === "read" ? (
                                  <FiCheckCircle
                                    className="text-blue-500"
                                    size={14}
                                  />
                                ) : msg.status === "delivered" || msg.status === "sent" ? (
                                  <FiCheck
                                    className="text-gray-300"
                                    size={14}
                                  />
                                ) : null}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            {activeAppointment ? (
              <div className="bg-white border-t border-gray-200 p-4 sm:p-5 flex items-center gap-2 sm:gap-3 sticky bottom-0 z-10">
                <input
                  id="docMessageInput"
                  type="file"
                  name="docMessage"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="docMessageInput"
                  className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                >
                  <IoDocumentAttachOutline className="text-xl sm:text-2xl" />
                </label>

                {docMessage ? (
                  <div className="flex items-center flex-1 gap-2 sm:gap-3">
                    <div className="flex items-center bg-gray-100 rounded-lg px-2 sm:px-3 py-1.5 flex-1">
                      <IoDocumentAttachOutline className="text-gray-500 text-sm sm:text-base" />
                      <span className="text-xs sm:text-sm text-gray-700 ml-1 sm:ml-2 truncate max-w-[150px] sm:max-w-[200px]">
                        {docMessage.name}
                      </span>
                      <button
                        onClick={handleCancelFile}
                        className="ml-1 sm:ml-2 text-red-500 hover:text-red-700"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      className={`p-2 sm:p-3 rounded-full ${
                        loading
                          ? "text-gray-400"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      } transition-all disabled:opacity-50 min-w-[44px] min-h-[44px]`}
                      disabled={loading}
                    >
                      <FiSend className="text-xl sm:text-2xl" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type a message..."
                      className="flex-1 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendMessage}
                      className={`p-2 sm:p-3 rounded-full ${
                        loading || !newMessage.trim()
                          ? "text-gray-400"
                          : "text-green-600 hover:text-green-700 hover:bg-green-50"
                      } transition-all disabled:opacity-50 min-w-[44px] min-h-[44px]`}
                      disabled={loading || !newMessage.trim()}
                    >
                      <FiSend className="text-xl sm:text-2xl" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white border-t border-gray-200 p-4 sm:p-5 sticky bottom-0 z-10">
                <p className="text-xs sm:text-sm text-gray-500 text-center">
                  You can send messages only for active appointments or if you
                  are in medication period.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50 text-sm sm:text-base">
            Select a conversation to begin chatting
          </div>
        )}
      </div>



      <ImageViewer
              isOpen={imageViewer.isOpen}
              onClose={closeImageViewer}
              imageUrl={imageViewer.imageUrl}
              title={imageViewer.title}
              description={imageViewer.description}
            />

            
    </div>
  );
};

export default UserChat;