"use client";

import React, { useState } from 'react';
import { MessageSquare, X, Shield, Send, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingWhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[350px] bg-[#0b141a] rounded-[30px] overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Bot Header */}
            <div className="bg-[#202c33] p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-black text-white shadow-lg">GS</div>
              <div>
                <div className="text-white font-bold text-sm">GeoSmart AI Bot</div>
                <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Live Response Active</div>
              </div>
              <button onClick={() => setIsOpen(false)} className="ml-auto text-gray-400 hover:text-white"><X size={20}/></button>
            </div>

            {/* Content Preview */}
            <div className="p-8 text-center bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-opacity-5">
              <Shield className="text-primary mx-auto mb-4" size={40} />
              <h3 className="text-white font-black text-lg uppercase mb-2">National Support</h3>
              <p className="text-gray-500 text-xs font-bold uppercase leading-relaxed mb-6">Report a crisis or request emergency aid via our AI-powered WhatsApp channel.</p>
              <button 
                onClick={() => window.location.href = '/whatsapp'}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
              >
                Start WhatsApp Chat <Zap size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 hover:scale-110 active:scale-95 transition-all"
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {!isOpen && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-[#050505] flex items-center justify-center text-[10px] font-black animate-bounce">1</div>}
      </button>
    </div>
  );
}

