import React, { useState, useEffect } from 'react';
import { LayoutGrid, Map as MapIcon, Users, MessageSquare, AlertCircle, TrendingUp, X, Sparkles, Shield, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsDashboard from './AnalyticsDashboard';
import { BarChart2, Award, Zap, Bell, ShieldAlert, LogIn, LogOut } from 'lucide-react';
import { fetchNeeds, matchVolunteers, assignVolunteer, autoAssignAll, updateStatus, fetchEarlyWarnings, fetchInventory } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CrisisMap from './CrisisMap';
import WhatsAppBot from './WhatsAppBot';
import VolunteerRegistration from './VolunteerRegistration';
import VolunteerPortal from './VolunteerPortal';
import GlobalMonitor from './GlobalMonitor';

const Dashboard = () => {
  const { user, login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [viewMode, setViewMode] = useState('admin'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [needs, setNeeds] = useState([]);
  const [selectedNeed, setSelectedNeed] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState('en'); // 'en' | 'hi'
  const [warnings, setWarnings] = useState([]);
  const [inventory, setInventory] = useState([]);

  const t = {
    en: { overview: 'Crisis Overview', subtitle: 'Real-time resource allocation', emergency: 'Emergency Mode', autoAssign: 'Auto Assign All' },
    hi: { overview: 'संकट सिंहावलोकन', subtitle: 'वास्तविक समय संसाधन आवंटन', emergency: 'आपातकालीन मोड', autoAssign: 'ऑटो असाइन करें' }
  };

  useEffect(() => {
    loadNeeds();
    loadGovernmentData();
  }, []);

  const loadNeeds = async () => {
    try {
      const response = await fetchNeeds();
      setNeeds(response.data);
    } catch (error) {
      console.error("Error loading needs:", error);
    }
  };

  const loadGovernmentData = async () => {
    try {
      const [warnRes, invRes] = await Promise.all([
        fetchEarlyWarnings(),
        fetchInventory()
      ]);
      setWarnings(warnRes.data);
      setInventory(invRes.data);
    } catch (error) {
      console.error("Error loading government data:", error);
    }
  };

  const handleNeedSelect = async (need) => {
    setSelectedNeed(need);
    setIsLoadingMatches(true);
    try {
      const response = await matchVolunteers(need._id);
      setMatches(response.data);
    } catch (error) {
      console.error("Error matching volunteers:", error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleAssign = async (volunteerId) => {
    try {
      await assignVolunteer(selectedNeed._id, volunteerId);
      setSelectedNeed(null);
      loadNeeds();
    } catch (error) {
      console.error("Error assigning volunteer:", error);
    }
  };

  const handleAutoAssign = async () => {
    try {
      await autoAssignAll();
      loadNeeds();
      addNotification("AI Auto-Assignment complete. All pending crises have been matched with nearby volunteers.", "success");
    } catch (error) {
      console.error("Error auto-assigning:", error);
      addNotification("Auto-assignment failed. Please try again.", "error");
    }
  };

  const toggleEmergencyMode = () => {
    setEmergencyMode(!emergencyMode);
    if (!emergencyMode) {
      addNotification("EMERGENCY MODE ACTIVATED: Broadcasting high-alert to all responders.", "emergency");
    } else {
      addNotification("Emergency mode deactivated. Returning to standard monitoring.", "info");
    }
  };

  const addNotification = (text, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, text, type }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(loginCreds.email, loginCreds.password);
      setShowLogin(false);
      addNotification("Logged in as " + loginCreds.email, "success");
    } catch (error) {
      addNotification("Login failed. Check credentials.", "error");
    }
  };

  return (
    <div className={`flex h-screen text-white font-sans overflow-hidden transition-all duration-700 ${emergencyMode ? 'bg-red-950/20' : 'bg-background'}`}>
      {/* Sidebar */}
      <div className="w-20 lg:w-64 bg-secondary/50 border-r border-white/10 flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutGrid className="text-white" size={24} />
          </div>
          <span className="hidden lg:block text-xl font-bold tracking-tight gradient-text">GeoSmart AI</span>
        </div>

        <div className="mb-6 px-2">
          {user ? (
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="text-[10px] text-gray-500 uppercase font-black mb-1">Authenticated {user.role}</div>
              <div className="text-sm font-bold truncate">{user.name}</div>
              <button onClick={logout} className="mt-2 text-[10px] text-primary flex items-center gap-1 hover:underline">
                <LogOut size={10} /> Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="w-full p-3 bg-primary/10 border border-primary/30 rounded-xl text-xs font-bold text-primary flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
            >
              <LogIn size={14} /> Official Login
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutGrid size={20}/>} label="Dashboard" active={activeTab === 'dashboard' && viewMode === 'admin'} onClick={() => { setActiveTab('dashboard'); setViewMode('admin'); }} />
          <NavItem icon={<MapIcon size={20}/>} label="Crisis Map" active={activeTab === 'map' && viewMode === 'admin'} onClick={() => { setActiveTab('map'); setViewMode('admin'); }} />
          <NavItem icon={<Users size={20}/>} label="Volunteers" active={activeTab === 'volunteers' && viewMode === 'admin'} onClick={() => { setActiveTab('volunteers'); setViewMode('admin'); }} />
          <NavItem icon={<BarChart2 size={20}/>} label="Analytics" active={activeTab === 'analytics' && viewMode === 'admin'} onClick={() => { setActiveTab('analytics'); setViewMode('admin'); }} />
          <NavItem icon={<Zap size={20}/>} label="Inventory" active={activeTab === 'inventory' && viewMode === 'admin'} onClick={() => { setActiveTab('inventory'); setViewMode('admin'); }} />
          <NavItem icon={<MessageSquare size={20}/>} label="AI Feed" active={activeTab === 'feed' && viewMode === 'admin'} onClick={() => { setActiveTab('feed'); setViewMode('admin'); }} />
          
          <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
            <h3 className="text-[10px] uppercase font-black text-gray-500 px-4 mb-2 tracking-widest">Portal Switch</h3>
            <NavItem icon={<Shield size={20}/>} label="Volunteer App" active={viewMode === 'volunteer'} onClick={() => setViewMode('volunteer')} />
            <NavItem icon={<UserPlus size={20}/>} label="Join Force" active={viewMode === 'join'} onClick={() => setViewMode('join')} />
          </div>
        </nav>

        <div className="mt-8 space-y-4">
          <WeatherWidget />
          <GlobalMonitor />
        </div>

        <div className="mt-auto p-4 glass-card bg-primary/5 border-primary/20">
          <div className="text-xs text-gray-400">Impact Score</div>
          <div className="text-2xl font-bold text-primary">
            {needs.length > 0 ? Math.round((needs.filter(n => n.status !== 'Pending').length / needs.length) * 100) : 0}%
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <motion.div 
              animate={{ width: `${needs.length > 0 ? (needs.filter(n => n.status !== 'Pending').length / needs.length) * 100 : 0}%` }}
              className="bg-primary h-full"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-background via-background to-secondary/30">
        {viewMode === 'admin' ? (
          <>
             <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold">{language === 'en' ? t.en.overview : t.hi.overview}</h1>
                <p className="text-gray-400 mt-1">{language === 'en' ? t.en.subtitle : t.hi.subtitle}</p>
              </div>
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10 transition-all"
                >
                  {language === 'en' ? '🇮🇳 HINDI' : '🇺🇸 ENGLISH'}
                </button>
                <button 
                  onClick={handleAutoAssign}
                  disabled={user?.role !== 'Official'}
                  className={`${user?.role !== 'Official' ? 'opacity-50 grayscale cursor-not-allowed' : ''} bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl font-semibold transition-all border border-white/10 flex items-center gap-2`}
                >
                  <Sparkles size={18} className="text-yellow-400" />
                  <span>{language === 'en' ? t.en.autoAssign : t.hi.autoAssign}</span>
                </button>
                <button 
                  onClick={toggleEmergencyMode}
                  disabled={user?.role !== 'Official'}
                  className={`${user?.role !== 'Official' ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${emergencyMode ? 'bg-red-500 animate-pulse' : 'bg-primary'} hover:brightness-110 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2`}
                >
                  <AlertCircle size={18} />
                  <span>{emergencyMode ? 'EXIT EMERGENCY' : (language === 'en' ? t.en.emergency : t.hi.emergency)}</span>
                </button>
              </div>
            </header>

            {/* Early Warning Ticker */}
            <div className="mb-8 bg-primary/10 border border-primary/20 rounded-2xl p-4 overflow-hidden relative">
              <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
                <span className="flex items-center gap-2 text-primary font-black uppercase text-xs">
                  <ShieldAlert size={16} /> EARLY WARNING SYSTEM:
                </span>
                {warnings.map((w, i) => (
                  <span key={i} className="text-sm text-gray-300 font-medium border-r border-white/10 pr-4">
                    <span className="text-red-400 font-bold">{w.hazard}</span> predicted in {w.region} ({w.eta})
                  </span>
                ))}
              </div>
            </div>

            {/* Notifications Bar */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md pointer-events-none">
              <AnimatePresence>
                {notifications.map(n => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 ${
                      n.type === 'emergency' ? 'bg-red-500/20 border-red-500 text-red-200' :
                      n.type === 'success' ? 'bg-green-500/20 border-green-500 text-green-200' :
                      n.type === 'error' ? 'bg-orange-500/20 border-orange-500 text-orange-200' :
                      'bg-white/10 border-white/20 text-white'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    <span className="text-sm font-medium">{n.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Content Tabs (Admin) */}
            {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-[500px] w-full relative">
                <CrisisMap needs={needs} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Critical Zones" value={needs.filter(n => n.urgency >= 4).length} color="primary" />
                <StatCard label="Needs Covered" value={needs.filter(n => n.status === 'Resolved').length} color="green" />
                <StatCard label="Pending Tasks" value={needs.filter(n => n.status === 'Pending').length} color="yellow" />
              </div>
            </div>

            <div className="space-y-8 h-full flex flex-col">
              <div className="glass-card p-6 border-white/5 bg-primary/5">
                <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-gray-400 uppercase tracking-widest">
                  <Award size={16} className="text-yellow-500" />
                  Top Responders
                </h2>
                <div className="space-y-4">
                  <LeaderboardItem name="Rahul Sharma" missions={12} impact={95} />
                  <LeaderboardItem name="Priya Singh" missions={8} impact={88} />
                  <LeaderboardItem name="Amit Verma" missions={5} impact={82} />
                </div>
              </div>

              <div className="h-[450px]">
                <WhatsAppBot onNeedCreated={loadNeeds} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="h-[calc(100vh-200px)] w-full">
            <CrisisMap needs={needs} />
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {needs.flatMap(n => n.assignedVolunteers).map(vol => (
              <div key={vol._id} className="glass-card p-6 border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                    {vol.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{vol.name}</h3>
                    <p className="text-xs text-gray-400">Location: {vol.location.address}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase text-gray-500 tracking-widest">Active Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {vol.skills.map(s => <span key={s} className="bg-white/5 px-2 py-1 rounded text-[10px]">{s}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard needs={needs} />
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventory.map(item => (
              <div key={item._id} className="glass-card p-6 border-white/10 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-1 h-full ${
                  item.quantity > 1000 ? 'bg-emerald-500' :
                  item.quantity > 500 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="text-xs font-bold text-gray-500 uppercase mb-4">{item.item}</div>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-black">{item.quantity}</div>
                  <div className="text-sm text-gray-500 mb-1">{item.unit}</div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.quantity > 1000 ? 'bg-emerald-500/10 text-emerald-500' :
                    item.quantity > 500 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {item.category}
                  </span>
                  <div className="text-[10px] text-gray-600 uppercase font-bold">{item.warehouseLocation?.address}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold">Live AI Intelligence Feed</h2>
            <div className="space-y-4">
              {needs.map(need => (
                <div key={need._id} className="glass-card p-4 border-white/5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{new Date(need.createdAt).toLocaleTimeString()}</div>
                    <div className="text-sm text-gray-200">{need.description}</div>
                    <div className="mt-2 flex gap-2">
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">AI PARSED</span>
                      <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded">{need.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
          </>
        ) : viewMode === 'volunteer' ? (
          <VolunteerPortal />
        ) : (
          <VolunteerRegistration onComplete={() => { setViewMode('admin'); loadNeeds(); }} />
        )}

        {/* Volunteer Matching Overlay */}
        <AnimatePresence>
          {selectedNeed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Matching Volunteers for {selectedNeed.category}</h2>
                    <p className="text-gray-400">Location: {selectedNeed.location.address}</p>
                  </div>
                  <button onClick={() => setSelectedNeed(null)} className="p-2 hover:bg-white/5 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isLoadingMatches ? (
                    <div className="col-span-2 text-center py-12">Finding best matches...</div>
                  ) : matches.length > 0 ? (
                    matches.map(match => (
                      <div key={match.volunteer._id} className="glass-card p-4 border-white/10 hover:border-primary/30 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold text-lg">{match.volunteer.name}</div>
                            <div className="text-xs text-gray-400">{match.volunteer.skills.join(', ')}</div>
                          </div>
                          <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
                            Score: {match.score}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <span>{match.distance} km away</span>
                          <span>Availability: {match.volunteer.availability}/10</span>
                        </div>
                        <button 
                          onClick={() => handleAssign(match.volunteer._id)}
                          className="w-full py-2 bg-primary hover:bg-primary/90 rounded-lg font-bold transition-all"
                        >
                          Assign Volunteer
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-gray-500">No matching volunteers found nearby.</div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Modal */}
        <AnimatePresence>
          {showLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-card p-8 w-full max-w-md border-primary/30 shadow-[0_0_50px_rgba(59,130,246,0.2)]"
              >
                <h2 className="text-2xl font-black mb-2">Portal Access</h2>
                <p className="text-gray-400 text-sm mb-8">Enter your official credentials to access government-level controls.</p>
                
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Official Email</label>
                    <input 
                      type="email" 
                      required
                      value={loginCreds.email}
                      onChange={(e) => setLoginCreds({...loginCreds, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-primary transition-all outline-none"
                      placeholder="name@government.in"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Security Token / Password</label>
                    <input 
                      type="password" 
                      required
                      value={loginCreds.password}
                      onChange={(e) => setLoginCreds({...loginCreds, password: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-primary transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setShowLogin(false)}
                      className="flex-1 py-4 rounded-xl text-sm font-bold border border-white/10 hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 py-4 bg-primary rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                    >
                      Verify & Enter
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    {icon}
    <span className="hidden lg:block font-medium">{label}</span>
  </button>
);

const StatCard = ({ label, value, color }) => (
  <div className="glass-card p-6 border-white/5">
    <div className="text-sm text-gray-400 font-medium">{label}</div>
    <div className="text-3xl font-bold mt-2">{value}</div>
  </div>
);

const NeedItem = ({ need, onClick }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className="glass-card p-4 border-white/5 hover:border-primary/20 cursor-pointer transition-all"
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-semibold text-gray-200">{need.category} Help</h3>
      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${
        need.urgency >= 4 ? 'bg-primary/20 text-primary' : 
        need.urgency >= 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-yellow-500/20 text-yellow-500'
      }`}>
        {need.status}
      </span>
    </div>
    <div className="flex items-center gap-4 text-xs text-gray-400">
      <div className="flex items-center gap-1">
        <MapIcon size={12} />
        {need.location.address}
      </div>
      <div className="flex items-center gap-1 text-primary font-medium">
        <Users size={12} />
        {need.affectedPeople} affected
      </div>
    </div>
  </motion.div>
);

const MissionItem = ({ need, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status) => {
    setIsUpdating(true);
    try {
      await updateStatus(need._id, status);
      onUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="glass-card p-4 border-l-4 border-primary bg-primary/5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-sm">{need.category} Rescue</h3>
          <p className="text-[10px] text-gray-400">{need.location.address}</p>
        </div>
        <div className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded">
          {need.status}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        {need.assignedVolunteers.map(vol => (
          <div key={vol._id} className="flex items-center gap-2 text-xs text-gray-300">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold">
              {vol.name.charAt(0)}
            </div>
            <span>{vol.name} is on site</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {need.status === 'Assigned' && (
          <button 
            disabled={isUpdating}
            onClick={() => handleStatusUpdate('Resolved')}
            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            Mark Resolved
          </button>
        )}
        <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold">
          Details
        </button>
      </div>
    </div>
  );
};

const LeaderboardItem = ({ name, missions, impact }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold group-hover:bg-primary/20 transition-all">
        {name.charAt(0)}
      </div>
      <div>
        <div className="text-xs font-bold">{name}</div>
        <div className="text-[10px] text-gray-500">{missions} Missions</div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-xs font-black text-primary">{impact}%</div>
      <div className="text-[8px] text-gray-600 uppercase">Impact</div>
    </div>
  </div>
);

const WeatherWidget = () => (
  <div className="glass-card p-4 border-white/5 bg-blue-500/5">
    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex justify-between">
      <span>Weather Monitor</span>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">28°C</div>
        <div className="text-[10px] text-gray-500">INDORE • SUNNY</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">32°C</div>
        <div className="text-[10px] text-gray-500">DELHI • SMOG</div>
      </div>
    </div>
  </div>
);

export default Dashboard;
