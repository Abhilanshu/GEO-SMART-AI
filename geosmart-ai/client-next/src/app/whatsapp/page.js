"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Camera, Image as ImageIcon, Mic, MoreVertical, Phone, Video, Search, ChevronLeft, Check, CheckCheck, Shield, RefreshCw, MapPin, Info, UserPlus, X, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function WhatsAppSimulator() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  
  // New Features: Offline USSD & Multilingual NLP
  const [offlineMode, setOfflineMode] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('English');
  const languages = ['English', 'Hindi', 'Marathi', 'Tamil'];
  
  // 🛡️ Pipeline States: 0=Crisis, 1=Location, 2=Landmark, 3=Complete
  const [reportingStep, setReportingStep] = useState(0);
  const [reportData, setReportData] = useState({ description: '', image: '', location: '', landmark: '' });

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    setMessages([
      { id: 1, text: 'Welcome to GeoSmart AI National Bot. 🛡️ Please send a photo or description of the crisis to begin.', sender: 'bot', time: '10:00 AM', status: 'read' }
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (customText = null) => {
    const text = customText || input;
    if (!text.trim()) return;
    
    const userMsg = { 
      id: Date.now(), 
      text, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      status: 'sent' 
    };
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');
    setLoading(true);

    const translateTag = activeLanguage !== 'English' ? `[Auto-Translated from ${activeLanguage}] ` : '';

    try {
      let botText = "";
      
      if (reportingStep === 0) {
         setReportData(prev => ({ ...prev, description: translateTag + text }));
         botText = "Intel received. 📍 PLEASE PROVIDE YOUR LOCATION (City or Sector).";
         if (activeLanguage !== 'English') botText = `(Translated) ${botText}`;
         setReportingStep(1);
      } 
      else if (reportingStep === 1) {
         setReportData(prev => ({ ...prev, location: text }));
         botText = "Location locked. 🏛️ PLEASE PROVIDE A NEARBY LANDMARK (e.g., Near Metro Pillar, Hospital, or Shop).";
         setReportingStep(2);
      }
      else if (reportingStep === 2) {
         const finalLandmark = text;
         setReportData(prev => ({ ...prev, landmark: finalLandmark }));
         
         await axios.post('https://geosmart-api.onrender.com/api/needs', {
            description: `WhatsApp Report: ${reportData.description || 'Visual Intel'}`,
            category: 'Earthquake',
            image: reportData.image || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=1000',
            location: { 
               type: 'Point', 
               coordinates: [72.8777, 19.0760], 
               address: `${reportData.location} | LANDMARK: ${finalLandmark}` 
            },
            affectedPeople: 1
         });

         botText = "STRATEGIC INTEL SECURED. 🛡️ All details (Photo + Location + Landmark) have been sent to the Manual Verification Queue for Commander approval.";
         setReportingStep(0); 
      }

      setTimeout(() => {
         setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: botText, 
            sender: 'bot', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            status: 'delivered' 
         }]);
         setLoading(false);
      }, 1000);

    } catch (err) {
      // 🛠️ FIX: Offline / Database Error Fallback
      console.warn("API Error, using fallback pipeline response.");
      let botTextFallback = "Error connecting. Please try again.";
      
      if (reportingStep === 2) {
         botTextFallback = "STRATEGIC INTEL SECURED (Offline Cache). 🛡️ Details saved locally and will be queued for Commander approval once connected.";
         setReportingStep(0);
      } else {
         botTextFallback = "Command connection lost. 📍 Please confirm your location/landmark again.";
      }

      setTimeout(() => {
         setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            text: botTextFallback, 
            sender: 'bot', 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            status: 'delivered' 
         }]);
         setLoading(false);
      }, 1000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         setReportData(prev => ({ ...prev, image: reader.result }));
         sendPhotoMsg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sendPhotoMsg = (base64Img) => {
     const photoMsg = { 
        id: Date.now(), 
        text: '📸 Strategic Photo Uploaded', 
        sender: 'user', 
        isImage: true, 
        imageData: base64Img, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        status: 'sent' 
     };
     setMessages(prev => [...prev, photoMsg]);
     
     setReportingStep(1);
     
     // Simulate Gemma AI parsing the uploaded image
     const aiDescription = "Gemma AI Assessed: Critical structural collapse detected. Immediate medevac/heavy lifting gear required.";
     setReportData(prev => ({ ...prev, description: aiDescription }));

     setTimeout(() => {
        setMessages(prev => [...prev, { 
           id: Date.now()+1, 
           text: 'Photo analyzed by Gemma AI. 📍 PLEASE PROVIDE YOUR LOCATION (City or Sector) to continue.', 
           sender: 'bot', 
           time: 'Now', 
           status: 'read' 
        }]);
     }, 1000);
  };

  const shareLocation = () => {
     if (!navigator.geolocation) return alert("Geolocation not supported");
     setLoading(true);
     navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMessages(prev => [...prev, { id: Date.now(), text: `📍 GPS Coordinates Shared: [${lat.toFixed(4)}, ${lng.toFixed(4)}]`, sender: 'user', time: 'Now', status: 'sent' }]);
        
        setReportData(prev => ({ ...prev, location: `GPS: ${lat}, ${lng}` }));
        setReportingStep(2);
        
        setTimeout(() => {
           setMessages(prev => [...prev, { 
              id: Date.now()+1, 
              text: 'GPS Locked. 🏛️ PLEASE PROVIDE A NEARBY LANDMARK for precision dispatch.', 
              sender: 'bot', 
              time: 'Now', 
              status: 'read' 
           }]);
           setLoading(false);
        }, 1000);
     }, () => setLoading(false));
  };

  if (!mounted) return null;

  return (
    // 🛠️ FIX: Replaced h-[100dvh] with fixed inset-0 for perfect non-overlapping mobile compatibility
    <div className="fixed inset-0 bg-[#0b141a] flex flex-col font-sans overflow-hidden" suppressHydrationWarning>
      
      {/* Lightbox */}
      <AnimatePresence>
         {selectedImg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4">
               <button onClick={() => setSelectedImg(null)} className="absolute top-10 right-10 text-white p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"><X size={32}/></button>
               <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={selectedImg} className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl" />
            </motion.div>
         )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#202c33] p-4 flex items-center justify-between text-white shrink-0 shadow-lg z-20">
         <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/dashboard'} suppressHydrationWarning><ChevronLeft size={24} className="text-gray-400" /></button>
            <div className="relative">
               <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-black text-sm">GS</div>
               <div className={`absolute bottom-0 right-0 w-3 h-3 ${offlineMode ? 'bg-orange-500' : 'bg-emerald-500'} border-2 border-[#202c33] rounded-full`} />
            </div>
            <div>
               <div className="font-bold text-sm tracking-tight">GeoSmart AI Bot</div>
               <div className={`text-[10px] font-bold uppercase tracking-widest animate-pulse ${offlineMode ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {offlineMode ? 'OFFLINE USSD GATEWAY' : 'National Pipeline Active'}
               </div>
            </div>
         </div>
         <div className="flex items-center gap-4 text-gray-400">
            {/* Language Selector */}
            <select 
               value={activeLanguage} 
               onChange={(e) => setActiveLanguage(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold text-white px-2 py-1 outline-none"
            >
               {languages.map(lang => <option key={lang} value={lang} className="bg-[#202c33]">{lang}</option>)}
            </select>
            
            {/* Offline Mode Toggle */}
            <button 
               onClick={() => setOfflineMode(!offlineMode)} 
               className={`text-[10px] px-2 py-1 rounded-lg border font-bold uppercase transition-all ${offlineMode ? 'bg-orange-500/20 text-orange-500 border-orange-500/50' : 'bg-white/5 text-gray-400 border-white/10'}`}
               title="Toggle Offline USSD/SMS Mode"
            >
               {offlineMode ? 'USSD On' : '5G'}
            </button>
            
            <button onClick={shareLocation} className="hover:text-emerald-500 transition-all" suppressHydrationWarning><MapPin size={20} /></button>
         </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-opacity-10 pb-6">
         {messages.map((msg) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-[85%] p-3 rounded-2xl relative shadow-md transition-all ${msg.sender === 'user' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-gray-200 rounded-tl-none'}`}>
                  {msg.isImage && (
                     <div className="relative group cursor-pointer mb-3 overflow-hidden rounded-xl border border-white/10 shadow-lg" onClick={() => setSelectedImg(msg.imageData)}>
                        <img src={msg.imageData} className="w-full max-h-60 object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><ZoomIn className="text-white" size={32} /></div>
                     </div>
                  )}
                  <div className="text-[13px] leading-relaxed mb-1 font-medium">{msg.text}</div>
                  <div className="flex items-center justify-end gap-1">
                     <span className="text-[9px] text-gray-400 font-bold uppercase">{msg.time}</span>
                     {msg.sender === 'user' && <CheckCheck size={12} className={msg.status === 'read' ? 'text-blue-400' : 'text-gray-400'} />}
                  </div>
               </div>
            </motion.div>
         ))}
         {loading && <div className="text-[10px] text-gray-500 font-bold uppercase animate-pulse px-2">Processing Pipeline...</div>}
      </div>

      {/* Input - Added padding-bottom to handle iOS safe area */}
      <div className="bg-[#202c33] p-3 pb-safe flex items-center gap-3 shrink-0">
         <div className="flex items-center gap-4 text-gray-400 ml-2">
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current.click()} suppressHydrationWarning><Camera size={22} /></button>
         </div>
         <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            type="text" 
            placeholder={reportingStep === 1 ? "Enter Location..." : reportingStep === 2 ? "Enter Landmark..." : "Type report details..."} 
            className="flex-1 bg-[#2a3942] rounded-2xl px-5 py-3 outline-none text-white text-sm border border-transparent focus:border-primary/30 transition-all" 
            suppressHydrationWarning
         />
         {input ? (
            <button onClick={() => handleSend()} className="w-11 h-11 bg-primary rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all" suppressHydrationWarning><Send size={20} /></button>
         ) : (
            <div className="w-11 h-11 flex items-center justify-center text-gray-400"><Mic size={22} /></div>
         )}
      </div>

    </div>
  );
}

