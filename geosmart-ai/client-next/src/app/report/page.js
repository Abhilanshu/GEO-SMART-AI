"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Send, MapPin, CheckCircle, AlertTriangle, Shield, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function CitizenReporterApp() {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (step === 1) startCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera Access Denied", err);
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      setImage(canvas.toDataURL('image/jpeg', 0.8));
      setStep(2);
      
      const stream = video.srcObject;
      if (stream) {
         const tracks = stream.getTracks();
         tracks.forEach(track => track.stop());
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('https://geosmart-api.onrender.com/api/needs', {
        description: `${category}: ${description}`,
        category,
        image,
        location: {
           type: 'Point',
           coordinates: [76.2673, 9.9312], 
           address: 'Mobile Citizen Report'
        },
        affectedPeople: 1
      });
      setSuccess(true);
      setTimeout(() => {
         setSuccess(false);
         setStep(1);
         setImage(null);
         setDescription('');
      }, 4000);
    } catch (err) {
      console.error(err);
      alert("Submission Failed. Ensure backend is running on 5002.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-[#050505] text-white font-sans flex flex-col overflow-hidden">
      
      {/* Fixed Header */}
      <header className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5 z-50 shrink-0">
         <div className="flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            <span className="font-black text-lg uppercase tracking-tighter">GeoSmart <span className="text-primary">Reporter</span></span>
         </div>
         <div className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">GPS SECURE</div>
      </header>

      <div className="flex-1 relative overflow-y-auto px-6 pt-6 pb-24">
         <AnimatePresence mode="wait">
            {step === 1 && (
               <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col">
                  <div className="relative aspect-[3/4] w-full bg-white/5 rounded-[40px] overflow-hidden border border-white/10 mb-8 shadow-2xl">
                     <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                     <canvas ref={canvasRef} className="hidden" />
                     <div className="absolute inset-0 border-[2px] border-white/10 rounded-[40px] pointer-events-none" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <div className="w-64 h-64 border-2 border-dashed border-white rounded-full animate-spin-slow" />
                     </div>
                  </div>
                  <div className="text-center mb-8">
                     <h2 className="text-3xl font-black uppercase mb-2 tracking-tighter">Snap Crisis</h2>
                     <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Ground-Intel Protocol Active</p>
                  </div>
               </motion.div>
            )}

            {step === 2 && !success && (
               <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="relative aspect-video w-full rounded-[30px] overflow-hidden border border-white/10 shadow-2xl">
                     <img src={image} className="w-full h-full object-cover" />
                     <button onClick={() => setStep(1)} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-full text-white shadow-xl"><X size={20}/></button>
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 block">Event Category</label>
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                           {['Flood', 'Fire', 'Medical', 'Safety', 'Other'].map(cat => (
                              <button key={cat} onClick={() => setCategory(cat)} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase border transition-all shrink-0 ${category === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-gray-500'}`}>{cat}</button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4 block">Incident Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Briefly describe the situation..." className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 outline-none focus:border-primary font-bold text-sm text-white transition-all" />
                     </div>
                  </div>
               </motion.div>
            )}

            {success && (
               <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/10">
                     <CheckCircle size={64} className="text-emerald-500 animate-pulse" />
                  </div>
                  <h2 className="text-4xl font-black uppercase mb-4 text-emerald-500 leading-none">Mission Launched</h2>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-[200px] mx-auto leading-relaxed">Intelligence has been verified and relayed to National Command.</p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-[100]">
         {step === 1 ? (
            <button onClick={takePhoto} className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center border-[8px] border-white/20 active:scale-90 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
               <div className="w-8 h-8 bg-black rounded-xl" />
            </button>
         ) : !success && (
            <button 
               onClick={handleSubmit} 
               disabled={loading}
               className="w-full py-6 bg-primary text-white rounded-[25px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/40 active:scale-95 transition-all"
            >
               {loading ? <RefreshCw className="animate-spin" /> : <Send size={20} />} Submit Official Intel
            </button>
         )}
      </div>

    </div>
  );
}

