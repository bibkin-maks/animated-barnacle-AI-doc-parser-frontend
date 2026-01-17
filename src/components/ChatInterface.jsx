import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUserMessage, addBotMessage, setMessages } from "../store/chatSlice";
import { useAuth } from "../context/AuthContext";


import { useSendMessageMutation } from "../slices/apiSlice";


const ChatInterface = ({ documentName }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token, user } = useAuth(); // added logout (optional)

  const [sendMessage, { isSending, sendingErr }] = useSendMessageMutation();

  const chatRef = useRef(null);

  useEffect(() => {
    if (!user) {
      // user logged out
      dispatch(setMessages([]));
      return;
    }

    if (!user.messages) {
      dispatch(setMessages([]));
      return;
    }

    const formatted = user.messages.map((m, i) => ({
      id: i + 1,
      text: m.content,
      sender: m.role.toLowerCase() === "ai" ? "bot" : "user",
    }));

    const reduxCount = messages.length;
    const dbCount = formatted.length;

    // 🟢 Detect account switch
    if (messages.length > 0 && user._id !== window.lastUserId) {
      dispatch(setMessages(formatted));
    }

    // 🟢 Detect DB updates
    if (reduxCount !== dbCount) {
      dispatch(setMessages(formatted));
    }

    // Save last used account
    window.lastUserId = user._id;

  }, [user?.messages, user?._id]);




  useEffect(() => {
    if (!user?.messages) return;

    const formatted = user.messages.map((m, i) => ({
      id: i + 1,
      text: m.content,
      sender: m.role.toLowerCase() === "ai" ? "bot" : "user",
    }));

    // only hydrate if Redux is empty
    if (messages.length === 0) {
      dispatch(setMessages(formatted));
    }
  }, [user]);

  const handleSendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    dispatch(addUserMessage(text));
    setInput("");
    setIsLoading(true);




    try {
      const response = await sendMessage({ question: text })

      dispatch(addBotMessage(response.data.answer));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 402) {
        dispatch(setMessages([]));
        dispatch(addBotMessage("⚠️ Session expired. Please sign in again."));
        logout && logout();
      } else {
        dispatch(addBotMessage("Error: Could not get response"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, token]);

  return (
    <div className="flex flex-col h-full w-full border-none relative bg-transparent">

      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
            </div>
            <p className="font-medium tracking-wide text-sm drop-shadow-md">
              {documentName ? `Discussing "${documentName}"` : "Start a conversation..."}
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`
                px-5 py-3.5 rounded-2xl max-w-[85%] backdrop-blur-md shadow-md transition-all
                ${m.sender === "user"
                  ? "self-end bg-gradient-to-br from-cyan-600/40 to-blue-700/40 border border-cyan-400/40 text-white rounded-tr-sm"
                  : "self-start bg-black/40 border border-white/10 text-white rounded-tl-sm"
                }
              `}
            >
              <p className="leading-relaxed text-sm font-normal drop-shadow-sm">{m.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-black/20 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
          <input
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-300 focus:outline-none focus:border-cyan-400/50 focus:bg-black/30 transition-all font-normal shadow-inner"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />

          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`
              px-6 py-3.5 rounded-xl text-white text-sm font-bold tracking-wide transition-all shadow-lg
              ${!input.trim() || isLoading
                ? "bg-white/10 text-slate-400 cursor-not-allowed border border-white/5"
                : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30 shadow-cyan-900/40"
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </span>
            ) : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
