import React, { useState, useEffect, useRef } from "react";
import learnAnythingService from '../services/learnAnythingService';
import { Send, Mic, X, Bot, User } from "lucide-react";

interface ChatMessage {
  text: string;
  sender: "user" | "model";
}

interface AIChatWidgetProps {
  currentModuleContext: string;
  chatHistory: ChatMessage[];
  onNewChatMessage: (message: ChatMessage) => void;
  onClose: () => void;
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({
  currentModuleContext,
  chatHistory,
  onNewChatMessage,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setMessages(chatHistory);
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() !== "") {
      const newUserMessage: ChatMessage = { text: inputValue, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]); // Add user message to local state
      onNewChatMessage(newUserMessage);
      setInputValue("");
      setIsLoading(true);

      try {
        const aiResponseText = await learnAnythingService.getChatResponse(
          chatHistory.map((msg) => ({ role: msg.sender, parts: [{ text: msg.text }] })),
          newUserMessage.text,
          currentModuleContext
        );
        const newAiMessage: ChatMessage = { text: aiResponseText, sender: "model" };
        onNewChatMessage(newAiMessage);
      } catch (error) {
        console.error("Error getting AI chat response:", error);
        const errorMessage: ChatMessage = {
          text: "Sorry, I couldn't get a response. Please try again.",
          sender: "model",
        };
        onNewChatMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(
        "Speech recognition not supported in this browser. Please use Chrome."
      );
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (inputValue.trim() !== "") {
          handleSendMessage();
        }
      };
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInputValue("");
      recognitionRef.current.start();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full md:w-[480px] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800 mb-2">
                Start a Conversation
              </h4>
              <p className="text-sm text-slate-500 max-w-xs">
                Ask me anything about your learning materials. I'm here to help!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-6 flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  } animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`flex gap-3 max-w-[85%] ${
                      message.sender === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                          : "bg-gradient-to-br from-slate-200 to-slate-300"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-slate-700" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                      }`}
                    >
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="mb-6 flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-slate-700" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-white border border-slate-200 shadow-sm">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-end gap-2">
            <div className="flex-grow relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || isRecording}
                className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors text-slate-800 placeholder-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleVoiceInput}
                disabled={isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                  isRecording
                    ? "text-red-500 bg-red-50 animate-pulse"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Mic size={18} />
              </button>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={isLoading || inputValue.trim() === ""}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
            >
              <Send size={20} />
            </button>
          </div>

          {isRecording && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600 animate-in slide-in-from-bottom-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Recording... Click mic to stop</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;
