import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, Wifi, WifiOff, Save, MapPin } from 'lucide-react';

export default function BHWDataEntry() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [scanActive, setScanActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [patient, setPatient] = useState({
    patientId: '', name: '', age: '', sex: '', address: 'Barangay Ampayon, Butuan City',
  });

  const [consultation, setConsultation] = useState({
    diseaseType: 'Dengue', symptoms: '', temperature: '',
    consultationDate: new Date().toISOString().split('T')[0],
    latitude: '', longitude: '',
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setConsultation((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toFixed(6),
            longitude: pos.coords.longitude.toFixed(6),
          }));
        },
        () => {
          setConsultation((prev) => ({
            ...prev, latitude: '8.955400', longitude: '125.597700',
          }));
        }
      );
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSimulateQRScan = () => {
    setScanActive(false);
    setPatient({
      patientId: 'PT-2026-0891', name: 'Maria Santos', age: '28', sex: 'Female', address: 'Purok 3, Barangay Ampayon',
    });
    setStatusMessage('Patient demographic data auto-populated.');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConsultation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericRegex = /^\d+(\.\d+)?$/;
    if (!numericRegex.test(consultation.temperature)) {
      alert('Temperature must be a valid numerical value.');
      return;
    }

    const payload = { recordId: Date.now(), patient, consultation, status: 'Pending RHU Review' };

    if (!isOnline) {
      setOfflineQueue((prev) => [...prev, payload]);
      setStatusMessage('Network offline: Record stored in local device queue.');
    } else {
      setStatusMessage('Record successfully transmitted to validation gateway.');
    }
    setConsultation((prev) => ({ ...prev, symptoms: '', temperature: '' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <header className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-800">BHW Data Intake Portal</h1>
            <p className="text-xs text-slate-500">Pilot Site: Ampayon, Butuan City</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
            {offlineQueue.length > 0 && (
              <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-700">Queued: {offlineQueue.length}</span>
            )}
          </div>
        </header>

        {statusMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">1. Digital Identification</h2>
            <button type="button" onClick={() => setScanActive(!scanActive)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              <Camera className="w-4 h-4" />
              {scanActive ? 'Close Camera' : 'Scan QR Passport'}
            </button>
          </div>

          {scanActive && (
            <div className="border-2 border-dashed border-blue-400 bg-slate-900 rounded-lg p-6 text-center text-white space-y-3">
              <div className="w-40 h-40 border-2 border-emerald-400 rounded-lg mx-auto flex items-center justify-center animate-pulse">
                <span className="text-xs text-emerald-300">Align QR Code Inside</span>
              </div>
              <button type="button" onClick={handleSimulateQRScan} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold">
                Simulate Successful Scan
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <div><span className="text-slate-400 block">Patient ID:</span><span className="font-semibold text-slate-700">{patient.patientId || 'Unassigned'}</span></div>
            <div><span className="text-slate-400 block">Full Name:</span><span className="font-semibold text-slate-700">{patient.name || '---'}</span></div>
            <div><span className="text-slate-400 block">Age / Sex:</span><span className="font-semibold text-slate-700">{patient.age ? `${patient.age} / ${patient.sex}` : '---'}</span></div>
            <div><span className="text-slate-400 block">Barangay:</span><span className="font-semibold text-slate-700">{patient.address}</span></div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">2. FHSIS Consultation Encoding</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Disease Classification</label>
              <select name="diseaseType" value={consultation.diseaseType} onChange={handleInputChange} className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500">
                <option value="Dengue">Dengue Clinical Case</option>
                <option value="Acute Respiratory Infection">Acute Respiratory Infection</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Diarrheal Disease">Diarrheal Disease</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Temperature (°C)</label>
              <input type="text" name="temperature" value={consultation.temperature} onChange={handleInputChange} placeholder="e.g., 38.5" required className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Symptoms / Notes</label>
            <textarea name="symptoms" rows="3" value={consultation.symptoms} onChange={handleInputChange} placeholder="Record reported symptoms..." required className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Point Data: Lat {consultation.latitude}, Long {consultation.longitude}</span>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-sm">
            <Save className="w-4 h-4" />
            Submit Record for RHU Validation
          </button>
        </form>
      </div>
    </div>
  );
}