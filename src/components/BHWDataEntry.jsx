import React, { useState, useEffect, useMemo } from 'react';
import {
  Camera, CheckCircle, Wifi, WifiOff, Save, MapPin, Activity, Clock,
  QrCode, Users, ClipboardList, FileSpreadsheet, Plus, Search, Printer,
  Download, Eye, X, Calendar, AlertCircle, RefreshCw, UserPlus, History,
  FileText
} from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeCanvas } from 'qrcode.react';

// --- HELPER UTILITIES ---
const getBarangayCode = (location = 'AMP') => {
  const cleaned = location.replace(/Barangay\s+/i, '').trim();
  return (cleaned.substring(0, 3) || 'BHW').toUpperCase();
};

const calculateAgeFromDob = (dob) => {
  if (!dob) return '';
  const [y, m, d] = dob.split('-').map(Number);
  if (!y || !m || !d) return '';
  const today = new Date();
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age--;
  return age >= 0 ? String(age) : '';
};

const computeBMI = (weight, height) => {
  const w = parseFloat(weight);
  const h = parseFloat(height);
  if (!w || !h || h <= 0) return { value: null, label: '---', category: '' };
  const meters = h / 100;
  const bmi = Number((w / (meters * meters)).toFixed(1));
  let category = 'Normal';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25.0) category = 'Normal';
  else if (bmi < 30.0) category = 'Overweight';
  else category = 'Obese';
  return { value: bmi, label: `${bmi} (${category})`, category };
};

const getWRAAgeGroup = (age) => {
  const a = Number(age);
  if (a >= 10 && a <= 14) return '10-14';
  if (a >= 15 && a <= 19) return '15-19';
  if (a >= 20 && a <= 49) return '20-49';
  return null;
};

