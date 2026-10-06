import React, { useState } from 'react';
import { CheckCircle, XCircle, FileSpreadsheet, LayoutDashboard, ClipboardCheck, Download } from 'lucide-react';

export default function RHUNurseDashboard() {
  const [activeTab, setActiveTab] = useState('validation');
  
  // Mock data representing BHW submissions pushed from the local database
  const [records, setRecords] = useState([
    { id: 'REC-001', patient: 'Maria Santos', age: 28, disease: 'Dengue', date: '2026-10-06', status: 'Pending Review' },
    { id: 'REC-002', patient: 'Juan Dela Cruz', age: 45, disease: 'Hypertension', date: '2026-10-06', status: 'Pending Review' },
    { id: 'REC-003', patient: 'Ana Reyes', age: 5, disease: 'Acute Respiratory Infection', date: '2026-10-05', status: 'Approved' },
  ]);

  const handleApprove = (id) => {
    setRecords(records.map(rec => rec.id === id ? { ...rec, status: 'Approved' } : rec));
  };

  // Automated MCT calculations (Sprint 3 objective)
  const approvedRecords = records.filter(rec => rec.status === 'Approved');
  const totalApproved = approvedRecords.length;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Desktop Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-blue-400">IDG4Health</h1>
          <p className="text-xs text-slate-400 mt-1">RHU Administrator Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('validation')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${activeTab === 'validation' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <ClipboardCheck className="w-5 h-5" />
            Data Validation
          </button>
          <button 
            onClick={() => setActiveTab('mct')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${activeTab === 'mct' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Automated MCT
          </button>
        </nav>
      </aside>

      {/* Main Dashboard Content */}
      <main className="flex-1 p-6 md:p-10">
        
        {/* Tab 1: Validation Queue */}
        {activeTab === 'validation' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Pending FHSIS Submissions</h2>
                <p className="text-sm text-slate-500">Review and validate field data from Barangay Health Workers.</p>
              </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="p-4 font-semibold">Record ID</th>
                    <th className="p-4 font-semibold">Patient Name</th>
                    <th className="p-4 font-semibold">Disease Class</th>
                    <th className="p-4 font-semibold">Date Encoded</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-700">
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-blue-600">{record.id}</td>
                      <td className="p-4">{record.patient} <span className="text-xs text-slate-400 block">Age: {record.age}</span></td>
                      <td className="p-4">{record.disease}</td>
                      <td className="p-4">{record.date}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${record.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {record.status === 'Pending Review' ? (
                          <button onClick={() => handleApprove(record.id)} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold mx-auto transition">
                            <CheckCircle className="w-4 h-4" /> Approve
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Validated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Automated MCT (Monthly Consolidation Table) */}
        {activeTab === 'mct' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Monthly Consolidation Table (MCT)</h2>
                <p className="text-sm text-slate-500">Auto-calculated from validated BHW records.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition">
                <FileSpreadsheet className="w-4 h-4" />
                One-Click FHSIS Export
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Validated Cases</p>
                  <p className="text-2xl font-bold text-slate-800">{totalApproved}</p>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Disease Breakdown (Approved Only)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">Dengue Clinical Case</span>
                    <span className="font-semibold">{approvedRecords.filter(r => r.disease === 'Dengue').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">Acute Respiratory Infection</span>
                    <span className="font-semibold">{approvedRecords.filter(r => r.disease === 'Acute Respiratory Infection').length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">Hypertension</span>
                    <span className="font-semibold">{approvedRecords.filter(r => r.disease === 'Hypertension').length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}