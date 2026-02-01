import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUserMessage, addBotMessage, setMessages } from "../store/chatSlice";
import { useAuth } from "../context/AuthContext";
import { useSendMessageMutation } from "../slices/apiSlice";
import { AnimatePresence, motion } from "framer-motion";

// --- Styled Components / Sub-components ---

const BotIcon = () => (
  <div className="w-8 h-8 rounded-xl bg-[#1a1c23] border border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
      <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M12 8v4" />
      <path d="M12 14v8" />
      <path d="M8 14h8" />
      <path d="M16 18h2a2 2 0 0 1 2 2" />
      <path d="M8 18H6a2 2 0 0 0-2 2" />
    </svg>
  </div>
);

const UserIcon = ({ letter = "U" }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg flex-shrink-0">
    {letter}
  </div>
);

const MessageBubble = ({ message, userInitial }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6 group`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar */}
        <div className="mt-1">
          {isUser ? <UserIcon letter={userInitial} /> : <BotIcon />}
        </div>

        {/* Bubble */}
        <div className={`
                    relative p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${!isUser
            ? "bg-[#1f2129]/80 backdrop-blur-md border border-white/5 text-slate-200 rounded-tl-none hover:bg-[#252830]/90 transition-colors"
            : "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-cyan-900/20 shadow-lg"}
                `}>
          {message.text}

          {/* Timestamp */}
          <div className={`
                        absolute -bottom-5 text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium tracking-wide
                        ${!isUser ? "left-0" : "right-0"}
                    `}>
            Just now
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ChatInterface = ({ documentName }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token, user, logout } = useAuth();
  const [sendMessage] = useSendMessageMutation();

  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Sync with Auth Context
  useEffect(() => {
    if (!user || !user.messages) {
      if (messages.length > 0) dispatch(setMessages([]));
      return;
    }

    const formatted = user.messages.map((m, i) => ({
      id: i + 1,
      text: m.content,
      sender: m.role.toLowerCase() === "ai" ? "bot" : "user",
    }));

    // Prevent redundant updates
    if (JSON.stringify(formatted) !== JSON.stringify(messages)) {
      dispatch(setMessages(formatted));
    }
  }, [user, dispatch]); // Removed messages from dep to avoid loops, rely on logic

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    // 1. Optimistic Update
    const optimisticMessage = { id: Date.now(), text, sender: "user" };
    // dispatch(addUserMessage(text)); // Let's wait for logic or dispatch immediately? 
    // The previous logic dispatched immediately, let's stick to that for responsiveness
    dispatch(addUserMessage(text));

    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage({ question: text }).unwrap();
      dispatch(addBotMessage(response.answer));
    } catch (err) {
      if (err.status === 401 || err.status === 402) {
        dispatch(setMessages([]));
        dispatch(addBotMessage("⚠️ Session expired. Please sign in again."));
        logout && logout();
      } else {
        dispatch(addBotMessage("Error: Could not get response"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sendMessage, dispatch, logout]);

  return (
    <div className="flex flex-col h-full w-full relative">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end pb-4">

          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-200 opacity-60 select-none -mt-12">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-400">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-300">
                {documentName ? `Ask about "${documentName}"` : "Welcome to DocuChat"}
              </h3>
              <p className="text-xs text-slate-500 mt-2 max-w-xs text-center leading-relaxed">
                Upload a document to the left to get started, or just say hello!
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} userInitial={user?.name?.[0]} />
              ))}
            </AnimatePresence>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start mb-6 w-full"
            >
              <div className="flex items-center gap-4">
                <BotIcon />
                <div className="bg-[#1f2129]/80 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 md:p-6 bg-[#0f1115]/80 backdrop-blur-xl border-t border-white/5 relative z-20">
        <div className="max-w-4xl mx-auto w-full relative group">

          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex items-center gap-2 bg-[#13151b] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:ring-1 focus-within:ring-cyan-500/30 focus-within:border-cyan-500/50 transition-all duration-300">

            <input
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm md:text-base h-full py-2.5 px-3"
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />

            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading} // Fixed logic: disabled if empty OR loading
              className={`
                  p-3 rounded-xl transition-all duration-300 flex-shrink-0
                  ${input.trim() && !isLoading
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95"
                  : "bg-white/5 text-slate-500 cursor-not-allowed"}
                `}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          <div className="text-center mt-3">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-semibold">
              AI Generated Content
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
