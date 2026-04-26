"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Zap, Users, ArrowRight, Satellite, Terminal, Heart, AlertTriangle, ShieldCheck, Activity, Database, Smartphone, CloudLightning } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto border-b border-white/5">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
               <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter uppercase">GeoSmart <span className="text-primary">AI</span></span>
         </div>
         <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-[0.2em] text-gray-400">
            <Link href="/dashboard" className="hover:text-primary transition-all flex items-center gap-2"><Activity size={14}/> Command Center</Link>
            <Link href="/whatsapp" className="hover:text-primary transition-all flex items-center gap-2"><Smartphone size={14}/> WhatsApp Bot</Link>
            <Link href="/volunteer" className="px-8 py-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-white flex items-center gap-2"><Users size={14}/> Volunteer Hub</Link>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6 max-w-7xl mx-auto text-center">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest mb-8 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
               <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>
               Government-Level Protocol Active
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85] uppercase">
               The Future of <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500">Predictive Intel</span>
            </h1>
            <p className="max-w-3xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed font-medium">
               A unified intelligence platform for national disaster response. Powered by 
               <span className="text-white font-bold"> Predictive AI & Kafka Streams</span> for zero-latency, real-time humanitarian resource allocation.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
               <Link href="/dashboard" className="w-full md:w-auto px-12 py-6 bg-primary rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3 group">
                  Initialize Command <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </Link>
               <Link href="/whatsapp" className="w-full md:w-auto px-12 py-6 bg-white/5 border border-white/10 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                  <Smartphone size={18} /> WhatsApp AI Bot
               </Link>
            </div>
         </motion.div>
      </section>

      {/* Strategic Gateways */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GatewayCard 
               icon={<Satellite size={48} />}
               title="Satellite & Drone Imagery"
               desc="Integrates government APIs (IMD/NDMA) and satellite data. AI analyzes 'Before' and 'After' telemetry to detect collapsed bridges and route volunteers safely."
               color="text-red-500"
               link="/dashboard"
               bg="bg-gradient-to-br from-red-500/5 to-transparent"
            />
            <GatewayCard 
               icon={<Heart size={48} />}
               title="Crowdsourced Verification"
               desc="Anti-Spam protocols. Crises are only 'Verified' when AI analyzes overlapping GPS reports or a certified Volunteer Fleet member confirms the ground truth."
               color="text-emerald-500"
               link="/volunteer"
               bg="bg-gradient-to-br from-emerald-500/5 to-transparent"
            />
         </div>
      </section>

      {/* Technical Prowess */}
      <section className="relative z-10 py-32 px-6 bg-[#0a0a0a] border-y border-white/5">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
               <h2 className="text-5xl md:text-6xl font-black mb-10 tracking-tighter leading-[0.9] uppercase">
                  Real-World <br/>
                  <span className="text-primary">Architecture</span>
               </h2>
               <div className="space-y-10">
                  <FeatureRow icon={<Globe />} title="Multilingual NLP & USSD" desc="Translates Marathi, Bengali, and Tamil in real-time. Features Offline/SMS USSD support for victims without 5G." />
                  <FeatureRow icon={<Database />} title="Kafka & Redis Streaming" desc="Microservices architecture utilizing Apache Kafka and Redis Pub/Sub for zero-crash, high-traffic data loads." />
                  <FeatureRow icon={<Shield />} title="Strict RBAC Security" desc="End-to-end encryption with Role-Based Access Control. Government officials hold override powers and audit logs." />
                  <FeatureRow icon={<Zap />} title="Automated Inventory AI" desc="AI automatically calculates and dispatches the exact inventory (food, boats, medical supplies) based on crisis severity." />
               </div>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
               <div className="relative glass-card p-4 bg-white/5 border-white/10 rounded-[40px] shadow-2xl">
                  <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000" className="w-full rounded-[28px] brightness-75 contrast-125 saturate-50" alt="Satellite View" />
                  <div className="absolute top-10 right-10 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">IMD Telemetry Active</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 max-w-7xl mx-auto text-center">
         <div className="flex items-center justify-center gap-4 mb-8 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black text-xs">G</div>
            <span className="font-black text-lg tracking-tighter uppercase">GeoSmart AI National Foundation</span>
         </div>
         <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] font-black">Government-Grade Microservices Ecosystem © 2026</p>
      </footer>

    </div>
  );
}

const GatewayCard = ({ icon, title, desc, color, link, bg }) => (
  <Link href={link} className={`glass-card p-12 border-white/5 ${bg} hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500 group relative overflow-hidden`}>
     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] group-hover:bg-white/10 transition-all"></div>
     <div className={`mb-10 ${color} group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 relative z-10`}>{icon}</div>
     <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter relative z-10">{title}</h3>
     <p className="text-gray-400 text-lg leading-relaxed mb-10 relative z-10">{desc}</p>
     <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white relative z-10 opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all">
        Initialize Gateway <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
     </div>
  </Link>
);

const FeatureRow = ({ icon, title, desc }) => (
  <div className="flex gap-8 items-start group">
     <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 group-hover:text-primary group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shadow-lg">{icon}</div>
     <div>
        <h4 className="text-xl font-black mb-2 tracking-tight uppercase">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed font-medium">{desc}</p>
     </div>
  </div>
);

