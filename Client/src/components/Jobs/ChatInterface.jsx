import React from "react";
import { X, Send, Bot, Trash2 } from "lucide-react";

const ChatInterface = ({ messages, inputMessage, setInputMessage, handleChat, handleClear, close, chatEndRef, isTyping }) => {
    
    // Helper to parse **Bold** text to HTML
    const parseMessage = (text) => {
        const html = text.replace(/\*\*(.*?)\*\*/g, '<b class="font-bold text-gray-900">$1</b>');
        return { __html: html };
    };

    return (
        <>
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Bot size={22} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Career Assistant</h3>
                        <p className="text-xs text-blue-100 opacity-90">AI Filtering Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleClear} className="hover:bg-white/10 p-2 rounded-lg transition text-white" title="Clear Filters">
                        <Trash2 size={18} />
                    </button>
                    <button onClick={close} className="hover:bg-white/10 p-2 rounded-lg transition text-white">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.type === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0">
                                <Bot size={14} className="text-blue-600"/>
                            </div>
                        )}
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                            msg.type === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'
                        }`}>
                            <span dangerouslySetInnerHTML={parseMessage(msg.text)} />
                        </div>
                    </div>
                ))}

                {/* 3 DOTS TYPING INDICATOR */}
                {isTyping && (
                    <div className="flex justify-start items-end">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 shrink-0">
                            <Bot size={14} className="text-blue-600"/>
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center gap-1 w-fit h-10">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleChat} className="relative">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type 'Remote React jobs'..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputMessage.trim() || isTyping}
                        className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </>
    );
};

export default ChatInterface;