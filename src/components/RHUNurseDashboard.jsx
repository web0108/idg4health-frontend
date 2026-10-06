import React, { useState } from 'react';
import { 
  FileCheck, Activity, Baby, FlaskConical, FileSpreadsheet, 
  Eye, CheckCircle, X, MapPin, Search, AlertCircle, Phone, MessageSquare, Clock
} from 'lucide-react';

export default function RHUNurseDashboard() {
  const [activeMenu, setActiveMenu] = useState('validation');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Expanded Mock Database including Timestamps
  const [records, setRecords] = useState([
    {
      id: 'REC-2026-001',
      patient: { name: 'Maria Santos', dob: '1998-05-15', age: 28, sex: 'Female', address: 'Barangay Tiniwisan', program: 'PhilHealth Member', contactNumber: '0917-123-4567', phicNo: '12-098765432-1' },
      consultation: {
        category: 'Disease Morbidity',
        disease: 'Dengue Clinical Case',
        temp: '39.1', bp: '110/70', pr: '95', rr: '20', wt: '55', ht: '155', bmi: '22.9 (Normal)',
        complaint: 'High fever for 3 days, joint pain, and mild rash on arms.',
        medicalHistory: 'No known allergies. Previous hospitalization for mild asthma in 2022.',
        action: 'Given Medication / First Aid',
        latitude: '8.955400', longitude: '125.597700'
      },
      date: '2026-10-06',
      timestamp: '10/6/2026, 9:15:22 AM',
      status: 'Pending Review',
      validatorRemarks: '',
      labFlagged: false
    },
    {
      id: 'REC-2026-002',
      patient: { name: 'Juan Dela Cruz', dob: '1981-08-22', age: 45, sex: 'Male', address: 'Barangay Ampayon', program: '4Ps / NHTS', contactNumber: '0918-765-4321', phicNo: '' },
      consultation: {
        category: 'Disease Morbidity',
        disease: 'Hypertension',
        temp: '37.0', bp: '150/95', pr: '88', rr: '18', wt: '85', ht: '165', bmi: '31.2 (Obese)',
        complaint: 'Severe headache and dizziness since morning.',
        medicalHistory: 'Diagnosed with Hypertension Stage 1. Allergic to Ibuprofen.',
        action: 'Given Medication / First Aid',
        latitude: '8.956100', longitude: '125.598200'
      },
      date: '2026-10-06',
      timestamp: '10/6/2026, 11:30:05 AM',
      status: 'Pending Review',
      validatorRemarks: '',
      labFlagged: false
    },
    {
      id: 'REC-2026-003',
      patient: { name: 'Ana Reyes', dob: '2002-02-10', age: 24, sex: 'Female', address: 'Barangay Baan 3', program: 'PhilHealth Dependent', contactNumber: '0919-987-6543', phicNo: '14-555666777-8' },
      consultation: {
        category: 'Maternal Care',
        disease: 'None / Not Applicable',
        isPregnant: true,
        temp: '36.8', bp: '110/80', pr: '80', rr: '16', wt: '62', ht: '160', bmi: '24.2 (Normal)',
        complaint: 'First trimester check-up. Experiencing mild morning sickness.',
        medicalHistory: 'None. First pregnancy.',
        action: 'Routine Monitoring / Advised',
        latitude: '8.954200', longitude: '125.596100'
      },
      date: '2026-10-05',
      timestamp: '10/5/2026, 2:45:10 PM',
      status: 'Validated',
      validatorRemarks: 'Patient scheduled for follow-up ultrasound next month. Routine prenatal vitamins prescribed.',
      labFlagged: true
    }
  ]);

  const filteredRecords = records.filter(record => 
    filterCategory === 'All' ? true : record.consultation.category === filterCategory
  );

  const handleApprove = (id) => {
    setRecords(records.map(rec => 
      rec.id === id ? { ...rec, status: 'Validated', validatorRemarks: 'Validated by LHU Staff.' } : rec
    ));
    setSelectedRecord(null);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-lg">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">IDG4Health</h2>
          <p className="text-xs text-slate-400 mt-1">Local Health Unit Portal</p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          <button 
            onClick={() => setActiveMenu('validation')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeMenu === 'validation' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FileCheck className="w-5 h-5" /> Data Validation
          </button>
          <button 
            onClick={() => setActiveMenu('maternal')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeMenu === 'maternal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Baby className="w-5 h-5" /> Maternal & Birthing
          </button>
          <button 
            onClick={() => setActiveMenu('laboratory')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeMenu === 'laboratory' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FlaskConical className="w-5 h-5" /> Laboratory Referrals
          </button>
          <button 
            onClick={() => setActiveMenu('reports')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeMenu === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FileSpreadsheet className="w-5 h-5" /> FHSIS Analytics Export
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-auto">
        
        {activeMenu === 'validation' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Pending FHSIS Submissions</h1>
                <p className="text-sm text-slate-500 mt-1">Review and validate clinical field data from Barangay Health Stations.</p>
              </div>
              <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-xs font-medium text-slate-500 pl-2">Filter Category:</span>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-sm border-none bg-slate-50 rounded py-1 px-2 focus:ring-0 text-slate-800 font-medium cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Disease Morbidity">Disease Morbidity</option>
                  <option value="Maternal Care">Maternal Care</option>
                  <option value="Immunization">Immunization</option>
                </select>
              </div>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Record ID</th>
                      <th className="p-4 font-semibold">Origin Barangay</th>
                      <th className="p-4 font-semibold">Patient Name</th>
                      <th className="p-4 font-semibold">Service Category / Class</th>
                      <th className="p-4 font-semibold">Date Encoded</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-medium text-blue-600">{record.id}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {record.patient.address}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{record.patient.name}</div>
                          <div className="text-xs text-slate-500">Age: {record.patient.age} | {record.patient.sex}</div>
                          <div className="text-[10px] font-semibold text-blue-600 mt-0.5 uppercase tracking-wide">{record.patient.program}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{record.consultation.category}</div>
                          <div className="text-xs text-slate-500">{record.consultation.disease}</div>
                        </td>
                        <td className="p-4">{record.date}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'Validated' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {record.status === 'Pending Review' ? (
                            <button 
                              onClick={() => setSelectedRecord(record)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
                            >
                              <Eye className="w-4 h-4" /> Review
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSelectedRecord(record)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500">
                          <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          No records found for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeMenu !== 'validation' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Activity className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">Module In Development</h2>
            <p className="text-sm mt-2">The {activeMenu} feature is currently being integrated with the backend API.</p>
          </div>
        )}

      </main>

      {/* CLINICAL REVIEW MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
            
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" /> 
                {selectedRecord.status === 'Validated' ? 'Validated Clinical Record' : 'Clinical Data Validation'}
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-red-500 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* If Validated, show a banner at the top */}
              {selectedRecord.status === 'Validated' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  This record has already been validated and exported to the FHSIS database. It is now read-only.
                </div>
              )}

              <div className="flex items-start justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <h4 className="text-base font-bold text-blue-900">{selectedRecord.patient.name}</h4>
                  <p className="text-xs text-blue-700 mt-1">ID: {selectedRecord.id} | DOB: {selectedRecord.patient.dob} ({selectedRecord.patient.age} yrs) | {selectedRecord.patient.sex}</p>
                  <div className="text-xs text-blue-700 mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedRecord.patient.address} (Lat: {selectedRecord.consultation.latitude}, Long: {selectedRecord.consultation.longitude})
                    </span>
                    <span className="flex items-center gap-1 font-medium text-blue-800">
                      <Clock className="w-3 h-3" /> Recorded: {selectedRecord.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      <Phone className="w-3 h-3" /> {selectedRecord.patient.contactNumber}
                    </span>
                    <span className="text-xs font-semibold text-blue-800">
                      {selectedRecord.patient.program} {selectedRecord.patient.phicNo && `(${selectedRecord.patient.phicNo})`}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-white border border-blue-200 text-blue-800 text-xs font-bold rounded-full shadow-sm">
                    {selectedRecord.consultation.category}
                  </span>
                  <p className="text-xs font-medium text-slate-500 mt-2">{selectedRecord.consultation.disease}</p>
                </div>
              </div>

              {selectedRecord.consultation.isPregnant && (
                <div className="flex items-center gap-2 bg-pink-50 text-pink-700 p-3 rounded-lg border border-pink-100 text-sm font-medium">
                  <Baby className="w-4 h-4" /> Patient flagged for Maternal Care tracking.
                </div>
              )}

              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recorded Vital Signs</h5>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Temp</span>
                    <span className="block text-sm font-bold text-slate-800 mt-1">{selectedRecord.consultation.temp}°C</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">BP</span>
                    <span className="block text-sm font-bold text-slate-800 mt-1">{selectedRecord.consultation.bp}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Pulse</span>
                    <span className="block text-sm font-bold text-slate-800 mt-1">{selectedRecord.consultation.pr}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Resp</span>
                    <span className="block text-sm font-bold text-slate-800 mt-1">{selectedRecord.consultation.rr}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Weight</span>
                    <span className="block text-sm font-bold text-slate-800 mt-1">{selectedRecord.consultation.wt} kg</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">Height</span>
                    <span className="block text-sm font-bold text-slate-800 mt-1">{selectedRecord.consultation.ht} cm</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                    <span className="block text-[10px] font-semibold text-slate-400 uppercase">BMI</span>
                    <span className="block text-sm font-bold text-slate-800 mt-1">{selectedRecord.consultation.bmi.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chief Complaint & Notes</h5>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedRecord.consultation.complaint}
                  </p>
                </div>
                {selectedRecord.consultation.medicalHistory && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Known Allergies & Past Medical History</h5>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {selectedRecord.consultation.medicalHistory}
                    </p>
                  </div>
                )}
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Intervention / Action Taken</h5>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {selectedRecord.consultation.action}
                  </p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-slate-100">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 mt-4">
                  <MessageSquare className="w-4 h-4" /> Validator's Remarks / Final Diagnosis
                </h5>
                <textarea 
                  rows="3" 
                  defaultValue={selectedRecord.validatorRemarks}
                  disabled={selectedRecord.status === 'Validated'}
                  placeholder="Enter clinical remarks, FHSIS codes, or reasons for returning the record to the BHW..." 
                  className={`w-full text-sm rounded-lg p-3 border shadow-sm ${selectedRecord.status === 'Validated' ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed' : 'bg-white border-slate-300 focus:ring-2 focus:ring-blue-500'}`}
                ></textarea>
                
                <div className={`flex items-center gap-2 mt-3 p-3 rounded-lg border ${selectedRecord.status === 'Validated' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <input 
                    type="checkbox" 
                    id="labFlag" 
                    defaultChecked={selectedRecord.labFlagged}
                    disabled={selectedRecord.status === 'Validated'}
                    className={`w-4 h-4 rounded ${selectedRecord.status === 'Validated' ? 'text-slate-400 border-slate-300' : 'text-amber-600 border-amber-300 focus:ring-amber-500'}`} 
                  />
                  <label htmlFor="labFlag" className={`text-sm font-medium flex items-center gap-1.5 ${selectedRecord.status === 'Validated' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <FlaskConical className="w-4 h-4" /> Flag for Laboratory / Diagnostic Testing
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              {selectedRecord.status === 'Pending Review' ? (
                <>
                  <button 
                    onClick={() => setSelectedRecord(null)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition flex items-center gap-1.5 bg-white"
                  >
                    <AlertCircle className="w-4 h-4" /> Return to BHW
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedRecord.id)}
                    className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" /> Approve to FHSIS
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 bg-slate-200 rounded-lg transition"
                >
                  Close Record
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}