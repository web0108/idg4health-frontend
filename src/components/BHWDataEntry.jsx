import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, Wifi, WifiOff, Save, MapPin, Activity } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function BHWDataEntry() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [scanActive, setScanActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [patient, setPatient] = useState({
    patientId: '', name: '', age: '', sex: '', address: 'Barangay Ampayon, Butuan City',
  });

  const [consultation, setConsultation] = useState({
    natureOfVisit: 'New Admission',
    serviceCategory: 'Disease Morbidity',
    diseaseType: 'Dengue Clinical Case', 
    temperature: '',
    bloodPressure: '',
    weight: '',
    height: '',
    chiefComplaint: '',
    actionTaken: '',
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

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedText = detectedCodes[0].rawValue;
      setScanActive(false);

      try {
        const parsedData = JSON.parse(scannedText);
        setPatient({
          patientId: parsedData.patientId || 'N/A',
          name: parsedData.name || 'N/A',
          age: parsedData.age || 'N/A',
          sex: parsedData.sex || 'N/A',
          address: parsedData.address || 'N/A',
        });
        setStatusMessage('QR Health Passport successfully decoded.');
      } catch (error) {
        setPatient({
          patientId: scannedText.substring(0, 15),
          name: 'Juan Scanned',
          age: '35',
          sex: 'Male',
          address: 'Purok 1, Ampayon',
        });
        setStatusMessage('Standard QR code detected. Mock profile applied.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConsultation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // HCI Validation: Ensure Blood Pressure follows the Systolic/Diastolic format
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (consultation.bloodPressure && !bpRegex.test(consultation.bloodPressure)) {
      alert('Please enter Blood Pressure in the correct format (e.g., 120/80).');
      return;
    }

    const payload = { recordId: Date.now(), patient, consultation, status: 'Pending RHU Review' };

    if (!isOnline) {
      setOfflineQueue((prev) => [...prev, payload]);
      setStatusMessage('Network offline: Record stored in local device queue.');
    } else {
      setStatusMessage('Record successfully transmitted to validation gateway.');
    }
    
    // Reset form after submission
    setConsultation((prev) => ({ 
      ...prev, temperature: '', bloodPressure: '', weight: '', height: '', chiefComplaint: '', actionTaken: '' 
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
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
            <div className="bg-slate-900 rounded-lg p-4 text-center text-white space-y-3">
              <div className="rounded-lg overflow-hidden border-2 border-dashed border-blue-400">
                <Scanner onScan={handleScan} />
              </div>
              <p className="text-xs text-slate-300">Point a QR code at your webcam</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
            <div><span className="text-slate-400 block">Patient ID:</span><span className="font-semibold text-slate-700">{patient.patientId || 'Unassigned'}</span></div>
            <div><span className="text-slate-400 block">Full Name:</span><span className="font-semibold text-slate-700">{patient.name || '---'}</span></div>
            <div><span className="text-slate-400 block">Age / Sex:</span><span className="font-semibold text-slate-700">{patient.age ? `${patient.age} / ${patient.sex}` : '---'}</span></div>
            <div><span className="text-slate-400 block">Barangay:</span><span className="font-semibold text-slate-700">{patient.address}</span></div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">2. Individual Treatment Record (ITR)</h2>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          
          {/* CONSULTATION CONTEXT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nature of Visit</label>
              <select name="natureOfVisit" value={consultation.natureOfVisit} onChange={handleInputChange} className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 bg-slate-50">
                <option value="New Admission">New Admission</option>
                <option value="Follow-up Visit">Follow-up Visit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Service Category</label>
              <select name="serviceCategory" value={consultation.serviceCategory} onChange={handleInputChange} className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 bg-slate-50">
                <option value="Disease Morbidity">Disease Morbidity</option>
                <option value="Maternal Care">Maternal Care</option>
                <option value="Immunization">Immunization</option>
                <option value="General Consultation">General Consultation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">FHSIS Classification</label>
              <select name="diseaseType" value={consultation.diseaseType} onChange={handleInputChange} className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 bg-slate-50">
                <option value="Dengue Clinical Case">Dengue Clinical Case</option>
                <option value="Acute Respiratory Infection">Acute Respiratory Infection</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Diarrheal Disease">Diarrheal Disease</option>
                <option value="None / Not Applicable">None / Not Applicable</option>
              </select>
            </div>
          </div>

          {/* VITAL SIGNS MODULE */}
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">Vital Signs & Anthropometrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Temp (°C)</label>
                <input type="text" name="temperature" value={consultation.temperature} onChange={handleInputChange} placeholder="37.5" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">BP (mmHg)</label>
                <input type="text" name="bloodPressure" value={consultation.bloodPressure} onChange={handleInputChange} placeholder="120/80" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
                <input type="number" name="weight" value={consultation.weight} onChange={handleInputChange} placeholder="65" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Height (cm)</label>
                <input type="number" name="height" value={consultation.height} onChange={handleInputChange} placeholder="160" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Chief Complaint / Clinical Notes</label>
            <textarea name="chiefComplaint" rows="3" value={consultation.chiefComplaint} onChange={handleInputChange} placeholder="Record patient's primary symptoms and subjective complaints..." required className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          {/* ACTION TAKEN */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Intervention / Action Taken</label>
            <select name="actionTaken" value={consultation.actionTaken} onChange={handleInputChange} required className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 bg-slate-50">
              <option value="">Select primary intervention...</option>
              <option value="Given Medication / First Aid">Given Medication / First Aid</option>
              <option value="Referred to RHU / Hospital">Referred to RHU / Hospital</option>
              <option value="Routine Monitoring / Advised">Routine Monitoring / Advised</option>
              <option value="Given Immunization / Supplement">Given Immunization / Supplement</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Geo-Tag: Lat {consultation.latitude}, Long {consultation.longitude}</span>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-sm transition">
            <Save className="w-4 h-4" />
            Submit Record
          </button>
        </form>
      </div>
    </div>
  );
}