const getConsultationAgeGroup = (age) => {
  const a = Number(age);
  if (a <= 4) return '0-4';
  if (a <= 9) return '5-9';
  if (a <= 19) return '10-19';
  if (a <= 59) return '20-59';
  return '60+';
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const QUARTERS = [
  { id: 'Q1', label: 'Q1 (Jan–Mar)', months: [1, 2, 3] },
  { id: 'Q2', label: 'Q2 (Apr–Jun)', months: [4, 5, 6] },
  { id: 'Q3', label: 'Q3 (Jul–Sep)', months: [7, 8, 9] },
  { id: 'Q4', label: 'Q4 (Oct–Dec)', months: [10, 11, 12] },
];

// --- SEED DATA (Aligned with Butuan City Pilot Barangays & 2026 FHSIS) ---
const buildInitialPatients = (barangay) => [
  {
    patientId: `BHW-${getBarangayCode(barangay)}-2026-0001`,
    familySerialNo: 'FSN-2026-0101',
    name: 'Maria Santos',
    dob: '1998-05-15',
    age: '28',
    sex: 'Female',
    civilStatus: 'Married',
    contactNumber: '0917-123-4567',
    membershipStatus: 'PhilHealth Member',
    phicNo: '12-098765432-1',
    purok: 'Purok 2',
    address: `Purok 2, ${barangay}, Butuan City`,
    medicalHistory: 'No known allergies. Mild asthma (2022).',
    registeredAt: '2026-09-12',
  },
  {
    patientId: `BHW-${getBarangayCode(barangay)}-2026-0002`,
    familySerialNo: 'FSN-2026-0102',
    name: 'Juan Dela Cruz',
    dob: '1963-08-22',
    age: '63',
    sex: 'Male',
    civilStatus: 'Married',
    contactNumber: '0918-765-4321',
    membershipStatus: '4Ps / NHTS',
    phicNo: '',
    purok: 'Purok 4',
    address: `Purok 4, ${barangay}, Butuan City`,
    medicalHistory: 'Hypertension Stage 1. Allergic to Ibuprofen.',
    registeredAt: '2026-09-18',
  },
  {
    patientId: `BHW-${getBarangayCode(barangay)}-2026-0003`,
    familySerialNo: 'FSN-2026-0103',
    name: 'Ana Reyes',
    dob: '2008-02-10',
    age: '18',
    sex: 'Female',
    civilStatus: 'Single',
    contactNumber: '0919-987-6543',
    membershipStatus: 'PhilHealth Dependent',
    phicNo: '14-555666777-8',
    purok: 'Purok 1',
    address: `Purok 1, ${barangay}, Butuan City`,
    medicalHistory: 'First pregnancy (G1P0).',
    registeredAt: '2026-10-01',
  },
  {
    patientId: `BHW-${getBarangayCode(barangay)}-2026-0004`,
    familySerialNo: 'FSN-2026-0104',
    name: 'Lucas Mendoza',
    dob: '2026-04-14',
    age: '0',
    sex: 'Male',
    civilStatus: 'Single',
    contactNumber: '0920-445-8812',
    membershipStatus: 'PhilHealth Dependent',
    phicNo: '14-112233445-6',
    purok: 'Purok 3',
    address: `Purok 3, ${barangay}, Butuan City`,
    medicalHistory: 'Full-term newborn. Normal birth weight.',
    registeredAt: '2026-05-02',
  },
];

const buildInitialVisits = (patients) => [
  {
    visitId: 'VIS-2026-1001',
    patientId: patients[0].patientId,
    patientSnapshot: { name: patients[0].name, age: patients[0].age, sex: patients[0].sex, address: patients[0].address },
    visitDate: '2026-10-06',
    timestamp: '10/6/2026, 9:15:22 AM',
    natureOfVisit: 'New Consultation',
    fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case',
    fpClientType: '',
    ancVisitNumber: '',
    bpDangerSign: false,
    isPregnant: false,
    temperature: '39.1',
    bloodPressure: '110/70',
    pulseRate: '95',
    respiratoryRate: '20',
    weight: '55',
    height: '155',
    bmi: '22.9 (Normal)',
    bmiCategory: 'Normal',
    waist: '72',
    fbs: '',
    chiefComplaint: 'High fever for 3 days, joint pain, mild rash.',
    actionTaken: 'Referred to RHU / Hospital',
    referralRoute: 'BHS to RHU',
    outcome: 'Referred to RHU / Hospital',
    nextFollowUpDate: '2026-11-30',
    latitude: '8.955400',
    longitude: '125.597700',
    syncStatus: 'Synced',
  },
  {
    visitId: 'VIS-2026-1002',
    patientId: patients[1].patientId,
    patientSnapshot: { name: patients[1].name, age: patients[1].age, sex: patients[1].sex, address: patients[1].address },
    visitDate: '2026-11-05',
    timestamp: '11/5/2026, 10:20:00 AM',
    natureOfVisit: 'Follow-up Visit',
    fhsisSection: 'Section E: Non-Communicable Diseases (PhilPEN)',
    serviceSubtype: 'Hypertension (PhilPEN)',
    fpClientType: '',
    ancVisitNumber: '',
    bpDangerSign: false,
    isPregnant: false,
    temperature: '36.9',
    bloodPressure: '150/95',
    pulseRate: '88',
    respiratoryRate: '18',
    weight: '85',
    height: '165',
    bmi: '31.2 (Obese)',
    bmiCategory: 'Obese',
    waist: '98',
    fbs: '112',
    chiefComplaint: 'Headache and dizziness; maintenance medication refill.',
    actionTaken: 'Given Medication / First Aid',
    referralRoute: 'None',
    outcome: 'Under Monitoring',
    nextFollowUpDate: '2026-11-20',
    latitude: '8.956100',
    longitude: '125.598200',
    syncStatus: 'Synced',
  },
  {
    visitId: 'VIS-2026-1003',
    patientId: patients[2].patientId,
    patientSnapshot: { name: patients[2].name, age: patients[2].age, sex: patients[2].sex, address: patients[2].address },
    visitDate: '2026-11-12',
    timestamp: '11/12/2026, 2:10:00 PM',
    natureOfVisit: 'Follow-up Visit',
    fhsisSection: 'Section B: Maternal Care',
    serviceSubtype: 'Prenatal Care (ANC Visit)',
    fpClientType: '',
    ancVisitNumber: '2nd ANC (20 wks)',
    bpDangerSign: false,
    isPregnant: true,
    temperature: '36.8',
    bloodPressure: '110/75',
    pulseRate: '80',
    respiratoryRate: '16',
    weight: '56',
    height: '158',
    bmi: '22.4 (Normal)',
    bmiCategory: 'Normal',
    waist: '',
    fbs: '90',
    chiefComplaint: 'Routine 2nd prenatal check-up; Iron + Folic Acid given.',
    actionTaken: 'Given Immunization / Supplement',
    referralRoute: 'None',
    outcome: 'Under Monitoring',
    nextFollowUpDate: '2026-12-10',
    latitude: '8.954200',
    longitude: '125.596100',
    syncStatus: 'Synced',
  },
  {
    visitId: 'VIS-2026-1004',
    patientId: patients[3].patientId,
    patientSnapshot: { name: patients[3].name, age: patients[3].age, sex: patients[3].sex, address: patients[3].address },
    visitDate: '2026-11-18',
    timestamp: '11/18/2026, 8:45:00 AM',
    natureOfVisit: 'New Consultation',
    fhsisSection: 'Section C: Child Care & Immunization',
    serviceSubtype: 'Immunization (DPT-HiB-HepB / OPV / PCV)',
    fpClientType: '',
    ancVisitNumber: '',
    bpDangerSign: false,
    isPregnant: false,
    temperature: '36.7',
    bloodPressure: '90/60',
    pulseRate: '115',
    respiratoryRate: '30',
    weight: '8.2',
    height: '69',
    bmi: '17.2 (Underweight)',
    bmiCategory: 'Underweight',
    waist: '',
    fbs: '',
    chiefComplaint: 'Scheduled infant immunization & Vitamin A dose.',
    actionTaken: 'Given Immunization / Supplement',
    referralRoute: 'None',
    outcome: 'Completed',
    nextFollowUpDate: '2026-12-18',
    latitude: '8.955100',
    longitude: '125.597100',
    syncStatus: 'Synced',
  },
];

const FHSIS_SUBTYPES = {
  'Section A: Family Planning': [
    'Pills (POP / COC)',
    'Injectables (DMPA)',
    'Condom',
    'Implant',
    'IUD',
    'BTL / NSV',
    'NFP (LAM / SDM / BBT)',
  ],
  'Section B: Maternal Care': [
    'Prenatal Care (ANC Visit)',
    'Completed 8ANC & Tracked',
    'Facility-Based Delivery (FBD)',
    'Postpartum Care (PNC Visit)',
    'Iron/Folic Acid Supplementation',
    'Td Vaccination (Pregnant)',
  ],
  'Section C: Child Care & Immunization': [
    'Immunization (BCG / HepB)',
    'Immunization (DPT-HiB-HepB / OPV / PCV)',
    'Immunization (MMR / FIC)',
    'Vitamin A Supplementation',
    'Sick Child: Acute Diarrhea (ORS/Zinc)',
    'Sick Child: Pneumonia',
  ],
  'Section D: Oral Health': [
    'Oral Health: 1st Visit',
    'Oral Health: Completed 2 Visits',
  ],
  'Section E: Non-Communicable Diseases (PhilPEN)': [
    'PhilPEN Risk Assessment Only',
    'Hypertension (PhilPEN)',
    'Type II Diabetes (PhilPEN)',
    'Blindness / Eye Screening',
    'Mental Health (mhGAP)',
    'Cervical / Breast Cancer Screening',
  ],
  'Section G: Infectious Diseases & Morbidity': [
    'Dengue Clinical Case',
    'Acute Respiratory Infection',
    'Animal Bites / Rabies',
    'Schistosomiasis',
    'Soil-Transmitted Helminthiasis (STH / Deworming)',
    'TB / Leprosy / HIV-STI Screening',
  ],
};

export default function BHWDataEntry({ currentUser }) {
  const barangayName = currentUser?.location || 'Barangay Ampayon';
  const brgyCode = getBarangayCode(barangayName);
  const storageKeyPatients = `idg4health_patients_${brgyCode}`;
  const storageKeyVisits = `idg4health_visits_${brgyCode}`;

  // Navigation & Global UI State
  const [activeTab, setActiveTab] = useState('profiling'); // 'profiling' | 'intake' | 'reports'
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const [statusMessage, setStatusMessage] = useState('');

  // Core Persisted State: Patients & Visits
  const [patients, setPatients] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeyPatients);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return buildInitialPatients(barangayName);
  });

  const [visits, setVisits] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKeyVisits);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return buildInitialVisits(buildInitialPatients(barangayName));
  });

  const [offlineQueue, setOfflineQueue] = useState([]);

  // Profiling Modals & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [qrModalPatient, setQrModalPatient] = useState(null);
  const [historyModalPatient, setHistoryModalPatient] = useState(null);

  const emptyPatientForm = {
    familySerialNo: '',
    name: '',
    dob: '',
    age: '',
    sex: '',
    civilStatus: 'Single',
    contactNumber: '',
    membershipStatus: 'PhilHealth Member',
    phicNo: '',
    purok: 'Purok 1',
    medicalHistory: '',
  };
  const [newPatientForm, setNewPatientForm] = useState(emptyPatientForm);

  // Intake / Visit Logging State
  const [scanActive, setScanActive] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [intakeSearch, setIntakeSearch] = useState('');
  const todayISO = new Date().toISOString().split('T')[0];

  const [consultation, setConsultation] = useState({
    visitDate: todayISO,
    natureOfVisit: 'New Consultation',
    fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case',
    fpClientType: 'Current User',
    ancVisitNumber: '1st ANC (Up to 12 wks)',
    bpDangerSign: false,
    isPregnant: false,
    temperature: '',
    bloodPressure: '',
    pulseRate: '',
    respiratoryRate: '',
    weight: '',
    height: '',
    waist: '',
    fbs: '',
    chiefComplaint: '',
    actionTaken: '',
    referralRoute: 'None',
    outcome: 'Under Monitoring',
    nextFollowUpDate: '',
    latitude: '8.955400',
    longitude: '125.597700',
  });

  // Reporting Tab State (FHSIS Monthly & Quarterly)
  const now = new Date();
  const [reportPeriodType, setReportPeriodType] = useState('Monthly'); // 'Monthly' | 'Quarterly'
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1); // 1-12
  const [reportQuarter, setReportQuarter] = useState(`Q${Math.floor(now.getMonth() / 3) + 1}`);
  const [reportYear, setReportYear] = useState(String(now.getFullYear()));
  const [bhsName, setBhsName] = useState(`${barangayName} Health Station`);
  const [projectedPop, setProjectedPop] = useState('12,450');
  const [preparedBy, setPreparedBy] = useState('BHW Staff');
  const [notedBy, setNotedBy] = useState('RHU Midwife / Public Health Nurse');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKeyPatients, JSON.stringify(patients));
    } catch (_) {}
  }, [patients, storageKeyPatients]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKeyVisits, JSON.stringify(visits));
    } catch (_) {}
  }, [visits, storageKeyVisits]);

  // Network, Clock, and Geolocation listeners
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
        () => {}
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  // --- PATIENT PROFILING & UNIQUE QR ID LOGIC ---
  const generateUniquePatientId = () => {
    const year = new Date().getFullYear();
    const seq = String(patients.length + 1).padStart(4, '0');
    const randSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `BHW-${brgyCode}-${year}-${seq}${randSuffix}`;
  };

  const handleNewPatientChange = (e) => {
    const { name, value } = e.target;
    setNewPatientForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob') {
        updated.age = calculateAgeFromDob(value);
      }
      return updated;
    });
  };

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatientForm.name.trim() || !newPatientForm.sex) {
      alert('Please enter the patient’s Full Name and Sex.');
      return;
    }

    const generatedId = generateUniquePatientId();
    const createdPatient = {
      patientId: generatedId,
      familySerialNo: newPatientForm.familySerialNo || `FSN-${new Date().getFullYear()}-${String(patients.length + 101)}`,
      name: newPatientForm.name.trim(),
      dob: newPatientForm.dob,
      age: newPatientForm.age || '0',
      sex: newPatientForm.sex,
      civilStatus: newPatientForm.civilStatus,
      contactNumber: newPatientForm.contactNumber,
      membershipStatus: newPatientForm.membershipStatus,
      phicNo: newPatientForm.phicNo,
      purok: newPatientForm.purok,
      address: `${newPatientForm.purok}, ${barangayName}, Butuan City`,
      medicalHistory: newPatientForm.medicalHistory,
      registeredAt: todayISO,
    };

    setPatients((prev) => [createdPatient, ...prev]);
    setNewPatientForm(emptyPatientForm);
    setShowRegisterModal(false);
    setQrModalPatient(createdPatient); // Immediately display generated scannable QR passport
    setStatusMessage(`Patient "${createdPatient.name}" registered with Unique ID: ${generatedId}`);
  };

  const buildQRPayload = (p) =>
    JSON.stringify({
      patientId: p.patientId,
      name: p.name,
      dob: p.dob,
      age: p.age,
      sex: p.sex,
      civilStatus: p.civilStatus,
      contactNumber: p.contactNumber,
      membershipStatus: p.membershipStatus,
      phicNo: p.phicNo,
      address: p.address,
    });

  const handleDownloadQR = (p) => {
    const canvas = document.getElementById(`qr-canvas-${p.patientId}`);
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = `${p.patientId}_${p.name.replace(/\s+/g, '_')}_HealthPassport.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQRCard = (p) => {
    const canvas = document.getElementById(`qr-canvas-${p.patientId}`);
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const win = window.open('', '_blank', 'width=480,height=640');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>IDG4Health QR Health Passport - ${p.patientId}</title>
          <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; padding: 24px; background: #f8fafc; }
            .card { width: 340px; border: 2px solid #0f172a; border-radius: 12px; padding: 18px; background: #fff; text-align: center; }
            .header { border-bottom: 1px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 12px; }
            .title { font-size: 14px; font-weight: bold; color: #0f172a; margin: 0; }
            .sub { font-size: 11px; color: #475569; margin: 3px 0 0; }
            .qr { margin: 12px auto; }
            .pid { font-family: monospace; font-size: 14px; font-weight: bold; color: #1d4ed8; background: #eff6ff; padding: 4px 8px; border-radius: 6px; display: inline-block; }
            .meta { text-align: left; font-size: 12px; margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 10px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <p class="title">CITY HEALTH DEPARTMENT — BUTUAN CITY</p>
              <p class="sub">IDG4Health Digital Patient Health Passport</p>
            </div>
            <div class="qr"><img src="${imgData}" width="180" height="180" /></div>
            <div class="pid">${p.patientId}</div>
            <div class="meta">
              <strong>Name:</strong> ${p.name}<br/>
              <strong>Age / Sex:</strong> ${p.age} yrs / ${p.sex}<br/>
              <strong>DOB:</strong> ${p.dob || 'N/A'}<br/>
              <strong>Family Serial No.:</strong> ${p.familySerialNo || 'N/A'}<br/>
              <strong>Program:</strong> ${p.membershipStatus} ${p.phicNo ? `(${p.phicNo})` : ''}<br/>
              <strong>Address:</strong> ${p.address}
            </div>
          </div>
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // --- VISIT MONITORING HELPERS ---
  const getPatientVisits = (patientId) =>
    visits
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => (b.visitDate > a.visitDate ? 1 : -1));

  const getFollowUpStatus = (patientVisits) => {
    if (!patientVisits.length) return { label: 'No Visits Yet', tone: 'bg-slate-100 text-slate-600' };
    const latest = patientVisits[0];
    if (!latest.nextFollowUpDate) {
      return { label: latest.outcome || 'Logged', tone: 'bg-emerald-100 text-emerald-700' };
    }
    if (latest.nextFollowUpDate < todayISO) {
      return { label: `Overdue (${latest.nextFollowUpDate})`, tone: 'bg-rose-100 text-rose-700' };
    }
    if (latest.nextFollowUpDate === todayISO) {
      return { label: 'Due Today', tone: 'bg-amber-100 text-amber-800' };
    }
    return { label: `Next: ${latest.nextFollowUpDate}`, tone: 'bg-blue-100 text-blue-700' };
  };

  const startVisitForPatient = (p) => {
    const existingVisits = getPatientVisits(p.patientId);
    setSelectedPatient(p);
    setConsultation((prev) => ({
      ...prev,
      natureOfVisit: existingVisits.length > 0 ? 'Follow-up Visit' : 'New Consultation',
      isPregnant: p.sex === 'Female' ? prev.isPregnant : false,
    }));
    setHistoryModalPatient(null);
    setActiveTab('intake');
    setStatusMessage(
      existingVisits.length > 0
        ? `Loaded returning patient ${p.name} (${existingVisits.length} previous visit${existingVisits.length > 1 ? 's' : ''}). Switched to Follow-up Visit.`
        : `Loaded patient ${p.name} for New Consultation.`
    );
  };

  // --- QR SCANNER HANDLER ---
  const handleScan = (detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    const scannedText = detectedCodes[0].rawValue;
    setScanActive(false);

    try {
      const parsed = JSON.parse(scannedText);
      const found = patients.find((p) => p.patientId === parsed.patientId);
      if (found) {
        startVisitForPatient(found);
      } else {
        // Auto-import patient from valid QR Passport if from another device
        const imported = {
          patientId: parsed.patientId || generateUniquePatientId(),
          familySerialNo: parsed.familySerialNo || 'FSN-SCANNED',
          name: parsed.name || 'Unnamed Patient',
          dob: parsed.dob || '',
          age: parsed.age || calculateAgeFromDob(parsed.dob) || '0',
          sex: parsed.sex || 'Female',
          civilStatus: parsed.civilStatus || 'Single',
          contactNumber: parsed.contactNumber || '',
          membershipStatus: parsed.membershipStatus || 'None / Private',
          phicNo: parsed.phicNo || '',
          purok: 'Purok 1',
          address: parsed.address || `${barangayName}, Butuan City`,
          medicalHistory: '',
          registeredAt: todayISO,
        };
        setPatients((prev) => [imported, ...prev]);
        startVisitForPatient(imported);
      }
    } catch (_) {
      // Fallback: match plain Patient ID string
      const foundById = patients.find((p) => p.patientId === scannedText.trim());
      if (foundById) {
        startVisitForPatient(foundById);
      } else {
        setStatusMessage(`Unrecognized QR code ("${scannedText.substring(0, 24)}"). Please register patient first.`);
      }
    }
  };

  // --- CLINICAL INTAKE FORM HANDLERS ---
  const handleConsultationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConsultation((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'fhsisSection') {
        next.serviceSubtype = FHSIS_SUBTYPES[value]?.[0] || '';
      }
      if (name === 'actionTaken' && value === 'Referred to RHU / Hospital') {
        next.referralRoute = 'BHS to RHU';
        next.outcome = 'Referred to RHU / Hospital';
      }
      return next;
    });
  };

  const handleSubmitVisit = (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('Please scan a patient QR code or select a registered patient first.');
      return;
    }

    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (consultation.bloodPressure && !bpRegex.test(consultation.bloodPressure)) {
      alert('Please enter Blood Pressure in the correct format (e.g., 120/80).');
      return;
    }

    const bmiData = computeBMI(consultation.weight, consultation.height);
    const newVisit = {
      visitId: `VIS-${Date.now().toString().slice(-6)}`,
      patientId: selectedPatient.patientId,
      patientSnapshot: {
        name: selectedPatient.name,
        age: selectedPatient.age,
        sex: selectedPatient.sex,
        address: selectedPatient.address,
      },
      ...consultation,
      bmi: bmiData.label,
      bmiCategory: bmiData.category,
      timestamp: currentTime,
      syncStatus: isOnline ? 'Synced' : 'Queued Offline',
    };

    setVisits((prev) => [newVisit, ...prev]);
    if (!isOnline) {
      setOfflineQueue((prev) => [...prev, newVisit]);
      setStatusMessage(`Offline Mode: Visit for ${selectedPatient.name} saved locally and queued for sync.`);
    } else {
      setStatusMessage(`Visit ${newVisit.visitId} for ${selectedPatient.name} recorded and added to FHSIS tallies.`);
    }

    setConsultation((prev) => ({
      ...prev,
      bpDangerSign: false,
      isPregnant: false,
      temperature: '',
      bloodPressure: '',
      pulseRate: '',
      respiratoryRate: '',
      weight: '',
      height: '',
      waist: '',
      fbs: '',
      chiefComplaint: '',
      actionTaken: '',
      referralRoute: 'None',
      outcome: 'Under Monitoring',
      nextFollowUpDate: '',
    }));
  };

  const handleSyncOfflineQueue = () => {
    if (!isOnline || offlineQueue.length === 0) return;
    setVisits((prev) => prev.map((v) => ({ ...v, syncStatus: 'Synced' })));
    setOfflineQueue([]);
    setStatusMessage('All queued offline visits have been synchronized.');
  };

  // --- FHSIS MONTHLY / QUARTERLY REPORT AGGREGATION ---
  const filteredReportVisits = useMemo(() => {
    return visits.filter((v) => {
      if (!v.visitDate) return false;
      const [y, m] = v.visitDate.split('-').map(Number);
      if (String(y) !== String(reportYear)) return false;
      if (reportPeriodType === 'Monthly') {
        return m === Number(reportMonth);
      }
      const qObj = QUARTERS.find((q) => q.id === reportQuarter);
      return qObj ? qObj.months.includes(m) : false;
    });
  }, [visits, reportPeriodType, reportMonth, reportQuarter, reportYear]);

  const fhsisSummary = useMemo(() => {
    const makeWRA = () => ({ '10-14': 0, '15-19': 0, '20-49': 0, total: 0 });
    const makeSex = () => ({ M: 0, F: 0, total: 0 });
    const makeAgeSex = () => ({
      '0-4': { M: 0, F: 0 },
      '5-9': { M: 0, F: 0 },
      '10-19': { M: 0, F: 0 },
      '20-59': { M: 0, F: 0 },
      '60+': { M: 0, F: 0 },
      totalM: 0,
      totalF: 0,
      total: 0,
    });

    const incWRA = (bucket, age) => {
      const grp = getWRAAgeGroup(age);
      if (grp) bucket[grp] += 1;
      bucket.total += 1;
    };

    const incSex = (bucket, sex) => {
      if (sex === 'Male') bucket.M += 1;
      else bucket.F += 1;
      bucket.total += 1;
    };

    const incAgeSex = (bucket, age, sex) => {
      const grp = getConsultationAgeGroup(age);
      const key = sex === 'Male' ? 'M' : 'F';
      bucket[grp][key] += 1;
      if (key === 'M') bucket.totalM += 1;
      else bucket.totalF += 1;
      bucket.total += 1;
    };

    const data = {
      secA: {
        newAcceptors: makeWRA(),
        currentUsers: makeWRA(),
        dropOuts: makeWRA(),
      },
      secB: {
        ancVisits: makeWRA(),
        completed8ANC: makeWRA(),
        bpMeasured: makeWRA(),
        highBpDanger: makeWRA(),
        fbdDeliveries: makeWRA(),
        pncVisits: makeWRA(),
        ironFolic: makeWRA(),
      },
      secC: {
        bcgHepB: makeSex(),
        pentaOpvPcv: makeSex(),
        mmrFic: makeSex(),
        vitA: makeSex(),
        acuteDiarrhea: makeSex(),
        pneumonia: makeSex(),
      },
      secD: {
        firstVisit: makeSex(),
        twoVisits: makeSex(),
      },
      secE: {
        riskAssessedAdult: makeSex(),
        riskAssessedSenior: makeSex(),
        overweightObese: makeSex(),
        hypertensiveAdult: makeSex(),
        hypertensiveSenior: makeSex(),
        diabeticAdult: makeSex(),
        diabeticSenior: makeSex(),
        otherNcdScreenings: makeSex(),
      },
      secG: {
        dengue: makeSex(),
        ari: makeSex(),
        rabiesBites: makeSex(),
        schisto: makeSex(),
        sthDeworming: makeSex(),
        tbLeprosyHiv: makeSex(),
      },
      lguConsults: {
        newConsultation: makeAgeSex(),
        followUp: makeAgeSex(),
        teleconsultation: makeAgeSex(),
        bhsToRhuReferral: makeAgeSex(),
      },
    };

    filteredReportVisits.forEach((v) => {
      const age = Number(v.patientSnapshot?.age || 0);
      const sex = v.patientSnapshot?.sex || 'Female';

      // LGU Data Banking — Consultations & Referrals
      if (v.natureOfVisit === 'New Consultation') incAgeSex(data.lguConsults.newConsultation, age, sex);
      else if (v.natureOfVisit === 'Follow-up Visit') incAgeSex(data.lguConsults.followUp, age, sex);
      else if (v.natureOfVisit === 'Teleconsultation') incAgeSex(data.lguConsults.teleconsultation, age, sex);

      if (v.referralRoute === 'BHS to RHU' || v.actionTaken === 'Referred to RHU / Hospital') {
        incAgeSex(data.lguConsults.bhsToRhuReferral, age, sex);
      }

      // Section A: Family Planning
      if (v.fhsisSection === 'Section A: Family Planning') {
        if (v.fpClientType === 'New Acceptor') incWRA(data.secA.newAcceptors, age);
        else if (v.fpClientType === 'Drop-out') incWRA(data.secA.dropOuts, age);
        else incWRA(data.secA.currentUsers, age);
      }

      // Section B: Maternal Care
      if (v.fhsisSection === 'Section B: Maternal Care' || v.isPregnant) {
        if (v.serviceSubtype === 'Prenatal Care (ANC Visit)') incWRA(data.secB.ancVisits, age);
        if (v.serviceSubtype === 'Completed 8ANC & Tracked') incWRA(data.secB.completed8ANC, age);
        if (v.serviceSubtype === 'Facility-Based Delivery (FBD)') incWRA(data.secB.fbdDeliveries, age);
        if (v.serviceSubtype === 'Postpartum Care (PNC Visit)') incWRA(data.secB.pncVisits, age);
        if (v.serviceSubtype === 'Iron/Folic Acid Supplementation') incWRA(data.secB.ironFolic, age);
        if (v.bloodPressure) incWRA(data.secB.bpMeasured, age);
        const sys = parseInt((v.bloodPressure || '').split('/')[0], 10);
        const dia = parseInt((v.bloodPressure || '').split('/')[1], 10);
        if (v.bpDangerSign || sys >= 140 || dia >= 90) incWRA(data.secB.highBpDanger, age);
      }

      // Section C: Child Care
      if (v.fhsisSection === 'Section C: Child Care & Immunization') {
        if (v.serviceSubtype === 'Immunization (BCG / HepB)') incSex(data.secC.bcgHepB, sex);
        if (v.serviceSubtype === 'Immunization (DPT-HiB-HepB / OPV / PCV)') incSex(data.secC.pentaOpvPcv, sex);
        if (v.serviceSubtype === 'Immunization (MMR / FIC)') incSex(data.secC.mmrFic, sex);
        if (v.serviceSubtype === 'Vitamin A Supplementation') incSex(data.secC.vitA, sex);
        if (v.serviceSubtype === 'Sick Child: Acute Diarrhea (ORS/Zinc)') incSex(data.secC.acuteDiarrhea, sex);
        if (v.serviceSubtype === 'Sick Child: Pneumonia') incSex(data.secC.pneumonia, sex);
      }

      // Section D: Oral Health
      if (v.fhsisSection === 'Section D: Oral Health') {
        if (v.serviceSubtype === 'Oral Health: 1st Visit') incSex(data.secD.firstVisit, sex);
        if (v.serviceSubtype === 'Oral Health: Completed 2 Visits') incSex(data.secD.twoVisits, sex);
      }

      // Section E: NCDs (PhilPEN)
      if (v.fhsisSection === 'Section E: Non-Communicable Diseases (PhilPEN)') {
        if (age >= 60) incSex(data.secE.riskAssessedSenior, sex);
        else if (age >= 20) incSex(data.secE.riskAssessedAdult, sex);

        if (v.bmiCategory === 'Overweight' || v.bmiCategory === 'Obese') {
          incSex(data.secE.overweightObese, sex);
        }
        if (v.serviceSubtype === 'Hypertension (PhilPEN)') {
          if (age >= 60) incSex(data.secE.hypertensiveSenior, sex);
          else incSex(data.secE.hypertensiveAdult, sex);
        }
        if (v.serviceSubtype === 'Type II Diabetes (PhilPEN)') {
          if (age >= 60) incSex(data.secE.diabeticSenior, sex);
          else incSex(data.secE.diabeticAdult, sex);
        }
        if (['Blindness / Eye Screening', 'Mental Health (mhGAP)', 'Cervical / Breast Cancer Screening'].includes(v.serviceSubtype)) {
          incSex(data.secE.otherNcdScreenings, sex);
        }
      }

      // Section G: Infectious Diseases
      if (v.fhsisSection === 'Section G: Infectious Diseases & Morbidity') {
        if (v.serviceSubtype === 'Dengue Clinical Case') incSex(data.secG.dengue, sex);
        if (v.serviceSubtype === 'Acute Respiratory Infection') incSex(data.secG.ari, sex);
        if (v.serviceSubtype === 'Animal Bites / Rabies') incSex(data.secG.rabiesBites, sex);
        if (v.serviceSubtype === 'Schistosomiasis') incSex(data.secG.schisto, sex);
        if (v.serviceSubtype === 'Soil-Transmitted Helminthiasis (STH / Deworming)') incSex(data.secG.sthDeworming, sex);
        if (v.serviceSubtype === 'TB / Leprosy / HIV-STI Screening') incSex(data.secG.tbLeprosyHiv, sex);
      }
    });

    return data;
  }, [filteredReportVisits]);

  const reportPeriodLabel =
    reportPeriodType === 'Monthly'
      ? `${MONTHS[reportMonth - 1]} ${reportYear}`
      : `${QUARTERS.find((q) => q.id === reportQuarter)?.label} ${reportYear}`;

  const handleExportFHSISCsv = () => {
    const rows = [
      [`FHSIS ${reportPeriodType.toUpperCase()} REPORT (${reportPeriodType === 'Monthly' ? 'M1' : reportQuarter})`],
      ['Barangay', barangayName, 'BHS', bhsName],
      ['City/Municipality', 'Butuan City', 'Province', 'Agusan del Norte'],
      ['Coverage Period', reportPeriodLabel, 'Projected Population', projectedPop],
      [],
      ['SECTION A. FAMILY PLANNING SERVICES (WRA)', '10-14', '15-19', '20-49', 'TOTAL'],
      ['New Acceptors', fhsisSummary.secA.newAcceptors['10-14'], fhsisSummary.secA.newAcceptors['15-19'], fhsisSummary.secA.newAcceptors['20-49'], fhsisSummary.secA.newAcceptors.total],
      ['Current Users', fhsisSummary.secA.currentUsers['10-14'], fhsisSummary.secA.currentUsers['15-19'], fhsisSummary.secA.currentUsers['20-49'], fhsisSummary.secA.currentUsers.total],
      ['Drop-outs', fhsisSummary.secA.dropOuts['10-14'], fhsisSummary.secA.dropOuts['15-19'], fhsisSummary.secA.dropOuts['20-49'], fhsisSummary.secA.dropOuts.total],
      [],
      ['SECTION B. MATERNAL CARE AND SERVICES', '10-14', '15-19', '20-49', 'TOTAL'],
      ['Prenatal Care (ANC Visits)', fhsisSummary.secB.ancVisits['10-14'], fhsisSummary.secB.ancVisits['15-19'], fhsisSummary.secB.ancVisits['20-49'], fhsisSummary.secB.ancVisits.total],
      ['Completed 8ANC & Tracked', fhsisSummary.secB.completed8ANC['10-14'], fhsisSummary.secB.completed8ANC['15-19'], fhsisSummary.secB.completed8ANC['20-49'], fhsisSummary.secB.completed8ANC.total],
      ['Pregnant Women with BP Measured', fhsisSummary.secB.bpMeasured['10-14'], fhsisSummary.secB.bpMeasured['15-19'], fhsisSummary.secB.bpMeasured['20-49'], fhsisSummary.secB.bpMeasured.total],
      ['High BP / Danger Signs Identified', fhsisSummary.secB.highBpDanger['10-14'], fhsisSummary.secB.highBpDanger['15-19'], fhsisSummary.secB.highBpDanger['20-49'], fhsisSummary.secB.highBpDanger.total],
      ['Facility-Based Deliveries (FBD)', fhsisSummary.secB.fbdDeliveries['10-14'], fhsisSummary.secB.fbdDeliveries['15-19'], fhsisSummary.secB.fbdDeliveries['20-49'], fhsisSummary.secB.fbdDeliveries.total],
      ['Postpartum Care (4PNC Visits)', fhsisSummary.secB.pncVisits['10-14'], fhsisSummary.secB.pncVisits['15-19'], fhsisSummary.secB.pncVisits['20-49'], fhsisSummary.secB.pncVisits.total],
      [],
      ['SECTION C. CHILD CARE & IMMUNIZATION', 'Male', 'Female', 'TOTAL'],
      ['BCG / HepB', fhsisSummary.secC.bcgHepB.M, fhsisSummary.secC.bcgHepB.F, fhsisSummary.secC.bcgHepB.total],
      ['DPT-HiB-HepB / OPV / PCV', fhsisSummary.secC.pentaOpvPcv.M, fhsisSummary.secC.pentaOpvPcv.F, fhsisSummary.secC.pentaOpvPcv.total],
      ['MMR / FIC', fhsisSummary.secC.mmrFic.M, fhsisSummary.secC.mmrFic.F, fhsisSummary.secC.mmrFic.total],
      ['Vitamin A Supplementation', fhsisSummary.secC.vitA.M, fhsisSummary.secC.vitA.F, fhsisSummary.secC.vitA.total],
      ['Sick Child: Acute Diarrhea', fhsisSummary.secC.acuteDiarrhea.M, fhsisSummary.secC.acuteDiarrhea.F, fhsisSummary.secC.acuteDiarrhea.total],
      ['Sick Child: Pneumonia', fhsisSummary.secC.pneumonia.M, fhsisSummary.secC.pneumonia.F, fhsisSummary.secC.pneumonia.total],
      [],
      ['SECTION E. NON-COMMUNICABLE DISEASES (PhilPEN)', 'Male', 'Female', 'TOTAL'],
      ['Adults (20-59) Risk Assessed', fhsisSummary.secE.riskAssessedAdult.M, fhsisSummary.secE.riskAssessedAdult.F, fhsisSummary.secE.riskAssessedAdult.total],
      ['Seniors (60+) Risk Assessed', fhsisSummary.secE.riskAssessedSenior.M, fhsisSummary.secE.riskAssessedSenior.F, fhsisSummary.secE.riskAssessedSenior.total],
      ['Identified Overweight / Obese', fhsisSummary.secE.overweightObese.M, fhsisSummary.secE.overweightObese.F, fhsisSummary.secE.overweightObese.total],
      ['Hypertensives (Adults 20-59)', fhsisSummary.secE.hypertensiveAdult.M, fhsisSummary.secE.hypertensiveAdult.F, fhsisSummary.secE.hypertensiveAdult.total],
      ['Hypertensives (Seniors 60+)', fhsisSummary.secE.hypertensiveSenior.M, fhsisSummary.secE.hypertensiveSenior.F, fhsisSummary.secE.hypertensiveSenior.total],
      ['Type II Diabetics (Adults 20-59)', fhsisSummary.secE.diabeticAdult.M, fhsisSummary.secE.diabeticAdult.F, fhsisSummary.secE.diabeticAdult.total],
      ['Type II Diabetics (Seniors 60+)', fhsisSummary.secE.diabeticSenior.M, fhsisSummary.secE.diabeticSenior.F, fhsisSummary.secE.diabeticSenior.total],
      [],
      ['SECTION G. INFECTIOUS DISEASES & MORBIDITY', 'Male', 'Female', 'TOTAL'],
      ['Dengue Clinical Case', fhsisSummary.secG.dengue.M, fhsisSummary.secG.dengue.F, fhsisSummary.secG.dengue.total],
      ['Acute Respiratory Infection', fhsisSummary.secG.ari.M, fhsisSummary.secG.ari.F, fhsisSummary.secG.ari.total],
      ['Animal Bites / Rabies', fhsisSummary.secG.rabiesBites.M, fhsisSummary.secG.rabiesBites.F, fhsisSummary.secG.rabiesBites.total],
      ['Schistosomiasis', fhsisSummary.secG.schisto.M, fhsisSummary.secG.schisto.F, fhsisSummary.secG.schisto.total],
      ['STH / Deworming', fhsisSummary.secG.sthDeworming.M, fhsisSummary.secG.sthDeworming.F, fhsisSummary.secG.sthDeworming.total],
      [],
      ['LGU DATA BANKING — MEDICAL CONSULTATIONS', 'Total Male', 'Total Female', 'GRAND TOTAL'],
      ['New Consultations', fhsisSummary.lguConsults.newConsultation.totalM, fhsisSummary.lguConsults.newConsultation.totalF, fhsisSummary.lguConsults.newConsultation.total],
      ['Follow-up Visits', fhsisSummary.lguConsults.followUp.totalM, fhsisSummary.lguConsults.followUp.totalF, fhsisSummary.lguConsults.followUp.total],
      ['Teleconsultations', fhsisSummary.lguConsults.teleconsultation.totalM, fhsisSummary.lguConsults.teleconsultation.totalF, fhsisSummary.lguConsults.teleconsultation.total],
      ['Referrals (BHS to RHU)', fhsisSummary.lguConsults.bhsToRhuReferral.totalM, fhsisSummary.lguConsults.bhsToRhuReferral.totalF, fhsisSummary.lguConsults.bhsToRhuReferral.total],
      [],
      ['Prepared By', preparedBy, 'Noted By', notedBy],
    ];

    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const periodSlug = reportPeriodType === 'Monthly' ? MONTHS[reportMonth - 1] : reportQuarter;
    link.download = `FHSIS_${reportPeriodType}_${brgyCode}_${periodSlug}_${reportYear}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Lists
  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.patientId.toLowerCase().includes(q) ||
      (p.familySerialNo || '').toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  });

  const overdueCount = patients.filter((p) => {
    const pv = getPatientVisits(p.patientId);
    return pv.length > 0 && pv[0].nextFollowUpDate && pv[0].nextFollowUpDate < todayISO;
  }).length;

  const intakeDropdownPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(intakeSearch.toLowerCase()) ||
      p.patientId.toLowerCase().includes(intakeSearch.toLowerCase())
  );

  const bmiPreview = computeBMI(consultation.weight, consultation.height);
  const selectedPatientPastVisits = selectedPatient ? getPatientVisits(selectedPatient.patientId) : [];

  return (
    <div className="flex min-h-[calc(100vh-57px)] bg-slate-50 font-sans">
      {/* SIDEBAR NAVIGATION (Matches RHU & CHO Portals) */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col shadow-lg shrink-0 print:hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">BHW Portal</h2>
          <p className="text-xs text-slate-400 mt-1">{barangayName}, Butuan City</p>
        </div>

        <nav className="flex-1 py-4 space-y-1">
          <button
            onClick={() => setActiveTab('profiling')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              activeTab === 'profiling' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" /> Patient Profiling
          </button>
          <button
            onClick={() => setActiveTab('intake')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              activeTab === 'intake' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ClipboardList className="w-5 h-5" /> Consultation
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              activeTab === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" /> FHSIS Report
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Connectivity</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                isOnline ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncOfflineQueue}
              disabled={!isOnline}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-md font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync {offlineQueue.length} Queued
            </button>
          )}
          <div className="flex items-center gap-1.5 text-slate-400 pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="truncate">{currentTime}</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden gap-2 mb-4 bg-white p-1.5 rounded-xl border border-slate-200 print:hidden">
          {[
            { id: 'profiling', label: 'Profiles & QR' },
            { id: 'intake', label: 'Log Visit' },
            { id: 'reports', label: 'FHSIS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="max-w-6xl mx-auto mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-blue-600" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage('')} className="text-blue-400 hover:text-blue-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================
            TAB 1: PATIENT PROFILING, QR GENERATION & VISIT MONITORING
           ============================================================ */}
        {activeTab === 'profiling' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Patient Profiling</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Register residents, issue scannable QR Health Passports, and track follow-up visits for {barangayName}.
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <UserPlus className="w-4 h-4" /> Register New Patient
              </button>
            </header>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Registered Patients</p>
                  <p className="text-xl font-bold text-slate-800">{patients.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Visits Logged</p>
                  <p className="text-xl font-bold text-slate-800">{visits.length}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Overdue Follow-ups</p>
                  <p className="text-xl font-bold text-rose-700">{overdueCount}</p>
                </div>
              </div>
            </div>

            {/* Search + Patient Master Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Patient ID, Name, Family Serial No., or Purok..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredPatients.length} of {patients.length} profiles
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Unique ID / Serial</th>
                      <th className="p-4 font-semibold">Patient Profile</th>
                      <th className="p-4 font-semibold">Program / PHIC</th>
                      <th className="p-4 font-semibold text-center">Visits</th>
                      <th className="p-4 font-semibold">Monitoring Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredPatients.map((p) => {
                      const pVisits = getPatientVisits(p.patientId);
                      const followStatus = getFollowUpStatus(pVisits);
                      return (
                        <tr key={p.patientId} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <div className="font-mono text-xs font-bold text-blue-700">{p.patientId}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{p.familySerialNo}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">{p.name}</div>
                            <div className="text-xs text-slate-500">
                              {p.age} yrs • {p.sex} • {p.purok}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-xs font-semibold text-slate-700">{p.membershipStatus}</div>
                            <div className="text-[11px] text-slate-400">{p.phicNo || 'No PHIC No.'}</div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-800 font-bold text-xs">
                              {pVisits.length}
                            </span>
                            {pVisits[0] && (
                              <div className="text-[10px] text-slate-400 mt-1">Last: {pVisits[0].visitDate}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${followStatus.tone}`}>
                              {followStatus.label}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setQrModalPatient(p)}
                                title="View / Print QR Passport"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition"
                              >
                                <QrCode className="w-3.5 h-3.5" /> QR ID
                              </button>
                              <button
                                onClick={() => setHistoryModalPatient(p)}
                                title="View Visit History"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition"
                              >
                                <History className="w-3.5 h-3.5" /> Visits
                              </button>
                              <button
                                onClick={() => startVisitForPatient(p)}
                                title="Log New Consultation / Follow-up"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-semibold transition"
                              >
                                <Plus className="w-3.5 h-3.5" /> Log
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredPatients.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-500">
                          No patient profiles found. Click "Register New Patient & Generate QR" to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: CLINICAL INTAKE & FOLLOW-UP VISIT LOGGING
           ============================================================ */}
        {activeTab === 'intake' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-slate-800">Individual Treatment Record (ITR)</h1>
              <p className="text-sm text-slate-500 mt-1">
                Scan a patient’s QR Health Passport or select a registered profile to log a consultation and update FHSIS tallies.
              </p>
            </header>

            {/* Step 1: Identify Patient via QR or Registry */}
            <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  1. Patient Identification
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition"
                  >
                    <UserPlus className="w-4 h-4" /> New Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanActive(!scanActive)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                  >
                    <Camera className="w-4 h-4" /> {scanActive ? 'Close Camera' : 'Scan QR Passport'}
                  </button>
                </div>
              </div>

              {scanActive && (
                <div className="bg-slate-900 rounded-lg p-4 text-center text-white space-y-3">
                  <div className="max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-dashed border-blue-400">
                    <Scanner onScan={handleScan} />
                  </div>
                  <p className="text-xs text-slate-300">Point a generated Patient QR Health Passport at your webcam.</p>
                </div>
              )}

              {/* Quick Lookup Dropdown if QR is unavailable */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={intakeSearch}
                    onChange={(e) => setIntakeSearch(e.target.value)}
                    placeholder="Or search registered patient by Name / Unique ID..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <select
                  value={selectedPatient?.patientId || ''}
                  onChange={(e) => {
                    const found = patients.find((p) => p.patientId === e.target.value);
                    if (found) startVisitForPatient(found);
                  }}
                  className="sm:w-72 text-sm border border-slate-300 rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Select Registered Patient --</option>
                  {intakeDropdownPatients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.name} ({p.patientId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Patient Banner + Returning Visit Monitoring Strip */}
              {selectedPatient ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-400 block">Unique Patient ID</span>
                      <span className="font-mono font-bold text-blue-700">{selectedPatient.patientId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Full Name</span>
                      <span className="font-semibold text-slate-800">{selectedPatient.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Age / Sex</span>
                      <span className="font-semibold text-slate-800">{selectedPatient.age} yrs / {selectedPatient.sex}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Program / PHIC</span>
                      <span className="font-semibold text-slate-800">{selectedPatient.membershipStatus}</span>
                    </div>
                  </div>

                  {selectedPatientPastVisits.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Returning Patient:</strong> {selectedPatientPastVisits.length} prior visit(s). Last seen{' '}
                          <strong>{selectedPatientPastVisits[0].visitDate}</strong> — {selectedPatientPastVisits[0].serviceSubtype}{' '}
                          (BP: {selectedPatientPastVisits[0].bloodPressure || 'N/A'}).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHistoryModalPatient(selectedPatient)}
                        className="text-amber-800 underline font-semibold shrink-0"
                      >
                        View Full History
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  No patient selected yet. Scan a QR Passport or pick a patient above.
                </div>
              )}
            </section>

            {/* Step 2: ITR & FHSIS Classification Form */}
            <form onSubmit={handleSubmitVisit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  2. Consultation Details & FHSIS Classification
                </h2>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    name="visitDate"
                    value={consultation.visitDate}
                    onChange={handleConsultationChange}
                    required
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nature of Visit (FHSIS LGU Consultations)</label>
                  <select
                    name="natureOfVisit"
                    value={consultation.natureOfVisit}
                    onChange={handleConsultationChange}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New Consultation">New Consultation</option>
                    <option value="Follow-up Visit">Follow-up Visit</option>
                    <option value="Teleconsultation">Teleconsultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">FHSIS Program Section</label>
                  <select
                    name="fhsisSection"
                    value={consultation.fhsisSection}
                    onChange={handleConsultationChange}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(FHSIS_SUBTYPES).map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Specific Indicator / Case Type</label>
                  <select
                    name="serviceSubtype"
                    value={consultation.serviceSubtype}
                    onChange={handleConsultationChange}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-blue-500"
                  >
                    {(FHSIS_SUBTYPES[consultation.fhsisSection] || []).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                {/* Contextual Family Planning Field */}
                {consultation.fhsisSection === 'Section A: Family Planning' && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Family Planning Client Type</label>
                    <select
                      name="fpClientType"
                      value={consultation.fpClientType}
                      onChange={handleConsultationChange}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                    >
                      <option value="New Acceptor">New Acceptor (Present Month)</option>
                      <option value="Current User">Current User / Follow-up</option>
                      <option value="Drop-out">Drop-out</option>
                    </select>
                  </div>
                )}

                {/* Contextual Maternal Fields */}
                {(consultation.fhsisSection === 'Section B: Maternal Care' || selectedPatient?.sex === 'Female') && (
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-pink-50 border border-pink-100 rounded-lg text-pink-900">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        name="isPregnant"
                        checked={consultation.isPregnant}
                        onChange={handleConsultationChange}
                        className="w-4 h-4 text-pink-600 rounded border-pink-300"
                      />
                      Flag as Pregnant / Maternal Care Case
                    </label>
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        name="bpDangerSign"
                        checked={consultation.bpDangerSign}
                        onChange={handleConsultationChange}
                        className="w-4 h-4 text-rose-600 rounded border-rose-300"
                      />
                      High BP (≥140/90) or Danger Signs Present
                    </label>
                  </div>
                )}
              </div>

              {/* Vital Signs & Anthropometrics (Matches Butuan CHD ITR Page 3) */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-xs font-bold text-blue-800 mb-3 uppercase tracking-wider">
                  General Survey, Vital Signs & Anthropometrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Temp (°C)</label>
                    <input type="text" name="temperature" value={consultation.temperature} onChange={handleConsultationChange} placeholder="36.8" required className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">BP (mmHg)</label>
                    <input type="text" name="bloodPressure" value={consultation.bloodPressure} onChange={handleConsultationChange} placeholder="120/80" required className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Pulse Rate (bpm)</label>
                    <input type="number" name="pulseRate" value={consultation.pulseRate} onChange={handleConsultationChange} placeholder="80" required className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Resp. Rate (cpm)</label>
                    <input type="number" name="respiratoryRate" value={consultation.respiratoryRate} onChange={handleConsultationChange} placeholder="18" required className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Weight (kg)</label>
                    <input type="number" step="0.1" name="weight" value={consultation.weight} onChange={handleConsultationChange} placeholder="60" required className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Height (cm)</label>
                    <input type="number" step="0.1" name="height" value={consultation.height} onChange={handleConsultationChange} placeholder="160" required className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Waist (cm) <span className="text-slate-400">(Opt)</span></label>
                    <input type="number" name="waist" value={consultation.waist} onChange={handleConsultationChange} placeholder="80" className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">FBS (mg/dL) <span className="text-slate-400">(Opt)</span></label>
                    <input type="number" name="fbs" value={consultation.fbs} onChange={handleConsultationChange} placeholder="95" className="w-full text-sm border border-slate-300 rounded-lg p-2 bg-white" />
                  </div>
                  <div className="col-span-2 md:col-span-4 bg-blue-100/60 rounded-lg p-2.5 border border-blue-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-800">Auto-Calculated BMI (Auto-tallied in PhilPEN NCD):</span>
                    <span className="text-sm font-bold text-blue-900">{bmiPreview.label}</span>
                  </div>
                </div>
              </div>

              {/* Clinical Notes & Visit Monitoring Plan */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Chief Complaint & History of Present Illness</label>
                  <textarea
                    name="chiefComplaint"
                    rows="3"
                    value={consultation.chiefComplaint}
                    onChange={handleConsultationChange}
                    placeholder="Record patient's symptoms, clinical observations, and notes..."
                    required
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Intervention / Action Taken</label>
                    <select
                      name="actionTaken"
                      value={consultation.actionTaken}
                      onChange={handleConsultationChange}
                      required
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                    >
                      <option value="">Select intervention...</option>
                      <option value="Given Medication / First Aid">Given Medication / First Aid</option>
                      <option value="Referred to RHU / Hospital">Referred to RHU / Hospital</option>
                      <option value="Routine Monitoring / Advised">Routine Monitoring / Advised</option>
                      <option value="Given Immunization / Supplement">Given Immunization / Supplement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Visit Outcome</label>
                    <select
                      name="outcome"
                      value={consultation.outcome}
                      onChange={handleConsultationChange}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                    >
                      <option value="Under Monitoring">Under Monitoring</option>
                      <option value="Improved">Improved</option>
                      <option value="Completed">Completed / Discharged</option>
                      <option value="Referred to RHU / Hospital">Referred to RHU / Hospital</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Next Follow-up Date
                    </label>
                    <input
                      type="date"
                      name="nextFollowUpDate"
                      value={consultation.nextFollowUpDate}
                      onChange={handleConsultationChange}
                      className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Geo-Tag: Lat {consultation.latitude}, Long {consultation.longitude}
                </span>
                <span>{isOnline ? 'Ready to transmit' : 'Will queue offline'}</span>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm shadow-sm transition"
              >
                <Save className="w-4 h-4" /> Save Visit & Update Patient Monitoring Log
              </button>
            </form>
          </div>
        )}

        {/* ============================================================
            TAB 3: FHSIS MONTHLY (M1) & QUARTERLY REPORTING
           ============================================================ */}
        {activeTab === 'reports' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Controls Card (Hidden on Print) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 print:hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">FHSIS Report</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Auto-tallied from BHW patient visits following DOH FHSIS Form M1 (CHD.PDMD.F.001.REV00) & Quarterly Summaries.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportFHSISCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition"
                  >
                    <Download className="w-4 h-4 text-emerald-600" /> Export CSV (Excel)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                  >
                    <Printer className="w-4 h-4" /> Print / Save Official PDF
                  </button>
                </div>
              </div>

              {/* Period & Header Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Report Frequency</label>
                  <select
                    value={reportPeriodType}
                    onChange={(e) => setReportPeriodType(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="Monthly">Monthly (FHSIS M1)</option>
                    <option value="Quarterly">Quarterly Summary</option>
                  </select>
                </div>

                {reportPeriodType === 'Monthly' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(Number(e.target.value))}
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50"
                    >
                      {MONTHS.map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Quarter</label>
                    <select
                      value={reportQuarter}
                      onChange={(e) => setReportQuarter(e.target.value)}
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50"
                    >
                      {QUARTERS.map((q) => (
                        <option key={q.id} value={q.id}>{q.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                  <select
                    value={reportYear}
                    onChange={(e) => setReportYear(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Projected Population</label>
                  <input
                    type="text"
                    value={projectedPop}
                    onChange={(e) => setProjectedPop(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Prepared By (BHW)</label>
                  <input
                    type="text"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL FHSIS REPORT DOCUMENT */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
              {/* Official DOH / Butuan CHD Header */}
              <div className="border-b-2 border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      Republic of the Philippines • City Health Department, Butuan City
                    </p>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      FHSIS REPORT FOR THE {reportPeriodType === 'Monthly' ? 'MONTH' : 'QUARTER'} OF {reportPeriodLabel.toUpperCase()}
                    </h2>
                  </div>
                  <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded">
                    {reportPeriodType === 'Monthly' ? 'FORM M1 — BRGY' : `QUARTERLY (${reportQuarter})`}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <div><span className="text-slate-500 block">Name of Barangay:</span><strong className="text-slate-800">{barangayName}</strong></div>
                  <div><span className="text-slate-500 block">Name of BHS:</span><strong className="text-slate-800">{bhsName}</strong></div>
                  <div><span className="text-slate-500 block">City / Province:</span><strong className="text-slate-800">Butuan City, Agusan del Norte</strong></div>
                  <div><span className="text-slate-500 block">Projected Pop / Records:</span><strong className="text-slate-800">{projectedPop} ({filteredReportVisits.length} visits)</strong></div>
                </div>
              </div>

              {/* SECTION A & B: FAMILY PLANNING & MATERNAL CARE (WRA Age Groups: 10-14, 15-19, 20-49) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section A. Family Planning Services (WRA)
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center w-14">10-14</th>
                        <th className="p-2 border border-slate-200 text-center w-14">15-19</th>
                        <th className="p-2 border border-slate-200 text-center w-14">20-49</th>
                        <th className="p-2 border border-slate-200 text-center w-16 bg-slate-200">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['New Acceptors (Present Period)', fhsisSummary.secA.newAcceptors],
                        ['Current Users (Modern FP)', fhsisSummary.secA.currentUsers],
                        ['Drop-outs', fhsisSummary.secA.dropOuts],
                      ].map(([label, row]) => (
                        <tr key={label}>
                          <td className="p-2 border border-slate-200 font-medium">{label}</td>
                          <td className="p-2 border border-slate-200 text-center">{row['10-14']}</td>
                          <td className="p-2 border border-slate-200 text-center">{row['15-19']}</td>
                          <td className="p-2 border border-slate-200 text-center">{row['20-49']}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section B. Maternal Care & Services
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center w-14">10-14</th>
                        <th className="p-2 border border-slate-200 text-center w-14">15-19</th>
                        <th className="p-2 border border-slate-200 text-center w-14">20-49</th>
                        <th className="p-2 border border-slate-200 text-center w-16 bg-slate-200">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Pregnant Women w/ ANC Visit', fhsisSummary.secB.ancVisits],
                        ['Completed at least 8ANC (Tracked)', fhsisSummary.secB.completed8ANC],
                        ['Pregnant Women w/ BP Measured', fhsisSummary.secB.bpMeasured],
                        ['Identified w/ High BP or Danger Signs', fhsisSummary.secB.highBpDanger],
                        ['Facility-Based Deliveries (FBD)', fhsisSummary.secB.fbdDeliveries],
                        ['Postpartum Care (4PNC Visits)', fhsisSummary.secB.pncVisits],
                      ].map(([label, row]) => (
                        <tr key={label}>
                          <td className="p-2 border border-slate-200 font-medium">{label}</td>
                          <td className="p-2 border border-slate-200 text-center">{row['10-14']}</td>
                          <td className="p-2 border border-slate-200 text-center">{row['15-19']}</td>
                          <td className="p-2 border border-slate-200 text-center">{row['20-49']}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION C, E & G: SEX-DISAGGREGATED TABLES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section C. Child Care & Oral Health
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center w-12">M</th>
                        <th className="p-2 border border-slate-200 text-center w-12">F</th>
                        <th className="p-2 border border-slate-200 text-center w-14 bg-slate-200">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['BCG / HepB (0-11m)', fhsisSummary.secC.bcgHepB],
                        ['DPT-HiB-HepB / OPV / PCV', fhsisSummary.secC.pentaOpvPcv],
                        ['MMR / FIC', fhsisSummary.secC.mmrFic],
                        ['Vitamin A Supplementation', fhsisSummary.secC.vitA],
                        ['Sick Child: Acute Diarrhea', fhsisSummary.secC.acuteDiarrhea],
                        ['Sick Child: Pneumonia', fhsisSummary.secC.pneumonia],
                        ['Sec D: Oral Health (1st Visit)', fhsisSummary.secD.firstVisit],
                        ['Sec D: Oral Health (2 Visits)', fhsisSummary.secD.twoVisits],
                      ].map(([label, row]) => (
                        <tr key={label}>
                          <td className="p-2 border border-slate-200 font-medium">{label}</td>
                          <td className="p-2 border border-slate-200 text-center">{row.M}</td>
                          <td className="p-2 border border-slate-200 text-center">{row.F}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section E. NCDs (PhilPEN)
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center w-12">M</th>
                        <th className="p-2 border border-slate-200 text-center w-12">F</th>
                        <th className="p-2 border border-slate-200 text-center w-14 bg-slate-200">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Adults (20-59) Risk Assessed', fhsisSummary.secE.riskAssessedAdult],
                        ['Seniors (60+) Risk Assessed', fhsisSummary.secE.riskAssessedSenior],
                        ['Overweight / Obese (BMI)', fhsisSummary.secE.overweightObese],
                        ['Hypertensive (20-59)', fhsisSummary.secE.hypertensiveAdult],
                        ['Hypertensive (60+)', fhsisSummary.secE.hypertensiveSenior],
                        ['Type II Diabetes (20-59)', fhsisSummary.secE.diabeticAdult],
                        ['Type II Diabetes (60+)', fhsisSummary.secE.diabeticSenior],
                        ['Eye / mhGAP / Cancer Screen', fhsisSummary.secE.otherNcdScreenings],
                      ].map(([label, row]) => (
                        <tr key={label}>
                          <td className="p-2 border border-slate-200 font-medium">{label}</td>
                          <td className="p-2 border border-slate-200 text-center">{row.M}</td>
                          <td className="p-2 border border-slate-200 text-center">{row.F}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section G. Infectious Diseases
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center w-12">M</th>
                        <th className="p-2 border border-slate-200 text-center w-12">F</th>
                        <th className="p-2 border border-slate-200 text-center w-14 bg-slate-200">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Dengue Clinical Case', fhsisSummary.secG.dengue],
                        ['Acute Respiratory Infection', fhsisSummary.secG.ari],
                        ['Animal Bites / Rabies', fhsisSummary.secG.rabiesBites],
                        ['Schistosomiasis Cases', fhsisSummary.secG.schisto],
                        ['STH / Deworming', fhsisSummary.secG.sthDeworming],
                        ['TB / Leprosy / HIV-STI', fhsisSummary.secG.tbLeprosyHiv],
                      ].map(([label, row]) => (
                        <tr key={label}>
                          <td className="p-2 border border-slate-200 font-medium">{label}</td>
                          <td className="p-2 border border-slate-200 text-center">{row.M}</td>
                          <td className="p-2 border border-slate-200 text-center">{row.F}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LGU DATA BANKING — MEDICAL CONSULTATIONS & REFERRALS (Official Age-Sex Matrix) */}
              <div className="overflow-x-auto">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                  LGU Data Banking — Medical Consultations & Referrals (By Age Group & Sex)
                </h3>
                <table className="w-full text-xs border border-slate-200 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700">
                      <th rowSpan="2" className="p-2 border border-slate-200 text-left">Consultation / Referral Type</th>
                      {['0-4', '5-9', '10-19', '20-59', '60+'].map((grp) => (
                        <th key={grp} colSpan="2" className="p-1.5 border border-slate-200 text-center">{grp} yrs</th>
                      ))}
                      <th colSpan="2" className="p-1.5 border border-slate-200 text-center bg-slate-200">Total</th>
                      <th rowSpan="2" className="p-2 border border-slate-200 text-center bg-blue-50">Grand Total</th>
                    </tr>
                    <tr className="bg-slate-50 text-[10px] text-slate-600">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <React.Fragment key={i}>
                          <th className="p-1 border border-slate-200 text-center">M</th>
                          <th className="p-1 border border-slate-200 text-center">F</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['1a. New Consultation', fhsisSummary.lguConsults.newConsultation],
                      ['1b. Follow-up Visit', fhsisSummary.lguConsults.followUp],
                      ['1c. Teleconsultation', fhsisSummary.lguConsults.teleconsultation],
                      ['2a. Referrals (BHS to RHU)', fhsisSummary.lguConsults.bhsToRhuReferral],
                    ].map(([label, row]) => (
                      <tr key={label}>
                        <td className="p-2 border border-slate-200 font-medium">{label}</td>
                        {['0-4', '5-9', '10-19', '20-59', '60+'].map((grp) => (
                          <React.Fragment key={grp}>
                            <td className="p-1.5 border border-slate-200 text-center">{row[grp].M}</td>
                            <td className="p-1.5 border border-slate-200 text-center">{row[grp].F}</td>
                          </React.Fragment>
                        ))}
                        <td className="p-1.5 border border-slate-200 text-center font-semibold bg-slate-50">{row.totalM}</td>
                        <td className="p-1.5 border border-slate-200 text-center font-semibold bg-slate-50">{row.totalF}</td>
                        <td className="p-1.5 border border-slate-200 text-center font-bold bg-blue-50 text-blue-900">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Official Signatory Footer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
                <div>
                  <p className="text-slate-500">Prepared by:</p>
                  <p className="mt-6 font-bold text-slate-800 border-b border-slate-400 pb-1 inline-block min-w-[220px]">
                    {preparedBy}
                  </p>
                  <p className="text-slate-500 mt-1">Barangay Health Worker — {barangayName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Noted / Verified by:</p>
                  <p className="mt-6 font-bold text-slate-800 border-b border-slate-400 pb-1 inline-block min-w-[220px]">
                    {notedBy}
                  </p>
                  <p className="text-slate-500 mt-1">Local Health Unit / City Health Department</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 text-right">
                Form Reference: CHD.PDMD.F.001.REV00 (FHSIS M1) / CHD.HND.F.090.REV01 • Generated via IDG4Health on {todayISO}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================
          MODAL 1: REGISTER NEW PATIENT (Generates Unique ID & QR)
         ============================================================ */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Register Patient & Generate QR ID
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Name (Last, First, Middle)</label>
                  <input type="text" name="name" value={newPatientForm.name} onChange={handleNewPatientChange} required placeholder="e.g. Dela Cruz, Maria Santos" className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Date of Birth</label>
                  <input type="date" name="dob" value={newPatientForm.dob} onChange={handleNewPatientChange} required className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Age</label>
                    <input type="number" name="age" value={newPatientForm.age} onChange={handleNewPatientChange} required placeholder="Auto" className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Sex</label>
                    <select name="sex" value={newPatientForm.sex} onChange={handleNewPatientChange} required className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white">
                      <option value="">Select...</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Civil Status</label>
                  <select name="civilStatus" value={newPatientForm.civilStatus} onChange={handleNewPatientChange} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white">
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Contact Number</label>
                  <input type="text" name="contactNumber" value={newPatientForm.contactNumber} onChange={handleNewPatientChange} placeholder="09XX-XXX-XXXX" className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Purok</label>
                  <input type="text" name="purok" value={newPatientForm.purok} onChange={handleNewPatientChange} placeholder="e.g. Purok 1" className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Family Serial No. (Optional)</label>
                  <input type="text" name="familySerialNo" value={newPatientForm.familySerialNo} onChange={handleNewPatientChange} placeholder="Auto-generated if blank" className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PhilHealth / Program</label>
                  <select name="membershipStatus" value={newPatientForm.membershipStatus} onChange={handleNewPatientChange} className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white">
                    <option value="PhilHealth Member">PhilHealth Member</option>
                    <option value="PhilHealth Dependent">PhilHealth Dependent</option>
                    <option value="4Ps / NHTS">4Ps / NHTS</option>
                    <option value="LGU Sponsored">LGU Sponsored</option>
                    <option value="None / Private">None / Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">PHIC No. (If Applicable)</label>
                  <input type="text" name="phicNo" value={newPatientForm.phicNo} onChange={handleNewPatientChange} placeholder="XX-XXXXXXXXX-X" className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Known Allergies / Past Medical History</label>
                  <textarea name="medicalHistory" rows="2" value={newPatientForm.medicalHistory} onChange={handleNewPatientChange} placeholder="e.g. Asthma, Hypertension, Drug Allergies..." className="w-full text-sm border border-slate-300 rounded-lg p-2.5" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> Save & Generate QR ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: SCANNABLE QR HEALTH PASSPORT VIEWER / DOWNLOAD / PRINT
         ============================================================ */}
      {qrModalPatient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" /> Digital QR Health Passport
              </h3>
              <button onClick={() => setQrModalPatient(null)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="inline-block p-4 bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                <QRCodeCanvas
                  id={`qr-canvas-${qrModalPatient.patientId}`}
                  value={buildQRPayload(qrModalPatient)}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>

              <div>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-mono text-sm font-bold rounded-lg border border-blue-200">
                  {qrModalPatient.patientId}
                </span>
                <h4 className="text-lg font-bold text-slate-800 mt-2">{qrModalPatient.name}</h4>
                <p className="text-xs text-slate-500">
                  {qrModalPatient.age} yrs • {qrModalPatient.sex} • {qrModalPatient.address}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {qrModalPatient.membershipStatus} {qrModalPatient.phicNo ? `(${qrModalPatient.phicNo})` : ''}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handleDownloadQR(qrModalPatient)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  <Download className="w-4 h-4" /> Download PNG
                </button>
                <button
                  onClick={() => handlePrintQRCard(qrModalPatient)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Printer className="w-4 h-4" /> Print ID Card
                </button>
              </div>
              <button
                onClick={() => {
                  const p = qrModalPatient;
                  setQrModalPatient(null);
                  startVisitForPatient(p);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Proceed to Log Consultation for {qrModalPatient.name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: PATIENT VISIT MONITORING & LONGITUDINAL HISTORY
         ============================================================ */}
      {historyModalPatient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" /> Patient Visit Monitoring Log
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {historyModalPatient.name} • <span className="font-mono font-semibold text-blue-700">{historyModalPatient.patientId}</span> • {historyModalPatient.address}
                </p>
              </div>
              <button onClick={() => setHistoryModalPatient(null)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {historyModalPatient.medicalHistory && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <strong>Past Medical History / Allergies:</strong> {historyModalPatient.medicalHistory}
                </div>
              )}

              {getPatientVisits(historyModalPatient.patientId).length === 0 ? (
                <div className="p-10 text-center text-slate-500 text-sm">
                  No consultation visits recorded yet for this patient.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase">
                        <th className="p-3 font-semibold">Date / Type</th>
                        <th className="p-3 font-semibold">Vitals & Survey</th>
                        <th className="p-3 font-semibold">FHSIS Classification</th>
                        <th className="p-3 font-semibold">Complaint & Intervention</th>
                        <th className="p-3 font-semibold">Outcome & Follow-up</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getPatientVisits(historyModalPatient.patientId).map((v) => (
                        <tr key={v.visitId} className="hover:bg-slate-50">
                          <td className="p-3 align-top whitespace-nowrap">
                            <div className="font-bold text-slate-800">{v.visitDate}</div>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                              {v.natureOfVisit}
                            </span>
                          </td>
                          <td className="p-3 align-top whitespace-nowrap text-slate-600 space-y-0.5">
                            <div>BP: <strong>{v.bloodPressure}</strong> | T: <strong>{v.temperature}°C</strong></div>
                            <div>PR: {v.pulseRate} | RR: {v.respiratoryRate}</div>
                            <div>BMI: {v.bmi}</div>
                            {(v.waist || v.fbs) && (
                              <div>{v.waist ? `Waist: ${v.waist}cm ` : ''}{v.fbs ? `FBS: ${v.fbs}` : ''}</div>
                            )}
                          </td>
                          <td className="p-3 align-top">
                            <div className="font-semibold text-slate-800">{v.serviceSubtype}</div>
                            <div className="text-[11px] text-slate-400">{v.fhsisSection}</div>
                          </td>
                          <td className="p-3 align-top max-w-xs">
                            <p className="text-slate-700">{v.chiefComplaint}</p>
                            <p className="text-emerald-700 font-medium mt-1">{v.actionTaken}</p>
                          </td>
                          <td className="p-3 align-top whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{v.outcome}</div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Next Visit: <strong>{v.nextFollowUpDate || 'None set'}</strong>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => {
                  const p = historyModalPatient;
                  setHistoryModalPatient(null);
                  setQrModalPatient(p);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
              >
                <QrCode className="w-4 h-4" /> View QR Passport
              </button>
              <button
                onClick={() => startVisitForPatient(historyModalPatient)}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                <Plus className="w-4 h-4" /> Log Follow-up Visit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}