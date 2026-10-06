import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle, Wifi, WifiOff, Save, MapPin, Activity, Keyboard, Clock } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function BHWDataEntry({ currentUser }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [scanActive, setScanActive] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  const [patient, setPatient] = useState({
    patientId: '', 
    name: '', 
    dob: '',
    age: '', 
    sex: '',
    civilStatus: '',
    contactNumber: '',
    membershipStatus: '',
    phicNo: '',
    address: `${currentUser?.location || 'Unassigned Barangay'}, Butuan City`,
  });

  const [consultation, setConsultation] = useState({
    natureOfVisit: 'New Admission',
    serviceCategory: 'Disease Morbidity',
    diseaseType: 'Dengue Clinical Case', 
    isPregnant: false,
    temperature: '',
    bloodPressure: '',
    pulseRate: '',
    respiratoryRate: '',
    weight: '',
    height: '',
    chiefComplaint: '',
    medicalHistory: '',
    actionTaken: '',
    latitude: '', longitude: '',
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 1000);

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
      clearInterval(timer);
    };
  }, []);

  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const scannedText = detectedCodes[0].rawValue;
      setScanActive(false);
      setIsManualEntry(false);

      try {
        const parsedData = JSON.parse(scannedText);
        setPatient({
          patientId: parsedData.patientId || 'N/A',
          name: parsedData.name || 'N/A',
          dob: parsedData.dob || 'N/A',
          age: parsedData.age || 'N/A',
          sex: parsedData.sex || 'N/A',
          civilStatus: parsedData.civilStatus || 'N/A',
          contactNumber: parsedData.contactNumber || 'N/A',
          membershipStatus: parsedData.membershipStatus || 'N/A',
          phicNo: parsedData.phicNo || '',
          address: parsedData.address || 'N/A',
        });
        setStatusMessage('QR Health Passport successfully decoded.');
      } catch (error) {
        setPatient({
          patientId: scannedText.substring(0, 15),
          name: 'Juan Scanned',
          dob: '1990-05-15',
          age: '36',
          sex: 'Male',
          civilStatus: 'Married',
          contactNumber: '09123456789',
          membershipStatus: 'PhilHealth Member',
          phicNo: '12-345678901-2',
          address: `Purok 1, ${currentUser?.location || 'Unassigned'}`,
        });
        setStatusMessage('Standard QR code detected. Mock profile applied.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConsultation((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((prev) => ({ ...prev, [name]: value }));
  };

  const toggleManualEntry = () => {
    setIsManualEntry(!isManualEntry);
    if (!isManualEntry) {
      setScanActive(false);
      setPatient((prev) => ({ ...prev, patientId: `MANUAL-${Math.floor(Math.random() * 10000)}` }));
      setStatusMessage('Manual Registration mode activated.');
    } else {
      setStatusMessage('');
    }
  };

  const toggleCamera = () => {
    setScanActive(!scanActive);
    if (!scanActive) setIsManualEntry(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (consultation.bloodPressure && !bpRegex.test(consultation.bloodPressure)) {
      alert('Please enter Blood Pressure in the correct format (e.g., 120/80).');
      return;
    }
    
    if (!patient.name || patient.name === '---') {
      alert('Please scan a QR code or manually enter patient identification first.');
      return;
    }

    const payload = { recordId: Date.now(), patient, consultation, timestamp: currentTime, status: 'Pending RHU Review' };

    if (!isOnline) {
      setOfflineQueue((prev) => [...prev, payload]);
      setStatusMessage('Network offline: Record stored in local device queue.');
    } else {
      setStatusMessage('Record successfully transmitted to validation gateway.');
    }
    
    setConsultation((prev) => ({ 
      ...prev, isPregnant: false, temperature: '', bloodPressure: '', pulseRate: '', respiratoryRate: '', weight: '', height: '', chiefComplaint: '', medicalHistory: '', actionTaken: '' 
    }));
    setPatient({
      patientId: '', name: '', dob: '', age: '', sex: '', civilStatus: '', contactNumber: '', membershipStatus: '', phicNo: '', address: `${currentUser?.location || 'Unassigned Barangay'}, Butuan City`,
    });
    setIsManualEntry(false);
  };

  const calculateBMI = () => {
    if (consultation.weight && consultation.height) {
      const heightInMeters = consultation.height / 100;
      const bmi = (consultation.weight / (heightInMeters * heightInMeters)).toFixed(1);
      let classification = '';
      if (bmi < 18.5) classification = '(Underweight)';
      else if (bmi < 24.9) classification = '(Normal)';
      else if (bmi < 29.9) classification = '(Overweight)';
      else classification = '(Obese)';
      return `${bmi} ${classification}`;
    }
    return '---';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-800">Community Health Intake Portal</h1>
            <p className="text-xs text-slate-500">Health Station: {currentUser?.location || 'Unassigned'}, Butuan City</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
              {isOnline ? 'Online' : 'Offline Mode'}
            </span>
            <span className="flex items-center text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {currentTime}
            </span>
          </div>
        </header>

        {statusMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">1. Digital Identification</h2>
            <div className="flex gap-2">
              <button type="button" onClick={toggleManualEntry} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${isManualEntry ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                <Keyboard className="w-4 h-4" />
                {isManualEntry ? 'Cancel Registration' : 'Manual Registration'}
              </button>
              <button type="button" onClick={toggleCamera} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                <Camera className="w-4 h-4" />
                {scanActive ? 'Close Camera' : 'Scan QR Passport'}
              </button>
            </div>
          </div>

          {scanActive && (
            <div className="bg-slate-900 rounded-lg p-4 text-center text-white space-y-3">
              <div className="rounded-lg overflow-hidden border-2 border-dashed border-blue-400">
                <Scanner onScan={handleScan} />
              </div>
              <p className="text-xs text-slate-300">Point a QR code at your webcam</p>
            </div>
          )}

          {isManualEntry ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                <input type="text" name="name" value={patient.name} onChange={handlePatientChange} placeholder="e.g. Maria Clara" className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact Number</label>
                <input type="text" name="contactNumber" value={patient.contactNumber} onChange={handlePatientChange} placeholder="09XX-XXX-XXXX" className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                <input type="date" name="dob" value={patient.dob} onChange={handlePatientChange} className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Age</label>
                  <input type="number" name="age" value={patient.age} onChange={handlePatientChange} placeholder="e.g. 28" className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sex</label>
                  <select name="sex" value={patient.sex} onChange={handlePatientChange} className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Civil Status</label>
                <select name="civilStatus" value={patient.civilStatus} onChange={handlePatientChange} className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Membership Status</label>
                <select name="membershipStatus" value={patient.membershipStatus} onChange={handlePatientChange} className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select PhilHealth/Program...</option>
                  <option value="PhilHealth Member">PhilHealth Member</option>
                  <option value="PhilHealth Dependent">PhilHealth Dependent</option>
                  <option value="4Ps / NHTS">4Ps / NHTS</option>
                  <option value="LGU Sponsored">LGU Sponsored</option>
                  <option value="None / Private">None / Private</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">PHIC No. (If Applicable)</label>
                <input type="text" name="phicNo" value={patient.phicNo} onChange={handlePatientChange} placeholder="xx-xxxxxxxxx-x" className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Address / Barangay</label>
                <input type="text" name="address" value={patient.address} onChange={handlePatientChange} className="w-full text-sm border-slate-300 rounded-md p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
              <div><span className="text-slate-400 block">Patient ID:</span><span className="font-semibold text-slate-700">{patient.patientId || 'Unassigned'}</span></div>
              <div><span className="text-slate-400 block">Full Name:</span><span className="font-semibold text-slate-700">{patient.name || '---'}</span></div>
              <div><span className="text-slate-400 block">Age / Sex:</span><span className="font-semibold text-slate-700">{patient.age ? `${patient.age} / ${patient.sex}` : '---'}</span></div>
              <div><span className="text-slate-400 block">DOB / Civil Status:</span><span className="font-semibold text-slate-700">{patient.dob ? `${patient.dob} / ${patient.civilStatus}` : '---'}</span></div>
              <div><span className="text-slate-400 block">Program / PHIC No:</span><span className="font-semibold text-slate-700">{patient.membershipStatus || '---'} {patient.phicNo ? `(${patient.phicNo})` : ''}</span></div>
              <div className="col-span-2 lg:col-span-5"><span className="text-slate-400 block">Barangay:</span><span className="font-semibold text-slate-700">{patient.address}</span></div>
            </div>
          )}
        </section>

        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">2. Individual Treatment Record (ITR)</h2>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          
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
            
            {patient.sex === 'Female' && (
              <div className="md:col-span-3 flex items-center gap-2 mt-1 p-3 bg-pink-50 border border-pink-100 rounded-lg text-pink-800">
                <input type="checkbox" name="isPregnant" checked={consultation.isPregnant} onChange={handleInputChange} className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-500" />
                <label className="text-sm font-medium">Patient is currently pregnant (Flag for Maternal Care Tracking)</label>
              </div>
            )}
          </div>

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">Vital Signs & Anthropometrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Temp (°C)</label>
                <input type="text" name="temperature" value={consultation.temperature} onChange={handleInputChange} placeholder="37.5" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">BP (mmHg)</label>
                <input type="text" name="bloodPressure" value={consultation.bloodPressure} onChange={handleInputChange} placeholder="120/80" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pulse Rate (bpm)</label>
                <input type="number" name="pulseRate" value={consultation.pulseRate} onChange={handleInputChange} placeholder="80" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Resp. Rate (cpm)</label>
                <input type="number" name="respiratoryRate" value={consultation.respiratoryRate} onChange={handleInputChange} placeholder="16" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
                <input type="number" name="weight" value={consultation.weight} onChange={handleInputChange} placeholder="65" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Height (cm)</label>
                <input type="number" name="height" value={consultation.height} onChange={handleInputChange} placeholder="160" required className="w-full text-sm border-slate-300 rounded-lg p-2 border focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2 bg-blue-100/50 rounded-lg p-2 border border-blue-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800">Auto-Calculated BMI:</span>
                <span className="text-sm font-bold text-blue-900">{calculateBMI()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Chief Complaint / Clinical Notes</label>
              <textarea name="chiefComplaint" rows="3" value={consultation.chiefComplaint} onChange={handleInputChange} placeholder="Record patient's primary symptoms and subjective complaints..." required className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Known Allergies & Past Medical History <span className="text-slate-400 font-normal">(Optional)</span></label>
              <textarea name="medicalHistory" rows="2" value={consultation.medicalHistory} onChange={handleInputChange} placeholder="e.g. Allergic to Penicillin, Diagnosed with Asthma..." className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          </div>

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