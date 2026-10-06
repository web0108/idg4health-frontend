import React, { useState } from 'react';
import BHWDataEntry from './components/BHWDataEntry';
import RHUNurseDashboard from './components/RHUNurseDashboard';
import CHODashboard from './components/CHODashboard';
import { Lock, User, LogOut, Activity } from 'lucide-react'; 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState('');
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Mock Authentication Routing Logic
    if (password === 'admin123') {
      if (username === 'bhw_ampayon') {
        setCurrentUserRole('BHW');
        setIsAuthenticated(true);
      } else if (username === 'rhu_nurse') {
        setCurrentUserRole('RHU');
        setIsAuthenticated(true);
      } else if (username === 'cho_admin') {
        setCurrentUserRole('CHO');
        setIsAuthenticated(true);
      } else {
        setError('Invalid username. Check the credentials below.');
      }
    } else {
      setError('Invalid password. Hint: use admin123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUserRole('');
    setUsername('');
    setPassword('');
  };

  // 1. Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-6 text-center">
            <Activity className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-white">IDG4Health</h1>
            <p className="text-slate-400 text-sm mt-1">Integrated Data Gateway for Health</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm">
              Login
            </button>
            
            {/* Cheat sheet for your defense presentation */}
            <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 text-center">
              <p>Prototype Credentials (Password: <b>admin123</b>):</p>
              <p className="mt-1">BHW: <b>bhw_ampayon</b> | RHU: <b>rhu_nurse</b> | CHO: <b>cho_admin</b></p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Render Main Application if authenticated
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Authentic Top Navigation Bar replacing the Role Switcher */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-slate-800 text-lg">IDG4Health</span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
            {currentUserRole} Portal
          </span>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      {/* Render the assigned role's interface */}
      <div className="flex-1 flex flex-col">
        {currentUserRole === 'BHW' && <BHWDataEntry />}
        {currentUserRole === 'RHU' && <RHUNurseDashboard />}
        {currentUserRole === 'CHO' && <CHODashboard />}
      </div>
    </div>
  );
}