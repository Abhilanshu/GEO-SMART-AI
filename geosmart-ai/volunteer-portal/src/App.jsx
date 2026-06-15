import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VolunteerLanding from './components/VolunteerLanding';
import VolunteerApp from './components/VolunteerApp';
import VolunteerRegistration from './components/VolunteerRegistration';

const API_URL = 'http://localhost:5002/api';

const MOCK_VOLUNTEERS = [
  { _id: 'v1', name: 'Aryan Sharma', skills: ['Medical First Aid', 'Driving'], location: { type: 'Point', coordinates: [77.2, 28.6] } },
  { _id: 'v2', name: 'Priya Patel', skills: ['Search & Rescue', 'Swimming'], location: { type: 'Point', coordinates: [72.8, 19.0] } },
  { _id: 'v3', name: 'Rahul Verma', skills: ['Logistics', 'Heavy Machinery'], location: { type: 'Point', coordinates: [77.1, 28.5] } },
];

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'register' | 'app'
  const [user, setUser] = useState(null);
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(`${API_URL}/volunteers`);
      if (response.data && response.data.length > 0) {
        setVolunteers(response.data);
      } else {
        setVolunteers(MOCK_VOLUNTEERS);
      }
    } catch (error) {
      console.warn("API failed, using mock volunteers for hackathon demo");
      setVolunteers(MOCK_VOLUNTEERS);
    }
  };

  const handleRegister = (newVol) => {
    setUser({ ...newVol, _id: `v_${Date.now()}` }); // mock id
    setView('app');
    fetchVolunteers();
  };

  const selectHero = (hero) => {
    setUser(hero);
    setView('app');
  };

  return (
    <div className="bg-background text-white min-h-screen">
      {view === 'landing' && (
        <VolunteerLanding 
          onJoin={() => setView('register')} 
        />
      )}
      
      {view === 'register' && (
        <div className="pt-20 px-4 min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative">
           <div className="absolute top-4 left-4">
              <button onClick={() => setView('landing')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold">
                 ← Back
              </button>
           </div>
           
           <VolunteerRegistration 
              onComplete={(newVol) => handleRegister(newVol)} 
           />
           
           <div className="max-w-md w-full mx-auto mt-12 text-center border-t border-white/10 pt-8">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-6">Or Login as a registered hero:</p>
              <form 
                 onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                       const res = await axios.post(`${API_URL}/auth/login`, {
                          email: e.target.email.value,
                          password: e.target.password.value
                       });
                       selectHero(res.data.user);
                    } catch (err) {
                       alert('Login failed: ' + (err.response?.data?.error || err.message));
                    }
                 }}
                 className="flex flex-col gap-4 max-w-sm mx-auto"
              >
                 <input 
                    name="email"
                    type="email" 
                    placeholder="Email Address" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-all text-white text-sm"
                 />
                 <input 
                    name="password"
                    type="password" 
                    placeholder="Password" 
                    required 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-primary outline-none transition-all text-white text-sm"
                 />
                 <button 
                    type="submit"
                    className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                 >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Secure Login
                 </button>
              </form>
           </div>
        </div>
      )}

      {view === 'app' && user && (
        <VolunteerApp 
          volunteer={user} 
          onLogout={() => { setUser(null); setView('landing'); }}
        />
      )}
    </div>
  );
}

export default App;
