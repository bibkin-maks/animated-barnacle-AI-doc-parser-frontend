import React, { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUserMessage, addBotMessage, setMessages } from "../store/chatSlice";
import { useAuth } from "../context/AuthContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  timeout: 10000,
});

const ChatInterface = ({ documentName }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token, user, logout } = useAuth();

  const chatRef = useRef(null);

  // ---------------------------------------------------------------------
  // 🧠 SINGLE, SAFE HYDRATION EFFECT — replaces all your old hydration code
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!user || !user.messages) {
      dispatch(setMessages([]));
      return;
    }

    // Convert DB messages → Redux format
    const formatted = user.messages.map((m, i) => ({
      id: i + 1,
      text: m.content,
      sender: m.role.toLowerCase() === "ai" ? "bot" : "user",
    }));

    dispatch(setMessages(formatted));
  }, [user?.messages]); // ONLY depend on messages themselves

  // ---------------------------------------------------------------------

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    dispatch(addUserMessage(text));
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post(
        "/query/",
        { question: text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
    <div className="flex flex-col h-[70vh] max-w-[900px] w-full mx-auto bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-lg overflow-hidden">
      
      <div ref={chatRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#0d1117]">
        {messages.length === 0 ? (
          <div className="text-center text-[#8b949e]">
            {documentName
              ? `Start chatting about "${documentName}"...`
              : "Start a conversation..."}
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`
                px-4 py-3 rounded-lg max-w-[80%] border border-[#30363d]
                ${m.sender === "user" ? "self-end bg-[#238636]" : "self-start bg-[#21262d]"}
              `}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <input
            className="flex-1 bg-[#21262d] border border-[#30363d] rounded-lg px-4 py-3 text-sm
              text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#2ea043]"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`
              px-5 py-3 rounded-lg text-white text-sm font-medium transition
              ${
                !input.trim() || isLoading
                  ? "bg-[#3c3c3c] cursor-not-allowed"
                  : "bg-[#238636] hover:bg-[#2ea043]"
              }
            `}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
