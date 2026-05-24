import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Narayan Narayan! I am Narad, your cosmic guide to the Dharma Setu website. How may I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto open on initial visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000); // Pops up after 2 seconds
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message || "My cosmic connection dropped. Please try again." }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: "Alas, an error occurred in the ethereal realms." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 sm:w-96 h-[500px] max-h-[80vh] bg-cosmic-800/95 backdrop-blur-md rounded-2xl border border-cosmic-700 shadow-2xl flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-orange-500/20 to-purple-500/20 border-b border-cosmic-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src="/chat bot .jpeg" 
                  alt="Chat Bot" 
                  className="w-10 h-10 rounded-full border border-purple-400/50 object-cover shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                />
                <div>
                  <h3 className="font-semibold text-purple-100">Chat Bot</h3>
                  <p className="text-xs text-purple-200/70">Cosmic Guide</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-cosmic-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-orange-500/80 text-white rounded-br-none' 
                        : 'bg-cosmic-700/80 text-cosmic-100 rounded-bl-none border border-cosmic-600'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-cosmic-700/80 rounded-2xl rounded-bl-none px-4 py-2 border border-cosmic-600">
                    <Loader2 size={16} className="animate-spin text-orange-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-cosmic-900/50 border-t border-cosmic-700">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about the website..."
                  className="w-full bg-cosmic-800 border border-cosmic-600 rounded-full pl-4 pr-12 py-2.5 text-sm text-white placeholder-cosmic-400 focus:outline-none focus:border-orange-500/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-1.5 bg-orange-500/20 text-orange-400 rounded-full hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            {/* Glassmorphism text pill */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="px-4 py-2.5 bg-cosmic-800/40 backdrop-blur-md border border-purple-500/20 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] text-sm font-medium text-purple-100/90 flex items-center space-x-2 relative overflow-hidden"
            >
              {/* Subtle inner highlight */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
              <span className="relative z-10 tracking-wide">Narad is here.</span>
            </motion.div>

            {/* Avatar container with glow and float */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Outer pulsing aura */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-600 to-orange-500 blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700 animate-[pulse_4s_ease-in-out_infinite]"></div>
              
              {/* Secondary tight glow */}
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md group-hover:bg-purple-500/40 transition-colors duration-500"></div>

              <div className="relative w-16 h-16 rounded-full overflow-hidden border border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.4),0_0_40px_rgba(249,115,22,0.2)] group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/chat bot .jpeg" 
                  alt="Chat Bot" 
                  className="w-full h-full object-cover bg-black/60"
                />
                
                {/* Inner glass reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5 mix-blend-overlay"></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
