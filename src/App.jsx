import React, { useState } from 'react';
import BHWDataEntry from './components/BHWDataEntry';
import RHUNurseDashboard from './components/RHUNurseDashboard';
import CHODashboard from './components/CHODashboard';

export default function App() {
  const [currentUserRole, setCurrentUserRole] = useState('BHW');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation to Switch Roles for Prototyping */}
      <nav className="bg-white border-b border-slate-200 p-4 flex flex-wrap justify-center items-center gap-4 shadow-sm z-50 relative">
        <span className="text-sm font-semibold text-slate-500">Prototype Role Switcher:</span>
        <button 
          onClick={() => setCurrentUserRole('BHW')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${currentUserRole === 'BHW' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          Barangay Health Worker
        </button>
        <button 
          onClick={() => setCurrentUserRole('RHU')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${currentUserRole === 'RHU' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          RHU Nurse
        </button>
        <button 
          onClick={() => setCurrentUserRole('CHO')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition ${currentUserRole === 'CHO' ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          City Health Officer
        </button>
      </nav>

      {/* Render the selected role's interface */}
      <div className="flex-1 flex flex-col">
        {currentUserRole === 'BHW' && <BHWDataEntry />}
        {currentUserRole === 'RHU' && <RHUNurseDashboard />}
        {currentUserRole === 'CHO' && <CHODashboard />}
      </div>
    </div>
  );
}