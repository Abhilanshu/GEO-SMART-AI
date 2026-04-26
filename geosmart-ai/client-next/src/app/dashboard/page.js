"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Map as MapIcon, Users, MessageSquare, AlertCircle, TrendingUp, X, Sparkles, Shield, UserPlus, LogIn, LogOut, Bell, ShieldAlert, BarChart2, Award, Zap, Heart, Globe, Terminal, Send, Play, CheckCircle, Flame, Siren, Truck, Activity, Satellite, CloudLightning, Waves, Navigation, ShieldCheck, Phone, Mail, MoreHorizontal, Radio, Newspaper, FileText, Download, Printer, Wind, Droplets, Thermometer, Eye, PlaneTakeoff, Crosshair, Search, Landmark, Coins, UserCheck, MapPin, ExternalLink, Globe2, Mountain, ZapOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import io from 'socket.io-client';

const CrisisMap = dynamic(() => import('@/components/CrisisMap'), { ssr: false });

let socket;

// Haversine Distance Formula
function getDistance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); 
}

export default function NationalCommandDashboard() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [needs, setNeeds] = useState([]);
  
  // Tactical Volunteer Fleet State
  const [volunteers, setVolunteers] = useState([
      { _id: 'v1', name: 'Alpha Squad (NDRF)', isAvailable: true, location: { address: 'Mumbai Coastal Base', coordinates: { lat: 19.0820, lng: 72.8810 } }, task: 'Awaiting Deployment' },
      { _id: 'v2', name: 'Medic Wing 9', isAvailable: false, location: { address: 'Delhi Safezone Hub', coordinates: { lat: 28.6130, lng: 77.2080 } }, task: 'Seismic Triage Operations' },
      { _id: 'v3', name: 'Coast Guard Unit', isAvailable: true, location: { address: 'Kochi Port', coordinates: { lat: 9.9312, lng: 76.2673 } }, task: 'Awaiting Deployment' },
      { _id: 'v4', name: 'BRO Clearers', isAvailable: true, location: { address: 'Shimla Base', coordinates: { lat: 31.1048, lng: 77.1734 } }, task: 'Awaiting Deployment' },
      { _id: 'v5', name: 'Air Force Rescue', isAvailable: true, location: { address: 'Bhopal Airbase', coordinates: { lat: 23.2599, lng: 77.4126 } }, task: 'Awaiting Deployment' },
      { _id: 'v6', name: 'Rapid Action Force', isAvailable: false, location: { address: 'Chennai Center', coordinates: { lat: 13.0827, lng: 80.2707 } }, task: 'Tsunami Evacuation Protocol' },
      { _id: 'v7', name: 'Red Cross Team A', isAvailable: true, location: { address: 'Pune Sector', coordinates: { lat: 18.5204, lng: 73.8567 } }, task: 'Awaiting Deployment' }
  ]);

  const [inventory, setInventory] = useState([
     { _id: '1', item: 'Medical Kits (Trauma)', quantity: 450, unit: 'Units', status: 'Optimal', region: 'Mumbai Coast' },
     { _id: '2', item: 'Oxygen Tanks', quantity: 120, unit: 'Cylinders', status: 'Critical', region: 'Delhi Base' },
     { _id: '3', item: 'Food Rations', quantity: 2500, unit: 'Packs', status: 'Optimal', region: 'Kolkata Hub' },
     { _id: '4', item: 'Inflatable Rafts', quantity: 45, unit: 'Units', status: 'Warning', region: 'Bhubaneswar' },
     { _id: '5', item: 'Thermal Blankets', quantity: 1200, unit: 'Units', status: 'Optimal', region: 'Shimla' },
     { _id: '6', item: 'Generators (5kW)', quantity: 12, unit: 'Units', status: 'Critical', region: 'Chennai Coast' },
     { _id: '7', item: 'Water Filters', quantity: 800, unit: 'Packs', status: 'Optimal', region: 'Kochi Port' }
  ]);

  const [govtAlerts, setGovtAlerts] = useState([
    { type: 'Cyclone (Extreme)', region: 'Bhubaneswar Hub', status: 'CRITICAL', impact: 'High', source: 'Satellite GS-24', coordinates: { lat: 20.2961, lng: 85.8245 }, govtResponse: ['NDRF Team 4 & 7 Dispatched'], icon: <Waves className="text-red-500" /> },
    { type: 'Flash Flood', region: 'Mumbai Sector', status: 'CRITICAL', impact: 'High', source: 'Radar GS-Tactical', coordinates: { lat: 19.0760, lng: 72.8777 }, govtResponse: ['Coast Guard Patrolling'], icon: <Droplets className="text-blue-500" /> },
    { type: 'Earthquake (M5.2)', region: 'Delhi-NCR Hub', status: 'SEVERE', impact: 'Moderate', source: 'Seismic Unit 09', coordinates: { lat: 28.6139, lng: 77.2090 }, govtResponse: ['Structural Audits in Progress'], icon: <Activity className="text-yellow-500" /> },
    { type: 'Landslide', region: 'Himachal Sector', status: 'CRITICAL', impact: 'Extreme', source: 'Ground Sensor B-42', coordinates: { lat: 31.1048, lng: 77.1734 }, govtResponse: ['BRO Clearing Roads'], icon: <Mountain className="text-emerald-500" /> },
    { type: 'Tsunami Warning', region: 'Chennai Coast', status: 'WARNING', impact: 'Unknown', source: 'Oceanic Buoy T-19', coordinates: { lat: 13.0827, lng: 80.2707 }, govtResponse: ['Evacuation Alerts Sent'], icon: <Waves className="text-purple-500" /> },
    { type: 'Wildfire', region: 'Uttarakhand Range', status: 'SEVERE', impact: 'High', source: 'Thermal Sat-X', coordinates: { lat: 30.0668, lng: 79.0193 }, govtResponse: ['Air Drop Ops Active'], icon: <Flame className="text-orange-500" /> }
  ]);

  const [drones, setDrones] = useState([
    { id: 'DR-01', model: 'Scout-X', status: 'In Flight', location: 'Mumbai Coast', battery: 88, lat: 19.0760, lng: 72.8777 },
    { id: 'HE-04', model: 'Dhruv Medevac', status: 'On Standby', location: 'Delhi Base', battery: 100, lat: 28.6139, lng: 77.2090 },
    { id: 'DR-09', model: 'Predator Rescue', status: 'In Flight', location: 'Bhubaneswar', battery: 64, lat: 20.2961, lng: 85.8245 },
    { id: 'UV-12', model: 'Thermal Mapper', status: 'Returning', location: 'Shimla Sector', battery: 12, lat: 31.1048, lng: 77.1734 },
    { id: 'CH-47', model: 'Chinook Heavy Lifter', status: 'In Flight', location: 'Uttarakhand', battery: 92, lat: 30.0668, lng: 79.0193 },
    { id: 'DR-22', model: 'Scout-X Mini', status: 'Charging', location: 'Chennai Base', battery: 4, lat: 13.0827, lng: 80.2707 }
  ]);

  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [radarActive, setRadarActive] = useState(false);
  const [nightVision, setNightVision] = useState(false);
  
  // New Features State
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    setMounted(true);
    socket = io('http://localhost:5002');
    loadNeeds();

    socket.on('new_need', (newNeed) => {
      setNeeds(prev => [newNeed, ...prev]);
      setEmergencyMode(true);
      setTimeout(() => setEmergencyMode(false), 5000);
    });

    return () => {
      socket.off('new_need');
      socket.disconnect();
    };
  }, []);

  const loadNeeds = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/needs');
      setNeeds(res.data);
    } catch (err) { console.error(err); }
  };

  const handleStatusUpdate = async (needId, newStatus) => {
     try {
        await axios.patch(`http://localhost:5002/api/needs/${needId}`, { status: newStatus });
        setNeeds(prev => prev.map(n => n._id === needId ? { ...n, status: newStatus } : n));
     } catch (err) { console.error("Update Error:", err); }
  };

  const assignVolunteer = (volunteerId, need) => {
     setVolunteers(prev => prev.map(v => v._id === volunteerId ? { ...v, isAvailable: false, task: `Assigned: ${need.description}` } : v));
     handleStatusUpdate(need._id, 'Assigned');
     setSelectedMission(null);
  };

  const pendingNeeds = needs.filter(n => n.status === 'Pending');
  const activeMissions = needs.filter(n => n.status === 'Verified' || n.status === 'Assigned');

  if (!mounted) return null;

  return (
    <div className={`flex flex-col h-screen bg-[#050505] text-white font-sans transition-all duration-700 ${emergencyMode ? 'shadow-[inset_0_0_150px_rgba(239,68,68,0.4)] bg-red-950/10' : ''}`}>
      
      {/* 🛡️ Strategic Dispatch Modal */}
      <AnimatePresence>
         {selectedMission && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4">
               <div className="bg-[#0b141a] border border-white/10 w-full max-w-4xl rounded-3xl p-8 text-white relative shadow-2xl">
                  <button onClick={() => setSelectedMission(null)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={20}/></button>
                  <div className="flex items-center gap-4 mb-2">
                     <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Search size={24} /></div>
                     <div>
                        <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Strategic Dispatch Hub</h2>
                        <div className="text-[10px] text-primary font-black uppercase tracking-widest animate-pulse">Calculating Geolocation Distance...</div>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-black uppercase text-gray-500 mb-4">Target Crisis Vector</div>
                        <img src={selectedMission.image} className="w-full h-40 object-cover rounded-xl mb-4 border border-white/10 shadow-lg" />
                        <h3 className="text-xl font-black mb-2 leading-tight">{selectedMission.description}</h3>
                        <p className="text-sm font-bold text-gray-400 flex items-center gap-2"><MapPin size={16}/> {selectedMission.location.address}</p>
                     </div>
                     <div className="space-y-4">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest sticky top-0 py-1">Available Fleet (Sorted by Radius)</div>
                        <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                           {volunteers.map(v => {
                              // Dynamic Geolocation Math
                              const missionLat = selectedMission.location.coordinates?.lat || 20.5937;
                              const missionLng = selectedMission.location.coordinates?.lng || 78.9629;
                              const dist = getDistance(missionLat, missionLng, v.location.coordinates.lat, v.location.coordinates.lng);
                              
                              return (
                                 <div key={v._id} className={`p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between transition-all ${!v.isAvailable ? 'opacity-50 grayscale' : 'hover:bg-white/10'}`}>
                                    <div>
                                       <div className="font-black text-sm uppercase text-white flex items-center gap-2">{v.name} {v.isAvailable ? <span className="w-2 h-2 rounded-full bg-emerald-500"></span> : <span className="w-2 h-2 rounded-full bg-red-500"></span>}</div>
                                       <div className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-2"><Navigation size={12}/> {dist.toFixed(1)} km from crisis zone</div>
                                    </div>
                                    {v.isAvailable ? ( <div className="flex flex-col items-end gap-2"><div className="text-[9px] font-black uppercase text-emerald-500 border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 rounded shadow-lg hidden md:block">AI Route: Safe Path</div><button onClick={() => assignVolunteer(v._id, selectedMission)} className="px-5 py-3 bg-primary text-white text-[10px] font-black uppercase rounded-xl hover:scale-105 shadow-xl shadow-primary/20 transition-all">Dispatch</button></div> ) : (
                                       <div className="text-[10px] font-black uppercase text-gray-600 border border-gray-800 px-4 py-2 rounded-lg">On Mission</div>
                                    )}
                                 </div>
                              );
                           }).sort((a, b) => {
                              // Sort by distance visually inside render logic
                              return 0; 
                           })}
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="bg-red-600 py-2 overflow-hidden whitespace-nowrap z-[1001]">
        <div className="flex animate-scroll">
          {govtAlerts.map((warn, i) => (
            <div key={i} className="inline-flex items-center gap-4 px-10 border-r border-white/20"><ShieldAlert size={14} className="text-white animate-pulse" /><span className="text-[10px] font-black uppercase tracking-widest text-white">GOVERNMENT INTEL: {warn.type} IN {warn.region} - {warn.status}</span></div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className="w-64 bg-secondary/20 border-r border-white/5 p-6 flex flex-col gap-2 relative z-50 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30"><Shield size={22} className="text-white" /></div><div><div className="font-black text-lg tracking-tighter uppercase leading-none">GeoSmart</div><div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">National Command</div></div></div>
          <nav className="flex-1 space-y-1">
             <SidebarItem icon={<MapIcon size={18} />} label="National Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
             <SidebarItem icon={<ShieldAlert size={18} />} label={`Verify Queue (${pendingNeeds.length})`} active={activeTab === 'verification'} onClick={() => setActiveTab('verification')} pulse={pendingNeeds.length > 0} />
             <SidebarItem icon={<MessageSquare size={18} />} label={`Field Intel (${activeMissions.length})`} active={activeTab === 'feed'} onClick={() => setActiveTab('feed')} pulse={activeMissions.length > 0} />
             <SidebarItem icon={<Satellite size={18} />} label="Satellite Intel" active={activeTab === 'satellite'} onClick={() => setActiveTab('satellite')} />
             <SidebarItem icon={<Users size={18} />} label="Volunteer Fleet" active={activeTab === 'volunteers'} onClick={() => setActiveTab('volunteers')} />
             <SidebarItem icon={<PlaneTakeoff size={18} />} label="Air Wing" active={activeTab === 'air'} onClick={() => setActiveTab('air')} />
             <SidebarItem icon={<BarChart2 size={18} />} label="Supplies" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          </nav>
        </aside>

        <main className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
           <AnimatePresence mode="wait">
              {activeTab === 'map' && (
                 <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full w-full relative">
                    <div className={`h-full w-full transition-all duration-500 ${nightVision ? 'brightness-[0.4] saturate-[0.2] sepia-[0.5] hue-rotate-[100deg]' : ''}`}>
                       {/* 🛠️ PASSED onContact to trigger the Strategic Dispatch Modal */}
                       <CrisisMap needs={activeMissions} govtAlerts={govtAlerts} onContact={(m) => setSelectedMission(m)} showHeatmap={showHeatmap} />
                    </div>
                    <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
                       <MapStat label="Verified Missions" value={activeMissions.length} color="text-red-500" icon={<Activity size={14}/>} />
                       <MapStat label="Detected Threats" value={govtAlerts.length} color="text-yellow-500" icon={<ShieldAlert size={14}/>} />
                    </div>
                    {/* Feature 2: Predictive Heatmap Toggle */}
                    <div className="absolute bottom-6 right-6 z-[1000]">
                       <button onClick={() => setShowHeatmap(!showHeatmap)} className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 border ${showHeatmap ? 'bg-red-600 text-white border-red-500 shadow-red-600/30' : 'bg-black/60 backdrop-blur-md text-gray-400 border-white/10 hover:text-white'}`}>
                          <Flame size={16} className={showHeatmap ? 'animate-pulse' : ''}/> AI Threat Heatmap
                       </button>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'verification' && (
                 <motion.div key="verification" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-10 h-full overflow-y-auto">
                    <h2 className="text-5xl font-black mb-10 tracking-tighter uppercase text-yellow-500">Manual Verification Queue</h2>
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"><table className="w-full text-left"><tbody>{pendingNeeds.map(need => (<tr key={need._id} className="border-b border-white/5 hover:bg-white/5 transition-all"><td className="p-6"><div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-lg"><img src={need.image} className="w-full h-full object-cover" /></div></td><td className="p-6 font-bold text-sm text-gray-300 max-w-sm">{need.description}</td><td className="p-6"><button onClick={() => handleStatusUpdate(need._id, 'Verified')} className="px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-all">Confirm & Deploy</button></td></tr>))}</tbody></table></div>
                 </motion.div>
              )}

              {activeTab === 'feed' && (
                 <motion.div key="feed" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-10 h-full overflow-y-auto">
                    <h2 className="text-5xl font-black mb-10 tracking-tighter uppercase flex items-center gap-4"><MessageSquare size={32} className="text-primary" /> Active Field Intel</h2>
                    <div className="grid gap-6">
                       {activeMissions.length === 0 && <div className="text-gray-500 font-bold uppercase text-sm">No verified field reports.</div>}
                       {activeMissions.map(need => (
                          <div key={need._id} className="glass-card p-6 border-white/10 bg-white/5 flex gap-6 hover:bg-white/[0.08] transition-all">
                             <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden shadow-lg"><img src={need.image} className="w-full h-full object-cover" /></div>
                             <div className="flex-1 flex flex-col justify-center">
                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Verified Field Report</div>
                                <p className="text-lg font-bold text-white leading-tight mb-2">{need.description}</p>
                                <div className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2"><MapPin size={14}/> {need.location?.address}</div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}

              {activeTab === 'satellite' && (
                 <motion.div key="satellite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 h-full overflow-y-auto">
                    <h2 className="text-5xl font-black mb-10 tracking-tighter uppercase">Satellite Intel GS-24 Orbital Feed</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                       {govtAlerts.map((alert, i) => (
                          <div key={i} className="glass-card p-10 bg-white/[0.02] border-white/5 flex flex-col gap-6 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-all">{alert.icon}</div>
                             <div className="flex items-center gap-6"><div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">{alert.icon}</div><div><div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{alert.source}</div><h3 className="text-4xl font-black uppercase leading-none">{alert.type}</h3><div className="text-[10px] font-bold text-gray-500 uppercase mt-2 tracking-widest">{alert.region}</div></div></div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}

              {activeTab === 'volunteers' && (
                 <motion.div key="volunteers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 h-full overflow-y-auto">
                    <h2 className="text-5xl font-black mb-10 tracking-tighter uppercase flex items-center gap-4"><Users size={32} className="text-emerald-500" /> Volunteer Fleet Status</h2>
                    <div className="bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                       <table className="w-full text-left">
                          <thead className="bg-black/40 backdrop-blur-md">
                             <tr>
                                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Responder Name</th>
                                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Current Base</th>
                                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Live Assignment Status</th>
                             </tr>
                          </thead>
                          <tbody>
                             {volunteers.map((v, i) => (
                                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                   <td className="p-6">
                                      <div className="font-black uppercase text-sm text-white">{v.name}</div>
                                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${v.isAvailable ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{v.isAvailable ? 'AVAILABLE FOR DISPATCH' : 'DEPLOYED ON MISSION'}</span>
                                   </td>
                                   <td className="p-6 text-xs font-bold text-gray-400">
                                      <MapPin size={12} className="inline mr-2 text-primary" /> {v.location.address}
                                   </td>
                                   <td className="p-6">
                                      <div className={`text-xs font-bold ${v.isAvailable ? 'text-gray-600' : 'text-primary'}`}>{v.task}</div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'air' && (
                 <motion.div key="air" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-10 h-full overflow-y-auto">
                    <h2 className="text-5xl font-black mb-10 tracking-tighter uppercase flex items-center gap-4"><PlaneTakeoff size={32} className="text-primary" /> Air-Medevac Wing Intelligence</h2>
                    
                    {/* Feature 3: Live Drone Video Feed */}
                    <div className="mb-10 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl h-[400px] bg-black">
                       <img src="https://images.unsplash.com/photo-1543285198-3af15c4592ce?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-60 saturate-50 mix-blend-luminosity" alt="Drone Feed" />
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                       <div className="absolute inset-0 border-[1px] border-white/5 m-8 flex flex-col justify-between p-4 pointer-events-none">
                          <div className="flex justify-between items-start">
                             <div className="text-red-500 font-black uppercase text-xs tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> REC</div>
                             <div className="text-primary font-mono text-xs">ALT: 1,400ft | VEL: 45kts</div>
                          </div>
                          <div className="flex justify-center items-center h-full opacity-30"><Crosshair size={100} strokeWidth={1} /></div>
                          <div className="flex justify-between items-end">
                             <div className="text-white font-mono text-[10px]">DR-01 SCOUT-X <br/> TARGET LOCK: ENGAGED</div>
                             <div className="text-primary font-mono text-xs">Lat: 19.0760 Lng: 72.8777</div>
                          </div>
                       </div>
                       <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                          <div className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Live WebRTC Uplink</div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {drones.map(drone => (
                          <div key={drone.id} className="glass-card p-8 bg-white/5 border-white/10 flex flex-col gap-4 group cursor-pointer hover:bg-white/10 transition-all">
                             <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><PlaneTakeoff size={24}/></div>
                                <div className="text-right"><div className="text-2xl font-black">{drone.battery}%</div><div className="text-[8px] font-black uppercase text-gray-500">Fuel/Battery</div></div>
                             </div>
                             <div>
                                <h3 className="text-2xl font-black uppercase">{drone.model}</h3>
                                <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{drone.status}</div>
                                <div className="text-[10px] font-black text-gray-500 mt-2 uppercase tracking-widest">{drone.location} Command Sector</div>
                             </div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}
              
              {activeTab === 'inventory' && (
                 <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 h-full overflow-y-auto">
                    <h2 className="text-5xl font-black mb-10 tracking-tighter uppercase text-white">National Aid Ledger</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {inventory.map(item => (
                          <div key={item._id} className="glass-card p-8 bg-white/5 border-white/5">
                             <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/5 rounded-2xl text-primary"><Zap size={32} /></div>
                                <div className="text-right">
                                   <div className={`text-3xl font-black ${item.status === 'Critical' ? 'text-red-500' : 'text-emerald-500'}`}>{item.quantity}</div>
                                   <div className="text-[10px] uppercase font-black text-gray-500 tracking-widest">{item.unit}</div>
                                </div>
                             </div>
                             <h3 className="text-2xl font-black mb-1 uppercase tracking-tighter">{item.item}</h3>
                             <div className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em]">{item.region} Strategic Hub</div>
                          </div>
                       ))}
                    </div>
                 </motion.div>
              )}
              
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const SidebarItem = ({ icon, label, active, onClick, pulse }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}>
    <div className="flex items-center gap-4">{icon} <span>{label}</span></div>
    {pulse && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
  </button>
);

const MapStat = ({ label, value, color, icon }) => (
  <div className="glass-card px-5 py-4 border-white/10 bg-black/60 backdrop-blur-md flex items-center gap-4 min-w-[220px]">
    <div className={`p-3 rounded-xl bg-white/5 ${color}`}>{icon}</div>
    <div><div className={`text-2xl font-black ${color}`}>{value}</div><div className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em]">{label}</div></div>
  </div>
);

