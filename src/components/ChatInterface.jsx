import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUserMessage, addBotMessage, setMessages } from "../store/chatSlice";
import { useAuth } from "../context/AuthContext";
import { useSendMessageMutation } from "../slices/apiSlice";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Suggested starter prompts ---
const SUGGESTED_PROMPTS = [
  "Summarise this document",
  "What are the key takeaways?",
  "List the main conclusions",
  "What questions does this document answer?",
];

// --- Format a timestamp for display ---
function formatTime(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// --- Sub-components ---

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

// --- Copy button ---
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing silently
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy message"}
      aria-label={copied ? "Copied!" : "Copy message"}
      className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/10 flex-shrink-0 self-start mt-1"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

// --- Markdown components for styling ---
const markdownComponents = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 pl-4 list-disc space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal space-y-1">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>,
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-black/30 text-cyan-300 px-1.5 py-0.5 rounded text-[0.8em] font-mono">{children}</code>
    ) : (
      <pre className="bg-black/40 border border-white/10 rounded-xl p-3 overflow-x-auto my-2">
        <code className="text-cyan-200 text-xs font-mono">{children}</code>
      </pre>
    ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-cyan-500/50 pl-3 my-2 text-slate-300 italic">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline underline-offset-2 hover:text-cyan-300">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
  hr: () => <hr className="border-white/10 my-3" />,
};

// --- Message Bubble ---
const MessageBubble = ({ message, userInitial }) => {
  const isUser = message.sender === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6 group`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] lg:max-w-2xl gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar */}
        <div className="mt-1">
          {isUser ? <UserIcon letter={userInitial} /> : <BotIcon />}
        </div>

        {/* Bubble + copy */}
        <div className={`flex items-start gap-1.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
          <div
            className={`
              relative p-4 rounded-2xl text-sm leading-relaxed shadow-sm
              break-words overflow-wrap-anywhere
              ${!isUser
                ? "bg-[#1f2129]/80 backdrop-blur-md border border-white/5 text-slate-200 rounded-tl-none hover:bg-[#252830]/90 transition-colors"
                : "bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-cyan-900/20 shadow-lg"}
            `}
            style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
          >
            {isUser ? (
              <p className="leading-relaxed">{message.text}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {message.text}
              </ReactMarkdown>
            )}

            {/* Timestamp */}
            <div className={`
              absolute -bottom-5 text-[11px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-medium tracking-wide
              ${!isUser ? "left-0" : "right-0"}
            `}>
              {formatTime(message.timestamp)}
            </div>
          </div>

          {/* Copy button — only on bot messages */}
          {!isUser && <CopyButton text={message.text} />}
        </div>

      </div>
    </motion.div>
  );
};

// --- Empty State ---
const EmptyState = ({ documentName, onPromptClick }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-slate-200 select-none -mt-8 px-4">
    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/8 flex items-center justify-center mb-6 shadow-2xl">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-400">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </div>

    <h3 className="text-lg font-semibold text-slate-300 mb-2">
      {documentName ? `Ask about "${documentName}"` : "Welcome to DocuChat"}
    </h3>
    <p className="text-xs text-slate-500 max-w-xs text-center leading-relaxed mb-8">
      {documentName
        ? "Your document is loaded. Try one of the suggestions below or type your own question."
        : "Upload a document using the panel on the left (or tap the document icon on mobile), then start asking questions."}
    </p>

    {/* Suggested prompt chips */}
    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onPromptClick(prompt)}
          className="
            px-3 py-2 rounded-xl text-xs font-medium
            bg-white/5 border border-white/10
            text-slate-300 hover:text-white
            hover:bg-cyan-500/10 hover:border-cyan-500/30
            transition-all duration-200
          "
        >
          {prompt}
        </button>
      ))}
    </div>
  </div>
);

// ============================================================
// Main Component
// ============================================================
const ChatInterface = ({ documentName }) => {
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { token, user, logout } = useAuth();
  const [sendMessage] = useSendMessageMutation();

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // --- Sync with Auth Context ---
  useEffect(() => {
    if (!user || !user.messages) {
      if (messages.length > 0) dispatch(setMessages([]));
      return;
    }

    const formatted = user.messages.map((m, i) => ({
      id: i + 1,
      text: m.content,
      sender: m.role.toLowerCase() === "ai" ? "bot" : "user",
      timestamp: Date.now() - (user.messages.length - i) * 60000, // approximate past times
    }));

    if (JSON.stringify(formatted.map(m => m.text)) !== JSON.stringify(messages.map(m => m.text))) {
      dispatch(setMessages(formatted));
    }
  }, [user, dispatch]);

  // --- Auto-scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  // --- Auto-resize textarea ---
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px"; // cap at ~6 lines
  }, [input]);

  const handleSendMessage = useCallback(async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    dispatch(addUserMessage({ text, timestamp: Date.now() }));
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessage({ question: text }).unwrap();
      dispatch(addBotMessage({ text: response.answer, timestamp: Date.now() }));
    } catch (err) {
      if (err.status === 401 || err.status === 402) {
        dispatch(setMessages([]));
        dispatch(addBotMessage({ text: "⚠️ Session expired. Please sign in again.", timestamp: Date.now() }));
        logout && logout();
      } else {
        dispatch(addBotMessage({ text: "❌ Error: Could not get a response. Please try again.", timestamp: Date.now() }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, sendMessage, dispatch, logout]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex flex-col h-full w-full relative">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar scroll-smooth">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-end pb-4">

          {messages.length === 0 ? (
            <EmptyState documentName={documentName} onPromptClick={(p) => handleSendMessage(p)} />
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

          {/* Focus glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative flex items-end gap-2 bg-[#13151b] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:ring-1 focus-within:ring-cyan-500/30 focus-within:border-cyan-500/50 transition-all duration-300">

            <textarea
              ref={textareaRef}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-500 text-sm md:text-base py-2.5 px-3 resize-none leading-relaxed min-h-[42px] max-h-[160px] overflow-y-auto custom-scrollbar"
              placeholder="Ask a question… (Shift+Enter for new line)"
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              aria-label="Message input"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              className={`
                p-3 rounded-xl transition-all duration-300 flex-shrink-0 mb-0.5
                ${input.trim() && !isLoading
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95"
                  : "bg-white/5 text-slate-500 cursor-not-allowed"}
              `}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>

          </div>

          <div className="text-center mt-2.5">
            <p className="text-[11px] text-slate-600 uppercase tracking-widest font-semibold">
              AI Generated Content · Enter to send · Shift+Enter for new line
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
