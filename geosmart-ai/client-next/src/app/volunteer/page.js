"use client";

import React, { useState, useEffect } from 'react';
import { Shield, UserCheck, MapPin, Heart, ArrowRight, CheckCircle, Zap, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function VolunteerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    skills: [],
    locationName: 'Detecting Location...',
    lat: 28.6139,
    lng: 77.2090
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({ 
          ...prev, 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          locationName: "Geographic Lock Verified"
        }));
      });
    }
  }, []);

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill) 
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.skills.length === 0) return alert("Please provide your name and skills.");
    setLoading(true);
    try {
      await axios.post('http://localhost:5002/api/volunteers', {
        name: formData.name,
        skills: formData.skills,
        location: {
           address: formData.locationName,
           coordinates: { lat: formData.lat, lng: formData.lng }
        },
        isAvailable: true
      });
      setSuccess(true);
      setTimeout(() => {
         window.location.href = '/dashboard';
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Registration failed. Check server.");
    } finally {
      setLoading(false);
    }
  };

  const skillsList = ['Medical', 'Search & Rescue', 'Firefighting', 'Logistics', 'Diving', 'First Aid', 'Translation'];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-6 overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="fixed top-10 flex items-center gap-3 z-50">
         <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40"><Shield size={28} className="text-white" /></div>
         <span className="font-black text-2xl uppercase tracking-tighter">GeoSmart <span className="text-primary">Hero</span></span>
      </header>

      <main className="max-w-xl w-full relative z-10">
         <AnimatePresence mode="wait">
            {!success ? (
               <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-12 bg-white/[0.02] border-white/5 shadow-2xl">
                  
                  {step === 1 && (
                     <div className="space-y-8">
                        <div>
                           <h1 className="text-4xl font-black uppercase mb-4 leading-none">Join the <span className="text-primary">National Fleet</span></h1>
                           <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Sign up as an official responder to receive real-time crisis alerts.</p>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Full Legal Name</label>
                           <input 
                              type="text" 
                              value={formData.name} 
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="e.g. Rahul Sharma" 
                              className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 outline-none focus:border-primary font-bold text-lg text-white" 
                           />
                        </div>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                           <MapPin className="text-emerald-500" size={24} />
                           <div>
                              <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Location Accuracy</div>
                              <div className="text-xs font-bold text-gray-300">{formData.locationName}</div>
                           </div>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full py-6 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/30">Select Your Skills <ArrowRight size={18} /></button>
                     </div>
                  )}

                  {step === 2 && (
                     <div className="space-y-8">
                        <div>
                           <h1 className="text-4xl font-black uppercase mb-4 leading-none">Your <span className="text-primary">Expertise</span></h1>
                           <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Select all skills you can contribute on the field.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                           {skillsList.map(skill => (
                              <button 
                                 key={skill} 
                                 onClick={() => toggleSkill(skill)}
                                 className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase border transition-all ${formData.skills.includes(skill) ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
                              >
                                 {skill}
                              </button>
                           ))}
                        </div>
                        <div className="flex gap-4">
                           <button onClick={() => setStep(1)} className="w-1/3 py-6 bg-white/5 text-gray-500 rounded-2xl font-black text-xs uppercase border border-white/10">Back</button>
                           <button 
                              onClick={handleSubmit} 
                              disabled={loading}
                              className="flex-1 py-6 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/30"
                           >
                              {loading ? <RefreshCw className="animate-spin" /> : <Zap size={18} />} Enroll Now
                           </button>
                        </div>
                     </div>
                  )}
               </motion.div>
            ) : (
               <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                  <div className="w-40 h-40 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/20">
                     <CheckCircle size={80} className="text-emerald-500" />
                  </div>
                  <h1 className="text-5xl font-black uppercase mb-6 leading-none">Welcome to the <span className="text-emerald-500">Fleet</span></h1>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">Your profile has been synchronized with the National Command Center. Prepare for dispatch intel.</p>
               </motion.div>
            )}
         </AnimatePresence>
      </main>

      <footer className="fixed bottom-10 flex items-center gap-10 opacity-30 grayscale">
         <Activity size={20} />
         <Zap size={20} />
         <Shield size={20} />
         <RefreshCw size={20} />
      </footer>

    </div>
  );
}
