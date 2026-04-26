import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <AuthProvider>
      <div className="App min-h-screen overflow-y-auto">
        {showDashboard ? (
          <Dashboard />
        ) : (
          <LandingPage onEnterDashboard={() => setShowDashboard(true)} />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
