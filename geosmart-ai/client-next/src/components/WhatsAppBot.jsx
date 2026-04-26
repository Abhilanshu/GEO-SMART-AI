"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, CheckCircle, AlertCircle, Loader2, User, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const WhatsAppBot = ({ onNeedCreated }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! This is the GeoSmart AI Crisis Bot. Please describe the emergency or send a field report.", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5002/api/needs', { message: input });
      
      setTimeout(() => {
        setIsTyping(false);
        const botResponse = { 
          id: Date.now() + 1, 
          text: `Crisis identified: ${response.data.category}. Urgency: ${response.data.urgency}/5. Report has been added to the heatmap for immediate action.`, 
          sender: 'bot', 
          timestamp: new Date() 
        };
        setMessages(prev => [...prev, botResponse]);
        if (onNeedCreated) onNeedCreated(response.data);
      }, 1500);

    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "Sorry, I couldn't process that report. Please try again with more details.", 
        sender: 'bot', 
        timestamp: new Date(),
        error: true
      }]);
    }
  };

  return (
    <div className="flex flex-col h-full border-white/5 overflow-hidden bg-black/20">
      <div className="bg-[#075e54] p-3 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">GeoSmart AI Bot</div>
            <div className="text-[10px] text-green-300">Online</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <button onClick={() => alert("Video Mission Briefing: This feature is being integrated with Government Satellite APIs.")} className="hover:text-white"><Video size={20} /></button>
          <button onClick={() => alert("Secure Voice Line: Direct encrypted voice channel coming in the next release.")} className="hover:text-white"><Phone size={18} /></button>
          <button onClick={() => alert("Mission Settings: Official mission parameters are locked during active crises.")} className="hover:text-white"><MoreVertical size={20} /></button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0b141a]"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', backgroundSize: 'contain' }}
      >
        {messages.map((msg) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-2.5 rounded-xl text-sm relative shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-[#005c4b] text-white rounded-tr-none' 
                : 'bg-[#202c33] text-gray-200 rounded-tl-none'
            }`}>
              {msg.text}
              <div className="text-[9px] text-gray-400 text-right mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] p-3 rounded-xl rounded-tl-none flex gap-1">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#202c33] p-3 flex items-center gap-3">
        <Smile size={24} className="text-gray-400" />
        <label className="cursor-pointer hover:bg-white/5 p-1 rounded-full transition-all">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              
              const reader = new FileReader();
              reader.onload = async () => {
                const base64 = reader.result.split(',')[1];
                setMessages(prev => [...prev, { id: Date.now(), text: "📷 Uploading field photo...", sender: 'user', timestamp: new Date() }]);
                setIsTyping(true);
                
                try {
                  const response = await axios.post('http://localhost:5002/api/needs', { 
                    image: base64,
                    phone: "919876543210"
                  });
                  
                  setIsTyping(false);
                  setMessages(prev => [...prev, { 
                    id: Date.now() + 1, 
                    text: `🔍 AI VISION: ${response.data.description}. Priority: ${response.data.urgency}/5. Logged at ${response.data.location.address}.`, 
                    sender: 'bot', 
                    timestamp: new Date() 
                  }]);
                } catch (err) {
                  setIsTyping(false);
                  setMessages(prev => [...prev, { id: Date.now() + 1, text: "Vision analysis failed.", sender: 'bot', timestamp: new Date() }]);
                }
              };
              reader.readAsDataURL(file);
            }}
          />
          <Paperclip size={22} className="text-gray-400 -rotate-45" />
        </label>
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 bg-[#2a3942] border-none rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none"
          />
          <button
            type="submit"
            className="w-11 h-11 bg-[#00a884] rounded-full flex items-center justify-center text-white"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default WhatsAppBot;
