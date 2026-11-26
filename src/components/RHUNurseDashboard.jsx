import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileCheck, Activity, Baby, FlaskConical, FileSpreadsheet,
  Eye, CheckCircle, X, MapPin, Search, AlertCircle, Phone,
  MessageSquare, Clock, RefreshCw, Plus, Printer, Download,
  ClipboardCheck, RotateCcw, FileText, Filter
} from 'lucide-react';

// --- SHARED CONSTANTS (Aligned with BHW & CHO Portals) ---
const FHSIS_SECTIONS = [
  'Section A: Family Planning',
  'Section B: Maternal Care',
  'Section C: Child Care & Immunization',
  'Section D: Oral Health',
  'Section E: Non-Communicable Diseases (PhilPEN)',
  'Section G: Infectious Diseases & Morbidity',
];

const BARANGAY_LIST = [
  'Ampayon', 'Tiniwisan', 'Baan 3', 'Baan Riverside', 'Bading',
  'Bancasi', 'Doongan', 'Libertad', 'Mahogany', 'San Vicente', 'Villa Kananga',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const QUARTERS = [
  { id: 'Q1', label: 'Q1 (Jan–Mar)', months: [1, 2, 3] },
  { id: 'Q2', label: 'Q2 (Apr–Jun)', months: [4, 5, 6] },
  { id: 'Q3', label: 'Q3 (Jul–Sep)', months: [7, 8, 9] },
  { id: 'Q4', label: 'Q4 (Oct–Dec)', months: [10, 11, 12] },
];

const STORAGE_KEYS = {
  RHU_BASELINE: 'idg4health_rhu_baseline_visits',
  BIRTHING: 'idg4health_rhu_birthing_records',
  LAB_REQUESTS: 'idg4health_rhu_lab_form2a',
};

// --- SEED DATA ---
const INITIAL_RHU_BASELINE = [
  {
    visitId: 'REC-2026-001',
    patientId: 'BHW-TIN-2026-0001',
    patientSnapshot: {
      name: 'Maria Santos', dob: '1998-05-15', age: '28', sex: 'Female',
      address: 'Purok 2, Barangay Tiniwisan, Butuan City',
      membershipStatus: 'PhilHealth Member', contactNumber: '0917-123-4567', phicNo: '12-098765432-1',
    },
    barangay: 'Tiniwisan',
    visitDate: '2026-11-24',
    timestamp: '11/24/2026, 9:15:22 AM',
    natureOfVisit: 'New Consultation',
    fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case',
    fpClientType: '',
    bpDangerSign: false,
    isPregnant: false,
    temperature: '39.1', bloodPressure: '110/70', pulseRate: '95', respiratoryRate: '20',
    weight: '55', height: '155', bmi: '22.9 (Normal)', bmiCategory: 'Normal',
    waist: '72', fbs: '',
    chiefComplaint: 'High fever for 3 days, joint pain, and mild rash on arms.',
    medicalHistory: 'No known allergies. Previous hospitalization for mild asthma in 2022.',
    actionTaken: 'Referred to RHU / Hospital',
    referralRoute: 'BHS to RHU',
    outcome: 'Referred to RHU / Hospital',
    latitude: '8.965400', longitude: '125.577700',
    validationStatus: 'Pending Review',
    validatorRemarks: '',
    labFlagged: false,
    source: 'BHS Submission',
  },
  {
    visitId: 'REC-2026-002',
    patientId: 'BHW-AMP-2026-0002',
    patientSnapshot: {
      name: 'Juan Dela Cruz', dob: '1963-08-22', age: '63', sex: 'Male',
      address: 'Purok 4, Barangay Ampayon, Butuan City',
      membershipStatus: '4Ps / NHTS', contactNumber: '0918-765-4321', phicNo: '',
    },
    barangay: 'Ampayon',
    visitDate: '2026-11-22',
    timestamp: '11/22/2026, 11:30:05 AM',
    natureOfVisit: 'Follow-up Visit',
    fhsisSection: 'Section E: Non-Communicable Diseases (PhilPEN)',
    serviceSubtype: 'Hypertension (PhilPEN)',
    fpClientType: '',
    bpDangerSign: false,
    isPregnant: false,
    temperature: '37.0', bloodPressure: '150/95', pulseRate: '88', respiratoryRate: '18',
    weight: '85', height: '165', bmi: '31.2 (Obese)', bmiCategory: 'Obese',
    waist: '98', fbs: '114',
    chiefComplaint: 'Severe headache and dizziness since morning.',
    medicalHistory: 'Diagnosed with Hypertension Stage 1. Allergic to Ibuprofen.',
    actionTaken: 'Given Medication / First Aid',
    referralRoute: 'None',
    outcome: 'Under Monitoring',
    latitude: '8.956100', longitude: '125.598200',
    validationStatus: 'Pending Review',
    validatorRemarks: '',
    labFlagged: false,
    source: 'BHS Submission',
  },
  {
    visitId: 'REC-2026-003',
    patientId: 'BHW-BA3-2026-0003',
    patientSnapshot: {
      name: 'Ana Reyes', dob: '2007-02-10', age: '19', sex: 'Female',
      address: 'Purok 1, Barangay Baan 3, Butuan City',
      membershipStatus: 'PhilHealth Dependent', contactNumber: '0919-987-6543', phicNo: '14-555666777-8',
    },
    barangay: 'Baan 3',
    visitDate: '2026-11-18',
    timestamp: '11/18/2026, 2:45:10 PM',
    natureOfVisit: 'Follow-up Visit',
    fhsisSection: 'Section B: Maternal Care',
    serviceSubtype: 'Prenatal Care (ANC Visit)',
    fpClientType: '',
    bpDangerSign: false,
    isPregnant: true,
    temperature: '36.8', bloodPressure: '110/80', pulseRate: '80', respiratoryRate: '16',
    weight: '62', height: '160', bmi: '24.2 (Normal)', bmiCategory: 'Normal',
    waist: '', fbs: '92',
    chiefComplaint: 'Prenatal check-up with mild cough lasting 2 weeks.',
    medicalHistory: 'None. First pregnancy (G1P0).',
    actionTaken: 'Routine Monitoring / Advised',
    referralRoute: 'None',
    outcome: 'Under Monitoring',
    latitude: '8.954200', longitude: '125.596100',
    validationStatus: 'Validated',
    validatorRemarks: 'Scheduled for follow-up ultrasound next month; prenatal vitamins prescribed.',
    labFlagged: true,
    source: 'BHS Submission',
  },
];

const INITIAL_BIRTHING_RECORDS = [
  {
    id: 'BR-2026-001',
    facilityName: 'Doongan Birthing Facility',
    patientName: 'Marisol Bautista',
    address: 'Purok 3, Barangay Ampayon, Butuan City',
    dateOfDelivery: '2026-11-12',
    age: '26',
    category: 'P-PHIC',
    obScore: 'G2P2 (2002)',
    prenatalVisits: '8',
    daysStayed: '2',
    nbsStatus: 'Performed',
    outcome: 'Alive Baby Girl',
    ppfpMethod: 'PPIUD',
    ppfpPerformedBy: 'Midwife L. Cruz',
    handledBy: 'Midwife L. Cruz',
    assistedBy: 'RN J. Mendoza',
    hasBirthPlan: true,
    pncCompleted: true,
    remarks: 'Discharged — Normal Spontaneous Delivery',
  },
  {
    id: 'BR-2026-002',
    facilityName: 'Doongan Birthing Facility',
    patientName: 'Katrina Villanueva',
    address: 'Purok 1, Barangay Baan 3, Butuan City',
    dateOfDelivery: '2026-11-19',
    age: '18',
    category: 'NP-Non-PHIC',
    obScore: 'G1P1 (1001)',
    prenatalVisits: '5',
    daysStayed: '2',
    nbsStatus: 'Performed',
    outcome: 'Alive Baby Boy',
    ppfpMethod: 'Progestin-Only Implant',
    ppfpPerformedBy: 'Midwife R. Dizon',
    handledBy: 'Midwife R. Dizon',
    assistedBy: 'RN M. Salazar',
    hasBirthPlan: true,
    pncCompleted: true,
    remarks: 'Discharged — Adolescent Mother; scheduled for 4PNC',
  },
];

const INITIAL_LAB_REQUESTS = [
  {
    labId: 'LAB-2026-001',
    linkedVisitId: 'REC-2026-003',
    requestingFacility: 'RHU East District — Butuan City',
    dateOfRequest: '2026-11-19',
    facilityContact: '(085) 816-3731',
    requestingPhysician: 'Dr. R. Alcantara',
    patientName: 'Ana Reyes',
    age: '19',
    sex: 'Female',
    provinceCity: 'Butuan City, Agusan del Norte',
    contactNo: '0919-987-6543',
    reasonForExam: 'Diagnosis',
    treatmentHistory: 'New',
    tbCaseNo: '',
    monthOfTreatment: '',
    testRequested: 'Xpert MTB/RIF',
    paragonimiasisConsidered: 'No',
    specimenType: 'Sputum',
    repeatCollection: 'No',
    repeatReason: '',
    specimen1Collected: '2026-11-19',
    specimen1Dispatched: '2026-11-19',
    specimen2Collected: '',
    specimen2Dispatched: '',
    requestRemarks: '2-week productive cough during prenatal check-up; baseline screening.',
    preparedBy: 'RHU Nurse on Duty',
    // MedTech Results Section
    status: 'Result Released',
    labName: 'Butuan City Health Diagnostic Laboratory',
    specimenReceivedBy: 'RMT C. Navarro',
    dateTimeReceived: '2026-11-19 10:30 AM',
    specimenQuality: 'Accepted',
    rejectionReason: '',
    labSerialNo: 'CHD-LAB-26-0412',
    dateExamined: '2026-11-19',
    xpertResult: 'MTB Not Detected',
    smearReading1: 'N/A',
    smearReading2: 'N/A',
    paragonimiasisResult: 'Neg',
    tbLampResult: 'N/A',
    labDiagnosis: 'Negative for Mycobacterium tuberculosis',
    performedBy: 'RMT C. Navarro',
    verifiedBy: 'RMT Chief E. Lim',
    notedBy: 'Dr. M. Santos, Pathologist',
    dateTimeReleased: '2026-11-19 3:45 PM',
  },
];

// --- HELPER UTILITIES ---
const extractBarangay = (address = '') => {
  const lower = address.toLowerCase();
  const match = BARANGAY_LIST.find((b) => lower.includes(b.toLowerCase()));
  if (match) return match;
  const regexMatch = address.match(/Barangay\s+([^,]+)/i);
  return regexMatch ? regexMatch[1].trim() : 'Ampayon';
};

const getWRAAgeGroup = (age) => {
  const a = Number(age);
  if (a >= 10 && a <= 14) return '10-14';
  if (a >= 15 && a <= 19) return '15-19';
  if (a >= 20 && a <= 49) return '20-49';
  return null;
};

const getMaternalAgeBracket = (age) => {
  const a = Number(age);
  if (a >= 10 && a <= 14) return '10-14';
  if (a >= 15 && a <= 19) return '15-19';
  return '20+';
};

const getConsultationAgeGroup = (age) => {
  const a = Number(age);
  if (a <= 4) return '0-4';
  if (a <= 9) return '5-9';
  if (a <= 19) return '10-19';
  if (a <= 59) return '20-59';
  return '60+';
};

const triggerCsvDownload = (rows, filename) => {
  const csvContent = rows
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function RHUNurseDashboard() {
  const [activeMenu, setActiveMenu] = useState('validation'); // 'validation' | 'maternal' | 'laboratory' | 'reports'
  const [statusToast, setStatusToast] = useState('');

  // --- LIVE SYNCHRONIZED RECORDS (BHW localStorage + RHU Baseline) ---
  const [records, setRecords] = useState([]);
  const [bhwLiveCount, setBhwLiveCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date().toLocaleTimeString());

  // --- MODULE 1: VALIDATION FILTERS & MODAL STATE ---
  const [filterSection, setFilterSection] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [validationSearch, setValidationSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalRemarks, setModalRemarks] = useState('');
  const [modalLabFlag, setModalLabFlag] = useState(false);

  // --- MODULE 2: MATERNAL & BIRTHING STATE ---
  const [maternalSubTab, setMaternalSubTab] = useState('birthing'); // 'birthing' | 'accomplishment'
  const [birthingRecords, setBirthingRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIRTHING);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_BIRTHING_RECORDS;
  });
  const [showBirthingModal, setShowBirthingModal] = useState(false);
  const [birthingFacilityHeader, setBirthingFacilityHeader] = useState('Doongan / RHU Birthing Facility');
  const [maternalQuarter, setMaternalQuarter] = useState('Q4');
  const [maternalYear, setMaternalYear] = useState('2026');
  const emptyBirthingForm = {
    patientName: '', address: 'Barangay Ampayon, Butuan City',
    dateOfDelivery: new Date().toISOString().split('T')[0],
    age: '', category: 'P-PHIC', obScore: 'G1P1 (1001)',
    prenatalVisits: '8', daysStayed: '2', nbsStatus: 'Performed',
    outcome: 'Alive Baby Boy', ppfpMethod: 'PPIUD',
    ppfpPerformedBy: 'Midwife on Duty', handledBy: 'Midwife on Duty',
    assistedBy: 'RHU Nurse', hasBirthPlan: true, pncCompleted: false,
    remarks: 'Discharged — Normal Spontaneous Delivery',
  };
  const [birthingForm, setBirthingForm] = useState(emptyBirthingForm);

  // --- MODULE 3: LABORATORY REFERRALS (FORM 2A) STATE ---
  const [labRequests, setLabRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAB_REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_LAB_REQUESTS;
  });
  const [showNewLabModal, setShowNewLabModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labResultDraft, setLabResultDraft] = useState(null);
  const emptyLabForm = {
    linkedVisitId: '',
    requestingFacility: 'RHU East District — Butuan City',
    dateOfRequest: new Date().toISOString().split('T')[0],
    facilityContact: '(085) 816-3731',
    requestingPhysician: 'Dr. R. Alcantara',
    patientName: '', age: '', sex: 'Female',
    provinceCity: 'Butuan City, Agusan del Norte',
    contactNo: '',
    reasonForExam: 'Diagnosis',
    treatmentHistory: 'New',
    tbCaseNo: '',
    monthOfTreatment: '',
    testRequested: 'Xpert MTB/RIF',
    paragonimiasisConsidered: 'No',
    specimenType: 'Sputum',
    repeatCollection: 'No',
    repeatReason: '',
    specimen1Collected: new Date().toISOString().split('T')[0],
    specimen1Dispatched: new Date().toISOString().split('T')[0],
    specimen2Collected: '',
    specimen2Dispatched: '',
    requestRemarks: '',
    preparedBy: 'RHU Nurse on Duty',
  };
  const [newLabForm, setNewLabForm] = useState(emptyLabForm);

  // --- MODULE 4: FHSIS ANALYTICS EXPORT STATE ---
  const now = new Date();
  const [reportScope, setReportScope] = useState('All Catchment Barangays');
  const [reportPeriodType, setReportPeriodType] = useState('Monthly');
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportQuarter, setReportQuarter] = useState(`Q${Math.floor(now.getMonth() / 3) + 1}`);
  const [reportYear, setReportYear] = useState(String(now.getFullYear()));
  const [validatedOnly, setValidatedOnly] = useState(true);
  const [rhuPreparedBy, setRhuPreparedBy] = useState('Public Health Nurse, RHU');
  const [rhuNotedBy, setRhuNotedBy] = useState('Municipal / City Health Officer');

  // --- PERSIST RHU-OWNED TABLES ---
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BIRTHING, JSON.stringify(birthingRecords));
    } catch (_) {}
  }, [birthingRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAB_REQUESTS, JSON.stringify(labRequests));
    } catch (_) {}
  }, [labRequests]);

  // --- LOAD & ALIGN LIVE BHW SUBMISSIONS FROM LOCALSTORAGE ---
  const loadAlignedRecords = useCallback(() => {
    // Load patient directory maps so we can enrich BHW visits with contact/PHIC/program details
    const patientDirectory = new Map();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('idg4health_patients_')) {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(list)) {
            list.forEach((p) => patientDirectory.set(p.patientId, p));
          }
        }
      }
    } catch (_) {}

    // Load live BHW visits across all barangay keys
    const liveBhwVisits = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('idg4health_visits_')) {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(list)) {
            list.forEach((v) => {
              const pInfo = patientDirectory.get(v.patientId) || {};
              const address = v.patientSnapshot?.address || pInfo.address || 'Barangay Ampayon, Butuan City';
              liveBhwVisits.push({
                ...v,
                storageKey: key,
                barangay: v.barangay || extractBarangay(address),
                patientSnapshot: {
                  ...pInfo,
                  ...v.patientSnapshot,
                  address,
                  membershipStatus: v.patientSnapshot?.membershipStatus || pInfo.membershipStatus || 'PhilHealth Member',
                  contactNumber: v.patientSnapshot?.contactNumber || pInfo.contactNumber || 'N/A',
                  phicNo: v.patientSnapshot?.phicNo || pInfo.phicNo || '',
                  dob: v.patientSnapshot?.dob || pInfo.dob || 'N/A',
                },
                medicalHistory: v.medicalHistory || pInfo.medicalHistory || '',
                validationStatus: v.validationStatus || 'Pending Review',
                validatorRemarks: v.validatorRemarks || '',
                labFlagged: Boolean(v.labFlagged),
                source: 'Live BHW Portal',
              });
            });
          }
        }
      }
    } catch (_) {}

    // Load or initialize RHU baseline records
    let baseline = INITIAL_RHU_BASELINE;
    try {
      const savedBase = localStorage.getItem(STORAGE_KEYS.RHU_BASELINE);
      if (savedBase) baseline = JSON.parse(savedBase);
      else localStorage.setItem(STORAGE_KEYS.RHU_BASELINE, JSON.stringify(INITIAL_RHU_BASELINE));
    } catch (_) {}

    // Merge without duplicates (live BHW wins if visitId collides)
    const map = new Map();
    baseline.forEach((r) => map.set(r.visitId, { ...r, storageKey: STORAGE_KEYS.RHU_BASELINE }));
    liveBhwVisits.forEach((r) => map.set(r.visitId, r));

    const merged = Array.from(map.values()).sort((a, b) =>
      (b.visitDate || '') > (a.visitDate || '') ? 1 : -1
    );

    setRecords(merged);
    setBhwLiveCount(liveBhwVisits.length);
    setLastSyncedAt(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    loadAlignedRecords();
    const handleStorage = () => loadAlignedRecords();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadAlignedRecords]);

  // --- PERSIST VALIDATION DECISION BACK TO LOCALSTORAGE (Syncs with BHW & CHO) ---
  const persistRecordUpdate = (targetRecord, updates) => {
    const storageKey = targetRecord.storageKey || STORAGE_KEYS.RHU_BASELINE;
    try {
      const currentList = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedList = currentList.map((item) =>
        item.visitId === targetRecord.visitId ? { ...item, ...updates } : item
      );
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
    } catch (_) {}

    setRecords((prev) =>
      prev.map((rec) =>
        rec.visitId === targetRecord.visitId ? { ...rec, ...updates } : rec
      )
    );
  };

  const openReviewModal = (record) => {
    setSelectedRecord(record);
    setModalRemarks(record.validatorRemarks || '');
    setModalLabFlag(Boolean(record.labFlagged));
  };

  const handleValidationAction = (newStatus) => {
    if (!selectedRecord) return;
    if (newStatus === 'Returned to BHW' && !modalRemarks.trim()) {
      alert('Please enter remarks explaining why this record is being returned to the BHW.');
      return;
    }

    const updates = {
      validationStatus: newStatus,
      validatorRemarks:
        modalRemarks.trim() ||
        (newStatus === 'Validated' ? 'Validated by RHU Nurse for FHSIS submission.' : ''),
      labFlagged: modalLabFlag,
      validatedAt: new Date().toLocaleString(),
      syncStatus: newStatus === 'Validated' ? 'Validated' : newStatus,
    };

    persistRecordUpdate(selectedRecord, updates);

    // Auto-create Form 2A Lab Request if flagged and not already in labRequests
    if (modalLabFlag && newStatus === 'Validated') {
      const alreadyExists = labRequests.some((l) => l.linkedVisitId === selectedRecord.visitId);
      if (!alreadyExists) {
        const autoLab = {
          ...emptyLabForm,
          labId: `LAB-${Date.now().toString().slice(-6)}`,
          linkedVisitId: selectedRecord.visitId,
          patientName: selectedRecord.patientSnapshot?.name || 'Unnamed Patient',
          age: String(selectedRecord.patientSnapshot?.age || ''),
          sex: selectedRecord.patientSnapshot?.sex || 'Female',
          contactNo: selectedRecord.patientSnapshot?.contactNumber || '',
          requestRemarks: `Flagged during RHU clinical validation (${selectedRecord.serviceSubtype}). ${updates.validatorRemarks}`,
          status: 'Pending Laboratory',
          labName: 'Butuan City Health Diagnostic Laboratory',
          specimenReceivedBy: '',
          dateTimeReceived: '',
          specimenQuality: 'Accepted',
          rejectionReason: '',
          labSerialNo: '',
          dateExamined: '',
          xpertResult: '',
          smearReading1: '',
          smearReading2: '',
          paragonimiasisResult: '',
          tbLampResult: '',
          labDiagnosis: '',
          performedBy: '',
          verifiedBy: '',
          notedBy: '',
          dateTimeReleased: '',
        };
        setLabRequests((prev) => [autoLab, ...prev]);
        setStatusToast(
          `Record ${selectedRecord.visitId} approved to FHSIS and queued in Laboratory Referrals (Form 2A).`
        );
      } else {
        setStatusToast(`Record ${selectedRecord.visitId} updated to "${newStatus}".`);
      }
    } else {
      setStatusToast(`Record ${selectedRecord.visitId} marked as "${newStatus}" and synced.`);
    }

    setSelectedRecord(null);
  };

  // --- BIRTHING FACILITY REPORT HANDLERS ---
  const handleAddBirthingRecord = (e) => {
    e.preventDefault();
    if (!birthingForm.patientName.trim() || !birthingForm.age) {
      alert('Please enter the patient name and age.');
      return;
    }
    const created = {
      ...birthingForm,
      id: `BR-${Date.now().toString().slice(-6)}`,
      facilityName: birthingFacilityHeader,
    };
    setBirthingRecords((prev) => [created, ...prev]);
    setBirthingForm(emptyBirthingForm);
    setShowBirthingModal(false);
    setStatusToast(`Delivery record for ${created.patientName} added to Birthing Facility Report.`);
  };

  const handleExportBirthingCsv = () => {
    const rows = [
      ['CITY GOVERNMENT OF BUTUAN — BIRTHING FACILITY REPORT (CHD.HND.F.088.REV01)'],
      ['Name of Birthing Facility', birthingFacilityHeader, 'Export Date', new Date().toISOString().split('T')[0]],
      [],
      [
        'Patient Name', 'Address', 'Date of Delivery', 'Age', 'Category (P-PHIC / NP)',
        'OB Score (G/P)', 'Prenatal Visits', 'Days Stayed', 'NBS Status', 'Outcome',
        'PPFP Method Used', 'PPFP Performed By', 'Handled By', 'Assisted By', 'Remarks',
      ],
      ...birthingRecords.map((b) => [
        b.patientName, b.address, b.dateOfDelivery, b.age, b.category,
        b.obScore, b.prenatalVisits, b.daysStayed, b.nbsStatus, b.outcome,
        b.ppfpMethod, b.ppfpPerformedBy, b.handledBy, b.assistedBy, b.remarks,
      ]),
    ];
    triggerCsvDownload(rows, `Butuan_Birthing_Facility_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // --- MATERNAL QUARTERLY ACCOMPLISHMENT SUMMARY (CHD.HND.F.090.REV01) ---
  const maternalAccomplishment = useMemo(() => {
    const qObj = QUARTERS.find((q) => q.id === maternalQuarter);
    const inPeriod = (isoDate) => {
      if (!isoDate) return false;
      const [y, m] = isoDate.split('-').map(Number);
      return String(y) === String(maternalYear) && (qObj ? qObj.months.includes(m) : true);
    };

    const makeRow = () => ({ total: 0, '10-14': 0, '15-19': 0, '20+': 0 });
    const inc = (bucket, age) => {
      const grp = getMaternalAgeBracket(age);
      bucket[grp] += 1;
      bucket.total += 1;
    };

    const stats = {
      deliveries: makeRow(),
      pregnantTracked: makeRow(),
      birthPlan: makeRow(),
      anc4Plus: makeRow(),
      fbd: makeRow(),
      shpAssisted: makeRow(),
      pnc2Plus: makeRow(),
      liveBirths: makeRow(),
      maternalDeaths: 0,
      fetalDeaths: 0,
    };

    // Tally from Birthing Facility deliveries
    birthingRecords.filter((b) => inPeriod(b.dateOfDelivery)).forEach((b) => {
      inc(stats.deliveries, b.age);
      inc(stats.fbd, b.age);
      inc(stats.shpAssisted, b.age);
      if (b.hasBirthPlan) inc(stats.birthPlan, b.age);
      if (Number(b.prenatalVisits) >= 4) inc(stats.anc4Plus, b.age);
      if (b.pncCompleted) inc(stats.pnc2Plus, b.age);
      if ((b.outcome || '').toLowerCase().includes('alive')) inc(stats.liveBirths, b.age);
      if ((b.outcome || '').toLowerCase().includes('stillbirth')) stats.fetalDeaths += 1;
    });

    // Tally from BHW/RHU Maternal Care visits
    records
      .filter((r) => inPeriod(r.visitDate) && (r.fhsisSection === 'Section B: Maternal Care' || r.isPregnant))
      .forEach((r) => {
        const age = r.patientSnapshot?.age || 25;
        inc(stats.pregnantTracked, age);
        if (r.serviceSubtype === 'Completed 8ANC & Tracked') inc(stats.anc4Plus, age);
        if (r.serviceSubtype === 'Postpartum Care (PNC Visit)') inc(stats.pnc2Plus, age);
      });

    return stats;
  }, [birthingRecords, records, maternalQuarter, maternalYear]);

  // --- LABORATORY FORM 2A HANDLERS ---
  const handleCreateLabRequest = (e) => {
    e.preventDefault();
    if (!newLabForm.patientName.trim()) {
      alert('Please enter the patient’s full name.');
      return;
    }
    const created = {
      ...newLabForm,
      labId: `LAB-${Date.now().toString().slice(-6)}`,
      status: 'Pending Laboratory',
      labName: 'Butuan City Health Diagnostic Laboratory',
      specimenReceivedBy: '',
      dateTimeReceived: '',
      specimenQuality: 'Accepted',
      rejectionReason: '',
      labSerialNo: `CHD-LAB-26-${Math.floor(1000 + Math.random() * 9000)}`,
      dateExamined: new Date().toISOString().split('T')[0],
      xpertResult: '',
      smearReading1: '',
      smearReading2: '',
      paragonimiasisResult: 'Neg',
      tbLampResult: '',
      labDiagnosis: '',
      performedBy: '',
      verifiedBy: '',
      notedBy: '',
      dateTimeReleased: '',
    };
    setLabRequests((prev) => [created, ...prev]);
    setNewLabForm(emptyLabForm);
    setShowNewLabModal(false);
    setStatusToast(`Form 2A Laboratory Request (${created.labId}) created for ${created.patientName}.`);
  };

  const handleSaveLabResults = (e) => {
    e.preventDefault();
    if (!labResultDraft) return;
    const finalized = {
      ...labResultDraft,
      status: labResultDraft.specimenQuality === 'Rejected' ? 'Specimen Rejected' : 'Result Released',
      dateTimeReleased: labResultDraft.dateTimeReleased || new Date().toLocaleString(),
    };
    setLabRequests((prev) => prev.map((l) => (l.labId === finalized.labId ? finalized : l)));
    setSelectedLab(finalized);
    setLabResultDraft(null);
    setStatusToast(`Laboratory results for ${finalized.patientName} (${finalized.labId}) saved.`);
  };

  // --- FILTERED VALIDATION LIST ---
  const filteredValidationRecords = useMemo(() => {
    const q = validationSearch.toLowerCase();
    return records.filter((rec) => {
      const matchSec = filterSection === 'All' || rec.fhsisSection === filterSection;
      const matchStat = filterStatus === 'All' || rec.validationStatus === filterStatus;
      const matchQuery =
        !q ||
        (rec.visitId || '').toLowerCase().includes(q) ||
        (rec.patientId || '').toLowerCase().includes(q) ||
        (rec.patientSnapshot?.name || '').toLowerCase().includes(q) ||
        (rec.barangay || '').toLowerCase().includes(q) ||
        (rec.serviceSubtype || '').toLowerCase().includes(q);
      return matchSec && matchStat && matchQuery;
    });
  }, [records, filterSection, filterStatus, validationSearch]);

  const validationCounts = useMemo(() => ({
    pending: records.filter((r) => r.validationStatus === 'Pending Review').length,
    validated: records.filter((r) => r.validationStatus === 'Validated').length,
    returned: records.filter((r) => r.validationStatus === 'Returned to BHW').length,
    labFlagged: labRequests.filter((l) => l.status === 'Pending Laboratory').length,
  }), [records, labRequests]);

  // --- ALIGNED FHSIS M1 / QUARTERLY AGGREGATION ---
  const filteredReportRecords = useMemo(() => {
    return records.filter((r) => {
      if (validatedOnly && r.validationStatus !== 'Validated') return false;
      if (reportScope !== 'All Catchment Barangays' && r.barangay !== reportScope) return false;
      if (!r.visitDate) return false;
      const [y, m] = r.visitDate.split('-').map(Number);
      if (String(y) !== String(reportYear)) return false;
      if (reportPeriodType === 'Monthly') return m === Number(reportMonth);
      const qObj = QUARTERS.find((q) => q.id === reportQuarter);
      return qObj ? qObj.months.includes(m) : false;
    });
  }, [records, validatedOnly, reportScope, reportPeriodType, reportMonth, reportQuarter, reportYear]);

  const fhsisSummary = useMemo(() => {
    const makeWRA = () => ({ '10-14': 0, '15-19': 0, '20-49': 0, total: 0 });
    const makeSex = () => ({ M: 0, F: 0, total: 0 });
    const makeAgeSex = () => ({
      '0-4': { M: 0, F: 0 }, '5-9': { M: 0, F: 0 }, '10-19': { M: 0, F: 0 },
      '20-59': { M: 0, F: 0 }, '60+': { M: 0, F: 0 },
      totalM: 0, totalF: 0, total: 0,
    });

    const incWRA = (b, age) => {
      const grp = getWRAAgeGroup(age);
      if (grp) b[grp] += 1;
      b.total += 1;
    };
    const incSex = (b, sex) => {
      if (sex === 'Male') b.M += 1;
      else b.F += 1;
      b.total += 1;
    };
    const incAgeSex = (b, age, sex) => {
      const grp = getConsultationAgeGroup(age);
      const key = sex === 'Male' ? 'M' : 'F';
      b[grp][key] += 1;
      if (key === 'M') b.totalM += 1;
      else b.totalF += 1;
      b.total += 1;
    };

    const data = {
      secA: { newAcceptors: makeWRA(), currentUsers: makeWRA(), dropOuts: makeWRA() },
      secB: { ancVisits: makeWRA(), completed8ANC: makeWRA(), bpMeasured: makeWRA(), highBpDanger: makeWRA(), fbdDeliveries: makeWRA(), pncVisits: makeWRA() },
      secC: { bcgHepB: makeSex(), pentaOpvPcv: makeSex(), mmrFic: makeSex(), vitA: makeSex(), acuteDiarrhea: makeSex(), pneumonia: makeSex() },
      secD: { firstVisit: makeSex(), twoVisits: makeSex() },
      secE: { riskAssessedAdult: makeSex(), riskAssessedSenior: makeSex(), overweightObese: makeSex(), hypertensiveAdult: makeSex(), hypertensiveSenior: makeSex(), diabeticAdult: makeSex(), diabeticSenior: makeSex(), otherNcdScreenings: makeSex() },
      secG: { dengue: makeSex(), ari: makeSex(), rabiesBites: makeSex(), schisto: makeSex(), sthDeworming: makeSex(), tbLeprosyHiv: makeSex() },
      lguConsults: { newConsultation: makeAgeSex(), followUp: makeAgeSex(), teleconsultation: makeAgeSex(), bhsToRhuReferral: makeAgeSex() },
    };

    filteredReportRecords.forEach((v) => {
      const age = Number(v.patientSnapshot?.age || 0);
      const sex = v.patientSnapshot?.sex || 'Female';

      if (v.natureOfVisit === 'New Consultation') incAgeSex(data.lguConsults.newConsultation, age, sex);
      else if (v.natureOfVisit === 'Follow-up Visit') incAgeSex(data.lguConsults.followUp, age, sex);
      else if (v.natureOfVisit === 'Teleconsultation') incAgeSex(data.lguConsults.teleconsultation, age, sex);
      if (v.referralRoute === 'BHS to RHU' || v.actionTaken === 'Referred to RHU / Hospital') {
        incAgeSex(data.lguConsults.bhsToRhuReferral, age, sex);
      }

      if (v.fhsisSection === 'Section A: Family Planning') {
        if (v.fpClientType === 'New Acceptor') incWRA(data.secA.newAcceptors, age);
        else if (v.fpClientType === 'Drop-out') incWRA(data.secA.dropOuts, age);
        else incWRA(data.secA.currentUsers, age);
      }

      if (v.fhsisSection === 'Section B: Maternal Care' || v.isPregnant) {
        if (v.serviceSubtype === 'Prenatal Care (ANC Visit)') incWRA(data.secB.ancVisits, age);
        if (v.serviceSubtype === 'Completed 8ANC & Tracked') incWRA(data.secB.completed8ANC, age);
        if (v.serviceSubtype === 'Facility-Based Delivery (FBD)') incWRA(data.secB.fbdDeliveries, age);
        if (v.serviceSubtype === 'Postpartum Care (PNC Visit)') incWRA(data.secB.pncVisits, age);
        if (v.bloodPressure) incWRA(data.secB.bpMeasured, age);
        const sys = parseInt((v.bloodPressure || '').split('/')[0], 10);
        const dia = parseInt((v.bloodPressure || '').split('/')[1], 10);
        if (v.bpDangerSign || sys >= 140 || dia >= 90) incWRA(data.secB.highBpDanger, age);
      }

      if (v.fhsisSection === 'Section C: Child Care & Immunization') {
        if (v.serviceSubtype === 'Immunization (BCG / HepB)') incSex(data.secC.bcgHepB, sex);
        if (v.serviceSubtype === 'Immunization (DPT-HiB-HepB / OPV / PCV)') incSex(data.secC.pentaOpvPcv, sex);
        if (v.serviceSubtype === 'Immunization (MMR / FIC)') incSex(data.secC.mmrFic, sex);
        if (v.serviceSubtype === 'Vitamin A Supplementation') incSex(data.secC.vitA, sex);
        if (v.serviceSubtype === 'Sick Child: Acute Diarrhea (ORS/Zinc)') incSex(data.secC.acuteDiarrhea, sex);
        if (v.serviceSubtype === 'Sick Child: Pneumonia') incSex(data.secC.pneumonia, sex);
      }

      if (v.fhsisSection === 'Section D: Oral Health') {
        if (v.serviceSubtype === 'Oral Health: 1st Visit') incSex(data.secD.firstVisit, sex);
        if (v.serviceSubtype === 'Oral Health: Completed 2 Visits') incSex(data.secD.twoVisits, sex);
      }

      if (v.fhsisSection === 'Section E: Non-Communicable Diseases (PhilPEN)') {
        if (age >= 60) incSex(data.secE.riskAssessedSenior, sex);
        else if (age >= 20) incSex(data.secE.riskAssessedAdult, sex);
        if (v.bmiCategory === 'Overweight' || v.bmiCategory === 'Obese') incSex(data.secE.overweightObese, sex);
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
  }, [filteredReportRecords]);

  const reportPeriodLabel =
    reportPeriodType === 'Monthly'
      ? `${MONTHS[reportMonth - 1]} ${reportYear}`
      : `${QUARTERS.find((q) => q.id === reportQuarter)?.label} ${reportYear}`;

  const handleExportRhuFhsisCsv = () => {
    const rows = [
      [`RHU / LOCAL HEALTH UNIT — FHSIS ${reportPeriodType.toUpperCase()} EXPORT`],
      ['Catchment Scope', reportScope, 'Filter Mode', validatedOnly ? 'Validated Only' : 'All Submissions'],
      ['Period', reportPeriodLabel, 'Records Included', filteredReportRecords.length],
      [],
      ['SECTION A. FAMILY PLANNING (WRA)', '10-14', '15-19', '20-49', 'TOTAL'],
      ['New Acceptors', fhsisSummary.secA.newAcceptors['10-14'], fhsisSummary.secA.newAcceptors['15-19'], fhsisSummary.secA.newAcceptors['20-49'], fhsisSummary.secA.newAcceptors.total],
      ['Current Users', fhsisSummary.secA.currentUsers['10-14'], fhsisSummary.secA.currentUsers['15-19'], fhsisSummary.secA.currentUsers['20-49'], fhsisSummary.secA.currentUsers.total],
      ['Drop-outs', fhsisSummary.secA.dropOuts['10-14'], fhsisSummary.secA.dropOuts['15-19'], fhsisSummary.secA.dropOuts['20-49'], fhsisSummary.secA.dropOuts.total],
      [],
      ['SECTION B. MATERNAL CARE', '10-14', '15-19', '20-49', 'TOTAL'],
      ['Prenatal Care (ANC)', fhsisSummary.secB.ancVisits['10-14'], fhsisSummary.secB.ancVisits['15-19'], fhsisSummary.secB.ancVisits['20-49'], fhsisSummary.secB.ancVisits.total],
      ['Completed 8ANC', fhsisSummary.secB.completed8ANC['10-14'], fhsisSummary.secB.completed8ANC['15-19'], fhsisSummary.secB.completed8ANC['20-49'], fhsisSummary.secB.completed8ANC.total],
      ['BP Measured', fhsisSummary.secB.bpMeasured['10-14'], fhsisSummary.secB.bpMeasured['15-19'], fhsisSummary.secB.bpMeasured['20-49'], fhsisSummary.secB.bpMeasured.total],
      ['High BP / Danger Signs', fhsisSummary.secB.highBpDanger['10-14'], fhsisSummary.secB.highBpDanger['15-19'], fhsisSummary.secB.highBpDanger['20-49'], fhsisSummary.secB.highBpDanger.total],
      ['Postpartum Care (4PNC)', fhsisSummary.secB.pncVisits['10-14'], fhsisSummary.secB.pncVisits['15-19'], fhsisSummary.secB.pncVisits['20-49'], fhsisSummary.secB.pncVisits.total],
      [],
      ['SECTION C. CHILD CARE & IMMUNIZATION', 'Male', 'Female', 'TOTAL'],
      ['BCG / HepB', fhsisSummary.secC.bcgHepB.M, fhsisSummary.secC.bcgHepB.F, fhsisSummary.secC.bcgHepB.total],
      ['DPT-HiB-HepB / OPV / PCV', fhsisSummary.secC.pentaOpvPcv.M, fhsisSummary.secC.pentaOpvPcv.F, fhsisSummary.secC.pentaOpvPcv.total],
      ['MMR / FIC', fhsisSummary.secC.mmrFic.M, fhsisSummary.secC.mmrFic.F, fhsisSummary.secC.mmrFic.total],
      ['Vitamin A Supplementation', fhsisSummary.secC.vitA.M, fhsisSummary.secC.vitA.F, fhsisSummary.secC.vitA.total],
      [],
      ['SECTION E. NON-COMMUNICABLE DISEASES (PhilPEN)', 'Male', 'Female', 'TOTAL'],
      ['Adults (20-59) Risk Assessed', fhsisSummary.secE.riskAssessedAdult.M, fhsisSummary.secE.riskAssessedAdult.F, fhsisSummary.secE.riskAssessedAdult.total],
      ['Seniors (60+) Risk Assessed', fhsisSummary.secE.riskAssessedSenior.M, fhsisSummary.secE.riskAssessedSenior.F, fhsisSummary.secE.riskAssessedSenior.total],
      ['Hypertensives (20-59)', fhsisSummary.secE.hypertensiveAdult.M, fhsisSummary.secE.hypertensiveAdult.F, fhsisSummary.secE.hypertensiveAdult.total],
      ['Hypertensives (60+)', fhsisSummary.secE.hypertensiveSenior.M, fhsisSummary.secE.hypertensiveSenior.F, fhsisSummary.secE.hypertensiveSenior.total],
      ['Type II Diabetes (20-59)', fhsisSummary.secE.diabeticAdult.M, fhsisSummary.secE.diabeticAdult.F, fhsisSummary.secE.diabeticAdult.total],
      ['Type II Diabetes (60+)', fhsisSummary.secE.diabeticSenior.M, fhsisSummary.secE.diabeticSenior.F, fhsisSummary.secE.diabeticSenior.total],
      [],
      ['SECTION G. INFECTIOUS DISEASES', 'Male', 'Female', 'TOTAL'],
      ['Dengue Clinical Case', fhsisSummary.secG.dengue.M, fhsisSummary.secG.dengue.F, fhsisSummary.secG.dengue.total],
      ['Acute Respiratory Infection', fhsisSummary.secG.ari.M, fhsisSummary.secG.ari.F, fhsisSummary.secG.ari.total],
      ['Animal Bites / Rabies', fhsisSummary.secG.rabiesBites.M, fhsisSummary.secG.rabiesBites.F, fhsisSummary.secG.rabiesBites.total],
      ['Schistosomiasis', fhsisSummary.secG.schisto.M, fhsisSummary.secG.schisto.F, fhsisSummary.secG.schisto.total],
      ['STH / Deworming', fhsisSummary.secG.sthDeworming.M, fhsisSummary.secG.sthDeworming.F, fhsisSummary.secG.sthDeworming.total],
    ];
    triggerCsvDownload(rows, `RHU_FHSIS_${reportPeriodType}_${reportYear}.csv`);
  };

  return (
    <div className="flex min-h-[calc(100vh-57px)] bg-slate-50 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-lg shrink-0 print:hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">IDG4Health</h2>
          <p className="text-xs text-slate-400 mt-1">Local Health Unit (RHU) Portal</p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          <button
            onClick={() => setActiveMenu('validation')}
            className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition ${
              activeMenu === 'validation' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3"><FileCheck className="w-5 h-5" /> Data Validation</span>
            {validationCounts.pending > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                {validationCounts.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMenu('maternal')}
            className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition ${
              activeMenu === 'maternal' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3"><Baby className="w-5 h-5" /> Maternal & Birthing</span>
            <span className="text-[10px] opacity-75">{birthingRecords.length}</span>
          </button>

          <button
            onClick={() => setActiveMenu('laboratory')}
            className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition ${
              activeMenu === 'laboratory' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3"><FlaskConical className="w-5 h-5" /> Lab Referrals (2A)</span>
            {validationCounts.labFlagged > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                {validationCounts.labFlagged}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveMenu('reports')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              activeMenu === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" /> FHSIS Analytics Export
          </button>
        </nav>

        {/* Live BHW Pipeline Sync Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>BHW Live Feeds:</span>
            <span className="font-bold text-emerald-400">{bhwLiveCount} synced</span>
          </div>
          <button
            onClick={loadAlignedRecords}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync BHW Submissions
          </button>
          <p className="text-[10px] text-slate-500 text-center">Last synced: {lastSyncedAt}</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-auto print:p-0">
        {statusToast && (
          <div className="max-w-6xl mx-auto mb-5 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{statusToast}</span>
            </div>
            <button onClick={() => setStatusToast('')} className="text-blue-400 hover:text-blue-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================
            MODULE 1: DATA VALIDATION (BHW -> RHU -> CHO GATEWAY)
           ============================================================ */}
        {activeMenu === 'validation' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Clinical Data Validation Queue</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Review, verify, flag for Form 2A lab testing, or return BHW field submissions before CHO FHSIS consolidation.
                </p>
              </div>
            </header>

            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <p className="text-xs font-semibold text-amber-800 uppercase">Pending Review</p>
                <p className="text-2xl font-bold text-amber-900 mt-1">{validationCounts.pending}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-xs font-semibold text-emerald-800 uppercase">Validated for FHSIS</p>
                <p className="text-2xl font-bold text-emerald-900 mt-1">{validationCounts.validated}</p>
              </div>
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl">
                <p className="text-xs font-semibold text-rose-800 uppercase">Returned to BHW</p>
                <p className="text-2xl font-bold text-rose-900 mt-1">{validationCounts.returned}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                <p className="text-xs font-semibold text-blue-800 uppercase">Pending Lab (2A)</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{validationCounts.labFlagged}</p>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={validationSearch}
                  onChange={(e) => setValidationSearch(e.target.value)}
                  placeholder="Search Patient Name, Unique ID, Barangay, or Disease..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className="text-sm border border-slate-300 bg-slate-50 rounded-lg py-2 px-3 outline-none"
              >
                <option value="All">All FHSIS Sections</option>
                {FHSIS_SECTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-slate-300 bg-slate-50 rounded-lg py-2 px-3 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending Review">Pending Review</option>
                <option value="Validated">Validated</option>
                <option value="Returned to BHW">Returned to BHW</option>
              </select>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Visit / Patient ID</th>
                      <th className="p-4 font-semibold">Origin Barangay</th>
                      <th className="p-4 font-semibold">Patient Profile</th>
                      <th className="p-4 font-semibold">FHSIS Classification</th>
                      <th className="p-4 font-semibold">Visit Date</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredValidationRecords.map((record) => (
                      <tr key={record.visitId} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-mono text-xs font-bold text-blue-600">{record.visitId}</div>
                          <div className="font-mono text-[11px] text-slate-400">{record.patientId}</div>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Brgy. {record.barangay}
                          </span>
                          <span className="text-[10px] text-slate-400">{record.source}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{record.patientSnapshot?.name}</div>
                          <div className="text-xs text-slate-500">
                            {record.patientSnapshot?.age} yrs • {record.patientSnapshot?.sex}
                          </div>
                          <div className="text-[10px] font-semibold text-blue-600 uppercase mt-0.5">
                            {record.patientSnapshot?.membershipStatus}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-xs text-slate-800">{record.serviceSubtype}</div>
                          <div className="text-[11px] text-slate-500">{record.fhsisSection}</div>
                        </td>
                        <td className="p-4 text-xs whitespace-nowrap">{record.visitDate}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              record.validationStatus === 'Validated'
                                ? 'bg-emerald-100 text-emerald-800'
                                : record.validationStatus === 'Returned to BHW'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {record.validationStatus}
                          </span>
                          {record.labFlagged && (
                            <span className="block text-[10px] text-amber-700 font-semibold mt-1">
                              + Lab Flagged (2A)
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => openReviewModal(record)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              record.validationStatus === 'Pending Review'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {record.validationStatus === 'Pending Review' ? 'Review' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredValidationRecords.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">
                          No submissions match your current filters.
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
            MODULE 2: MATERNAL & BIRTHING (CHD.HND.F.088 & F.090)
           ============================================================ */}
        {activeMenu === 'maternal' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Maternal Care & Birthing Facility Registry</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Aligned with Butuan CHD Birthing Facility Report (CHD.HND.F.088.REV01) and Quarterly Maternal Accomplishment (CHD.HND.F.090.REV01).
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMaternalSubTab('birthing')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    maternalSubTab === 'birthing' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  Birthing Facility Report
                </button>
                <button
                  onClick={() => setMaternalSubTab('accomplishment')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    maternalSubTab === 'accomplishment' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                  }`}
                >
                  Quarterly Maternal Report
                </button>
              </div>
            </header>

            {maternalSubTab === 'birthing' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-600">Facility:</label>
                    <input
                      type="text"
                      value={birthingFacilityHeader}
                      onChange={(e) => setBirthingFacilityHeader(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 w-64"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowBirthingModal(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Log Delivery
                    </button>
                    <button
                      onClick={handleExportBirthingCsv}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      <Download className="w-4 h-4 text-emerald-600" /> Export CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      <Printer className="w-4 h-4" /> Print Form
                    </button>
                  </div>
                </div>

                {/* Official Birthing Facility Table */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
                  <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        City Government of Butuan • City Health Department
                      </p>
                      <h2 className="text-base font-extrabold text-slate-900">BIRTHING FACILITY REPORT</h2>
                      <p className="text-xs text-slate-600 mt-0.5">Facility: <strong>{birthingFacilityHeader}</strong></p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">CHD.HND.F.088.REV01</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 text-[11px]">
                          <th className="p-2 border border-slate-200">Patient & Address</th>
                          <th className="p-2 border border-slate-200">Delivery Date / Age</th>
                          <th className="p-2 border border-slate-200">Category / OB Score</th>
                          <th className="p-2 border border-slate-200 text-center">ANC / Days</th>
                          <th className="p-2 border border-slate-200 text-center">NBS</th>
                          <th className="p-2 border border-slate-200">Outcome</th>
                          <th className="p-2 border border-slate-200">PPFP Method & Provider</th>
                          <th className="p-2 border border-slate-200">Handled / Assisted By</th>
                          <th className="p-2 border border-slate-200">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {birthingRecords.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50">
                            <td className="p-2 border border-slate-200">
                              <div className="font-bold text-slate-800">{b.patientName}</div>
                              <div className="text-[10px] text-slate-500">{b.address}</div>
                            </td>
                            <td className="p-2 border border-slate-200 whitespace-nowrap">
                              <div className="font-semibold">{b.dateOfDelivery}</div>
                              <div className="text-[10px] text-slate-500">{b.age} yrs old</div>
                            </td>
                            <td className="p-2 border border-slate-200 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold">
                                {b.category}
                              </span>
                              <div className="text-[10px] text-slate-600 mt-0.5">{b.obScore}</div>
                            </td>
                            <td className="p-2 border border-slate-200 text-center whitespace-nowrap">
                              <div>{b.prenatalVisits} ANC</div>
                              <div className="text-[10px] text-slate-500">{b.daysStayed}d stay</div>
                            </td>
                            <td className="p-2 border border-slate-200 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${b.nbsStatus === 'Performed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                                {b.nbsStatus === 'Performed' ? '✓ Done' : '✗ Not Done'}
                              </span>
                            </td>
                            <td className="p-2 border border-slate-200 font-semibold text-slate-800">{b.outcome}</td>
                            <td className="p-2 border border-slate-200">
                              <div className="font-medium">{b.ppfpMethod}</div>
                              <div className="text-[10px] text-slate-500">By: {b.ppfpPerformedBy}</div>
                            </td>
                            <td className="p-2 border border-slate-200 text-[11px]">
                              <div>H: {b.handledBy}</div>
                              <div className="text-slate-500">A: {b.assistedBy}</div>
                            </td>
                            <td className="p-2 border border-slate-200 text-[11px]">{b.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {maternalSubTab === 'accomplishment' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
                  <div className="flex items-center gap-3">
                    <select
                      value={maternalQuarter}
                      onChange={(e) => setMaternalQuarter(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                    >
                      {QUARTERS.map((q) => (
                        <option key={q.id} value={q.id}>{q.label}</option>
                      ))}
                    </select>
                    <select
                      value={maternalYear}
                      onChange={(e) => setMaternalYear(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg p-2 bg-slate-50"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                    </select>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Printer className="w-4 h-4" /> Print Maternal Accomplishment
                  </button>
                </div>

                {/* Official CHD.HND.F.090.REV01 Table */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
                  <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                        City Government of Butuan • City Health Department
                      </p>
                      <h2 className="text-base font-extrabold text-slate-900">
                        MATERNAL HEALTH CARE PROGRAM ACCOMPLISHMENT — {maternalQuarter} {maternalYear}
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">CHD.HND.F.090.REV01</span>
                  </div>

                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-2.5 border border-slate-200 text-left">Indicators</th>
                        <th className="p-2.5 border border-slate-200 text-center w-20">10–14 yrs</th>
                        <th className="p-2.5 border border-slate-200 text-center w-20">15–19 yrs</th>
                        <th className="p-2.5 border border-slate-200 text-center w-20">20+ yrs</th>
                        <th className="p-2.5 border border-slate-200 text-center w-24 bg-slate-200">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Total Deliveries', maternalAccomplishment.deliveries],
                        ['1. Pregnant Mothers Tracked (BHW + RHU)', maternalAccomplishment.pregnantTracked],
                        ['2. Women with Birth Plan', maternalAccomplishment.birthPlan],
                        ['3. Women with ≥4 ANC Visits', maternalAccomplishment.anc4Plus],
                        ['4. Facility-Based Deliveries (FBD)', maternalAccomplishment.fbd],
                        ['5. Assisted by Skilled Health Professional (SHP)', maternalAccomplishment.shpAssisted],
                        ['6. Women with ≥2 PNC Visits', maternalAccomplishment.pnc2Plus],
                        ['Total Live Births', maternalAccomplishment.liveBirths],
                      ].map(([label, row]) => (
                        <tr key={label}>
                          <td className="p-2.5 border border-slate-200 font-medium text-slate-800">{label}</td>
                          <td className="p-2.5 border border-slate-200 text-center">{row['10-14']}</td>
                          <td className="p-2.5 border border-slate-200 text-center">{row['15-19']}</td>
                          <td className="p-2.5 border border-slate-200 text-center">{row['20+']}</td>
                          <td className="p-2.5 border border-slate-200 text-center font-bold bg-slate-50">{row.total}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="p-2.5 border border-slate-200 font-medium text-slate-800">7. # Maternal Deaths (MMR)</td>
                        <td colSpan="3" className="p-2.5 border border-slate-200 text-center text-slate-400">—</td>
                        <td className="p-2.5 border border-slate-200 text-center font-bold bg-slate-50">{maternalAccomplishment.maternalDeaths}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 border border-slate-200 font-medium text-slate-800">8. # Fetal Deaths</td>
                        <td colSpan="3" className="p-2.5 border border-slate-200 text-center text-slate-400">—</td>
                        <td className="p-2.5 border border-slate-200 text-center font-bold bg-slate-50">{maternalAccomplishment.fetalDeaths}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            MODULE 3: LABORATORY REFERRALS (FORM 2A — CHD.HND.F.054.REV03)
           ============================================================ */}
        {activeMenu === 'laboratory' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 print:hidden">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Laboratory Referrals & Diagnostic Results</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Aligned with Form 2A Laboratory Request and Result Form (CHD.HND.F.054.REV03) for TB/Microscopy/Xpert referrals.
                </p>
              </div>
              <button
                onClick={() => setShowNewLabModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> New Form 2A Lab Request
              </button>
            </header>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Lab / Visit ID</th>
                      <th className="p-4 font-semibold">Patient Profile</th>
                      <th className="p-4 font-semibold">Test Requested / Specimen</th>
                      <th className="p-4 font-semibold">Request Date</th>
                      <th className="p-4 font-semibold">Status & Result</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {labRequests.map((lab) => (
                      <tr key={lab.labId} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-mono text-xs font-bold text-blue-600">{lab.labId}</div>
                          {lab.linkedVisitId && (
                            <div className="font-mono text-[10px] text-slate-400">Ref: {lab.linkedVisitId}</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{lab.patientName}</div>
                          <div className="text-xs text-slate-500">{lab.age} yrs • {lab.sex} • {lab.contactNo || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-xs text-slate-800">{lab.testRequested}</div>
                          <div className="text-[11px] text-slate-500">
                            {lab.specimenType} • {lab.reasonForExam} ({lab.treatmentHistory})
                          </div>
                        </td>
                        <td className="p-4 text-xs">{lab.dateOfRequest}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              lab.status === 'Result Released'
                                ? 'bg-emerald-100 text-emerald-800'
                                : lab.status === 'Specimen Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {lab.status}
                          </span>
                          {lab.labDiagnosis && (
                            <div className="text-[11px] text-slate-600 mt-1 font-medium">{lab.labDiagnosis}</div>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLab(lab)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" /> Form 2A
                          </button>
                          <button
                            onClick={() => setLabResultDraft({ ...lab })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" /> Encode Result
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODULE 4: ALIGNED FHSIS ANALYTICS EXPORT (FORM M1 / QUARTERLY)
           ============================================================ */}
        {activeMenu === 'reports' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 print:hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-800">RHU FHSIS Analytics & Validation Export</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Consolidates validated BHW submissions into Form M1 (CHD.PDMD.F.001.REV00) ready for CHO transmittal.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportRhuFhsisCsv}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4 text-emerald-600" /> Export CSV
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    <Printer className="w-4 h-4" /> Print Official FHSIS
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Catchment Barangay</label>
                  <select
                    value={reportScope}
                    onChange={(e) => setReportScope(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="All Catchment Barangays">All Catchment Barangays</option>
                    {BARANGAY_LIST.map((b) => (
                      <option key={b} value={b}>Barangay {b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Frequency</label>
                  <select
                    value={reportPeriodType}
                    onChange={(e) => setReportPeriodType(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="Monthly">Monthly (Form M1)</option>
                    <option value="Quarterly">Quarterly Summary</option>
                  </select>
                </div>

                {reportPeriodType === 'Monthly' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Month</label>
                    <select
                      value={reportMonth}
                      onChange={(e) => setReportMonth(Number(e.target.value))}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Quarter</label>
                    <select
                      value={reportQuarter}
                      onChange={(e) => setReportQuarter(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50"
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
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg bg-slate-50"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                  </select>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg w-full">
                    <input
                      type="checkbox"
                      checked={validatedOnly}
                      onChange={(e) => setValidatedOnly(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600"
                    />
                    Validated Only
                  </label>
                </div>
              </div>
            </div>

            {/* Printable Aligned RHU FHSIS Sheet */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
              <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Local Health Unit (RHU) • Butuan City Health Department
                  </p>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                    RHU VALIDATED FHSIS {reportPeriodType.toUpperCase()} REPORT — {reportPeriodLabel.toUpperCase()}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Scope: <strong>{reportScope}</strong> • Filter: <strong>{validatedOnly ? 'Validated Records Only' : 'All Submissions'}</strong> ({filteredReportRecords.length} records)
                  </p>
                </div>
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded">
                  CHD.PDMD.F.001.REV00
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section A. Family Planning (WRA)
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center">10-14</th>
                        <th className="p-2 border border-slate-200 text-center">15-19</th>
                        <th className="p-2 border border-slate-200 text-center">20-49</th>
                        <th className="p-2 border border-slate-200 text-center bg-slate-200">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['New Acceptors', fhsisSummary.secA.newAcceptors],
                        ['Current Users', fhsisSummary.secA.currentUsers],
                        ['Drop-outs', fhsisSummary.secA.dropOuts],
                      ].map(([lbl, r]) => (
                        <tr key={lbl}>
                          <td className="p-2 border border-slate-200 font-medium">{lbl}</td>
                          <td className="p-2 border border-slate-200 text-center">{r['10-14']}</td>
                          <td className="p-2 border border-slate-200 text-center">{r['15-19']}</td>
                          <td className="p-2 border border-slate-200 text-center">{r['20-49']}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section B. Maternal Care
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center">10-14</th>
                        <th className="p-2 border border-slate-200 text-center">15-19</th>
                        <th className="p-2 border border-slate-200 text-center">20-49</th>
                        <th className="p-2 border border-slate-200 text-center bg-slate-200">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Prenatal Care (ANC Visits)', fhsisSummary.secB.ancVisits],
                        ['Completed 8ANC & Tracked', fhsisSummary.secB.completed8ANC],
                        ['BP Measured', fhsisSummary.secB.bpMeasured],
                        ['High BP / Danger Signs', fhsisSummary.secB.highBpDanger],
                        ['Postpartum Care (4PNC)', fhsisSummary.secB.pncVisits],
                      ].map(([lbl, r]) => (
                        <tr key={lbl}>
                          <td className="p-2 border border-slate-200 font-medium">{lbl}</td>
                          <td className="p-2 border border-slate-200 text-center">{r['10-14']}</td>
                          <td className="p-2 border border-slate-200 text-center">{r['15-19']}</td>
                          <td className="p-2 border border-slate-200 text-center">{r['20-49']}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section C & D. Child & Oral Health
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center">M</th>
                        <th className="p-2 border border-slate-200 text-center">F</th>
                        <th className="p-2 border border-slate-200 text-center bg-slate-200">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['BCG / HepB', fhsisSummary.secC.bcgHepB],
                        ['DPT-HiB-HepB / OPV / PCV', fhsisSummary.secC.pentaOpvPcv],
                        ['MMR / FIC', fhsisSummary.secC.mmrFic],
                        ['Vitamin A', fhsisSummary.secC.vitA],
                        ['Acute Diarrhea', fhsisSummary.secC.acuteDiarrhea],
                        ['Pneumonia', fhsisSummary.secC.pneumonia],
                        ['Oral Health (1st Visit)', fhsisSummary.secD.firstVisit],
                      ].map(([lbl, r]) => (
                        <tr key={lbl}>
                          <td className="p-2 border border-slate-200 font-medium">{lbl}</td>
                          <td className="p-2 border border-slate-200 text-center">{r.M}</td>
                          <td className="p-2 border border-slate-200 text-center">{r.F}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section E. NCDs (PhilPEN)
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center">M</th>
                        <th className="p-2 border border-slate-200 text-center">F</th>
                        <th className="p-2 border border-slate-200 text-center bg-slate-200">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Adults (20-59) Assessed', fhsisSummary.secE.riskAssessedAdult],
                        ['Seniors (60+) Assessed', fhsisSummary.secE.riskAssessedSenior],
                        ['Overweight / Obese', fhsisSummary.secE.overweightObese],
                        ['Hypertensive (20-59)', fhsisSummary.secE.hypertensiveAdult],
                        ['Hypertensive (60+)', fhsisSummary.secE.hypertensiveSenior],
                        ['Diabetes (20-59)', fhsisSummary.secE.diabeticAdult],
                        ['Diabetes (60+)', fhsisSummary.secE.diabeticSenior],
                      ].map(([lbl, r]) => (
                        <tr key={lbl}>
                          <td className="p-2 border border-slate-200 font-medium">{lbl}</td>
                          <td className="p-2 border border-slate-200 text-center">{r.M}</td>
                          <td className="p-2 border border-slate-200 text-center">{r.F}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase bg-slate-800 text-white px-3 py-2 rounded-t">
                    Section G. Infectious Diseases
                  </h3>
                  <table className="w-full text-xs border border-slate-200 border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-200 text-left">Indicator</th>
                        <th className="p-2 border border-slate-200 text-center">M</th>
                        <th className="p-2 border border-slate-200 text-center">F</th>
                        <th className="p-2 border border-slate-200 text-center bg-slate-200">Tot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Dengue Clinical Case', fhsisSummary.secG.dengue],
                        ['Acute Respiratory Inf.', fhsisSummary.secG.ari],
                        ['Animal Bites / Rabies', fhsisSummary.secG.rabiesBites],
                        ['Schistosomiasis', fhsisSummary.secG.schisto],
                        ['STH / Deworming', fhsisSummary.secG.sthDeworming],
                        ['TB / Leprosy / HIV-STI', fhsisSummary.secG.tbLeprosyHiv],
                      ].map(([lbl, r]) => (
                        <tr key={lbl}>
                          <td className="p-2 border border-slate-200 font-medium">{lbl}</td>
                          <td className="p-2 border border-slate-200 text-center">{r.M}</td>
                          <td className="p-2 border border-slate-200 text-center">{r.F}</td>
                          <td className="p-2 border border-slate-200 text-center font-bold bg-slate-50">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
                <div>
                  <p className="text-slate-500">Prepared & Validated by:</p>
                  <p className="mt-6 font-bold text-slate-800 border-b border-slate-400 pb-1 inline-block min-w-[220px]">
                    {rhuPreparedBy}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Noted by:</p>
                  <p className="mt-6 font-bold text-slate-800 border-b border-slate-400 pb-1 inline-block min-w-[220px]">
                    {rhuNotedBy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================
          MODAL 1: CLINICAL DATA VALIDATION MODAL
         ============================================================ */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                {selectedRecord.validationStatus === 'Validated'
                  ? 'Validated Clinical Record'
                  : 'Clinical Data Validation'}
              </h3>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {selectedRecord.validationStatus === 'Validated' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  This record is validated and included in the official RHU & CHO FHSIS roll-up.
                </div>
              )}

              {selectedRecord.validationStatus === 'Returned to BHW' && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  Returned to BHW for correction. Remarks: "{selectedRecord.validatorRemarks}"
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <h4 className="text-base font-bold text-blue-900">{selectedRecord.patientSnapshot?.name}</h4>
                  <p className="text-xs text-blue-700 mt-1 font-mono">
                    Visit: {selectedRecord.visitId} | Patient: {selectedRecord.patientId}
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Age: {selectedRecord.patientSnapshot?.age} yrs ({selectedRecord.patientSnapshot?.sex}) • DOB: {selectedRecord.patientSnapshot?.dob || 'N/A'}
                  </p>
                  <div className="text-xs text-blue-700 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedRecord.patientSnapshot?.address}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-blue-800">
                      <Clock className="w-3 h-3" /> {selectedRecord.timestamp || selectedRecord.visitDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="flex items-center gap-1 text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      <Phone className="w-3 h-3" /> {selectedRecord.patientSnapshot?.contactNumber || 'N/A'}
                    </span>
                    <span className="text-xs font-semibold text-blue-800">
                      {selectedRecord.patientSnapshot?.membershipStatus}{' '}
                      {selectedRecord.patientSnapshot?.phicNo && `(${selectedRecord.patientSnapshot.phicNo})`}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="inline-block px-2.5 py-1 bg-white border border-blue-200 text-blue-800 text-xs font-bold rounded-full">
                    {selectedRecord.fhsisSection}
                  </span>
                  <p className="text-xs font-semibold text-slate-700 mt-2">{selectedRecord.serviceSubtype}</p>
                  <p className="text-[11px] text-slate-500">{selectedRecord.natureOfVisit}</p>
                </div>
              </div>

              {selectedRecord.isPregnant && (
                <div className="flex items-center gap-2 bg-pink-50 text-pink-700 p-3 rounded-lg border border-pink-100 text-sm font-medium">
                  <Baby className="w-4 h-4" /> Patient flagged for Maternal Care tracking.
                </div>
              )}

              <div>
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Recorded Vital Signs & Anthropometrics</h5>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2.5">
                  {[
                    ['Temp', selectedRecord.temperature ? `${selectedRecord.temperature}°C` : '—'],
                    ['BP', selectedRecord.bloodPressure || '—'],
                    ['Pulse', selectedRecord.pulseRate || '—'],
                    ['Resp', selectedRecord.respiratoryRate || '—'],
                    ['Weight', selectedRecord.weight ? `${selectedRecord.weight} kg` : '—'],
                    ['Height', selectedRecord.height ? `${selectedRecord.height} cm` : '—'],
                    ['BMI', selectedRecord.bmi ? selectedRecord.bmi.split(' ')[0] : '—'],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">{lbl}</span>
                      <span className="block text-sm font-bold text-slate-800 mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chief Complaint & Notes</h5>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {selectedRecord.chiefComplaint || 'No clinical notes entered.'}
                  </p>
                </div>
                {selectedRecord.medicalHistory && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Allergies & Past Medical History</h5>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {selectedRecord.medicalHistory}
                    </p>
                  </div>
                )}
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Intervention / Action Taken</h5>
                  <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> {selectedRecord.actionTaken || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Validator's Remarks / Final Diagnosis
                </h5>
                <textarea
                  rows="3"
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Enter clinical remarks, FHSIS codes, or correction instructions if returning to the BHW..."
                  className="w-full text-sm rounded-lg p-3 border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <label className="flex items-center gap-2 p-3 rounded-lg border bg-amber-50 border-amber-200 text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modalLabFlag}
                    onChange={(e) => setModalLabFlag(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 border-amber-300"
                  />
                  <FlaskConical className="w-4 h-4 text-amber-700" />
                  <span className="text-sm font-medium">
                    Flag for Laboratory / Diagnostic Testing (Auto-creates Form 2A Lab Referral on Approve)
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-end gap-2.5">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleValidationAction('Returned to BHW')}
                className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-1.5 bg-white"
              >
                <RotateCcw className="w-4 h-4" /> Return to BHW
              </button>
              <button
                onClick={() => handleValidationAction('Validated')}
                className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" /> Approve to FHSIS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: LOG BIRTHING FACILITY DELIVERY
         ============================================================ */}
      {showBirthingModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Baby className="w-5 h-5 text-pink-600" /> Log Birthing Facility Delivery (CHD.HND.F.088)
              </h3>
              <button onClick={() => setShowBirthingModal(false)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBirthingRecord} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Patient Full Name</label>
                  <input type="text" required value={birthingForm.patientName} onChange={(e) => setBirthingForm({ ...birthingForm, patientName: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Address / Barangay</label>
                  <input type="text" required value={birthingForm.address} onChange={(e) => setBirthingForm({ ...birthingForm, address: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Date of Delivery</label>
                  <input type="date" required value={birthingForm.dateOfDelivery} onChange={(e) => setBirthingForm({ ...birthingForm, dateOfDelivery: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Age</label>
                    <input type="number" required value={birthingForm.age} onChange={(e) => setBirthingForm({ ...birthingForm, age: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Category</label>
                    <select value={birthingForm.category} onChange={(e) => setBirthingForm({ ...birthingForm, category: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                      <option value="P-PHIC">P-PHIC</option>
                      <option value="NP-Non-PHIC">NP-Non-PHIC</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">OB Score (Gravida/Para)</label>
                  <input type="text" value={birthingForm.obScore} onChange={(e) => setBirthingForm({ ...birthingForm, obScore: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Prenatal Visits</label>
                    <input type="number" value={birthingForm.prenatalVisits} onChange={(e) => setBirthingForm({ ...birthingForm, prenatalVisits: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Days Stayed</label>
                    <input type="number" value={birthingForm.daysStayed} onChange={(e) => setBirthingForm({ ...birthingForm, daysStayed: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">NBS Status</label>
                  <select value={birthingForm.nbsStatus} onChange={(e) => setBirthingForm({ ...birthingForm, nbsStatus: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Performed">Performed (✓)</option>
                    <option value="Not Done">Not Done (✗)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Delivery Outcome</label>
                  <select value={birthingForm.outcome} onChange={(e) => setBirthingForm({ ...birthingForm, outcome: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Alive Baby Boy">Alive Baby Boy</option>
                    <option value="Alive Baby Girl">Alive Baby Girl</option>
                    <option value="Stillbirth">Stillbirth</option>
                    <option value="Neonatal Death">Neonatal Death</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">PPFP Method Used</label>
                  <input type="text" value={birthingForm.ppfpMethod} onChange={(e) => setBirthingForm({ ...birthingForm, ppfpMethod: e.target.value })} placeholder="PPIUD / Implant / Pills / None" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">PPFP Performed By</label>
                  <input type="text" value={birthingForm.ppfpPerformedBy} onChange={(e) => setBirthingForm({ ...birthingForm, ppfpPerformedBy: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Handled By (SHP)</label>
                  <input type="text" value={birthingForm.handledBy} onChange={(e) => setBirthingForm({ ...birthingForm, handledBy: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Assisted By</label>
                  <input type="text" value={birthingForm.assistedBy} onChange={(e) => setBirthingForm({ ...birthingForm, assistedBy: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="sm:col-span-2 flex gap-4 py-1">
                  <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                    <input type="checkbox" checked={birthingForm.hasBirthPlan} onChange={(e) => setBirthingForm({ ...birthingForm, hasBirthPlan: e.target.checked })} />
                    Had Birth Plan
                  </label>
                  <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                    <input type="checkbox" checked={birthingForm.pncCompleted} onChange={(e) => setBirthingForm({ ...birthingForm, pncCompleted: e.target.checked })} />
                    Completed ≥2 PNC Visits
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Remarks (Discharged / Referred)</label>
                  <input type="text" value={birthingForm.remarks} onChange={(e) => setBirthingForm({ ...birthingForm, remarks: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowBirthingModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Save Delivery Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: NEW FORM 2A LABORATORY REQUEST
         ============================================================ */}
      {showNewLabModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" /> Form 2A: Laboratory Request (Health Worker)
              </h3>
              <button onClick={() => setShowNewLabModal(false)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLabRequest} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Patient Full Name</label>
                  <input type="text" required value={newLabForm.patientName} onChange={(e) => setNewLabForm({ ...newLabForm, patientName: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Age</label>
                    <input type="number" required value={newLabForm.age} onChange={(e) => setNewLabForm({ ...newLabForm, age: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Sex</label>
                    <select value={newLabForm.sex} onChange={(e) => setNewLabForm({ ...newLabForm, sex: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Contact No.</label>
                  <input type="text" value={newLabForm.contactNo} onChange={(e) => setNewLabForm({ ...newLabForm, contactNo: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Requesting Physician</label>
                  <input type="text" value={newLabForm.requestingPhysician} onChange={(e) => setNewLabForm({ ...newLabForm, requestingPhysician: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Reason for Examination</label>
                  <select value={newLabForm.reasonForExam} onChange={(e) => setNewLabForm({ ...newLabForm, reasonForExam: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="Baseline">Baseline</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">History of Treatment</label>
                  <select value={newLabForm.treatmentHistory} onChange={(e) => setNewLabForm({ ...newLabForm, treatmentHistory: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="New">New</option>
                    <option value="Retreatment">Retreatment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Test Requested</label>
                  <select value={newLabForm.testRequested} onChange={(e) => setNewLabForm({ ...newLabForm, testRequested: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Xpert MTB/RIF">Xpert MTB/RIF</option>
                    <option value="Smear Microscopy">Smear Microscopy</option>
                    <option value="TB LAMP">TB LAMP</option>
                    <option value="LPA">LPA</option>
                    <option value="Culture / DST">Culture / DST</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Specimen Type</label>
                  <select value={newLabForm.specimenType} onChange={(e) => setNewLabForm({ ...newLabForm, specimenType: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Sputum">Sputum</option>
                    <option value="Blood / Serum">Blood / Serum</option>
                    <option value="Stool (Kato-Katz)">Stool (Kato-Katz)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Specimen 1 Date Collected</label>
                  <input type="date" value={newLabForm.specimen1Collected} onChange={(e) => setNewLabForm({ ...newLabForm, specimen1Collected: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Date Dispatched to Lab</label>
                  <input type="date" value={newLabForm.specimen1Dispatched} onChange={(e) => setNewLabForm({ ...newLabForm, specimen1Dispatched: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Clinical Remarks / Risk Factors</label>
                  <textarea rows="2" value={newLabForm.requestRemarks} onChange={(e) => setNewLabForm({ ...newLabForm, requestRemarks: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowNewLabModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold">Submit Form 2A Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 4: ENCODE MEDTECH RESULTS (FORM 2A LOWER SECTION)
         ============================================================ */}
      {labResultDraft && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Encode Diagnostic Results (MedTech)</h3>
                <p className="text-xs text-slate-500">{labResultDraft.labId} • {labResultDraft.patientName} ({labResultDraft.testRequested})</p>
              </div>
              <button onClick={() => setLabResultDraft(null)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLabResults} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Laboratory Serial Number</label>
                  <input type="text" required value={labResultDraft.labSerialNo} onChange={(e) => setLabResultDraft({ ...labResultDraft, labSerialNo: e.target.value })} placeholder="CHD-LAB-26-XXXX" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Date Specimen Examined</label>
                  <input type="date" required value={labResultDraft.dateExamined} onChange={(e) => setLabResultDraft({ ...labResultDraft, dateExamined: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Specimen Volume & Quality</label>
                  <select value={labResultDraft.specimenQuality} onChange={(e) => setLabResultDraft({ ...labResultDraft, specimenQuality: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Xpert MTB/RIF Result</label>
                  <select value={labResultDraft.xpertResult} onChange={(e) => setLabResultDraft({ ...labResultDraft, xpertResult: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="">Select / N/A</option>
                    <option value="MTB Not Detected">MTB Not Detected</option>
                    <option value="MTB Detected, RIF Resistance Not Detected">MTB Detected, RIF Not Detected</option>
                    <option value="MTB Detected, RIF Resistance Detected">MTB Detected, RIF Detected</option>
                    <option value="Invalid / Error">Invalid / Error</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Smear Microscopy Reading (1 / 2)</label>
                  <input type="text" value={labResultDraft.smearReading1} onChange={(e) => setLabResultDraft({ ...labResultDraft, smearReading1: e.target.value })} placeholder="e.g. 0 / Negative or +1" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Paragonimiasis Result</label>
                  <select value={labResultDraft.paragonimiasisResult} onChange={(e) => setLabResultDraft({ ...labResultDraft, paragonimiasisResult: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                    <option value="Neg">Neg (No ova / No bacilli)</option>
                    <option value="P">P (Paragonimus ova only)</option>
                    <option value="T">T (AFB only)</option>
                    <option value="Co-I">Co-I (Both ova and bacilli)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Final Laboratory Diagnosis</label>
                  <input type="text" required value={labResultDraft.labDiagnosis} onChange={(e) => setLabResultDraft({ ...labResultDraft, labDiagnosis: e.target.value })} placeholder="e.g. Negative for M. tuberculosis" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Performed By (RMT)</label>
                  <input type="text" value={labResultDraft.performedBy} onChange={(e) => setLabResultDraft({ ...labResultDraft, performedBy: e.target.value })} placeholder="RMT Name" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Verified By</label>
                  <input type="text" value={labResultDraft.verifiedBy} onChange={(e) => setLabResultDraft({ ...labResultDraft, verifiedBy: e.target.value })} placeholder="Chief MedTech" className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setLabResultDraft(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Release Laboratory Result</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 5: PRINTABLE FORM 2A VIEWER (CHD.HND.F.054.REV03)
         ============================================================ */}
      {selectedLab && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col print:shadow-none print:max-h-none">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:hidden">
              <h3 className="font-bold text-slate-800">Form 2A. Laboratory Request and Result Form</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                  <Printer className="w-3.5 h-3.5" /> Print Form 2A
                </button>
                <button onClick={() => setSelectedLab(null)} className="text-slate-400 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              <div className="border-b-2 border-slate-800 pb-2 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase text-slate-500 font-semibold">City Government of Butuan • City Health Department</p>
                  <h4 className="text-base font-extrabold">FORM 2A. LABORATORY REQUEST AND RESULT FORM</h4>
                </div>
                <span className="font-mono text-[10px] text-slate-500">CHD.HND.F.054.REV03</span>
              </div>

              <div className="border border-slate-300 rounded-lg p-3 space-y-2">
                <p className="font-bold uppercase text-[11px] bg-slate-100 px-2 py-1">Part 1: Health Worker Request</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Requesting Unit:</strong> {selectedLab.requestingFacility}</div>
                  <div><strong>Date of Request:</strong> {selectedLab.dateOfRequest}</div>
                  <div><strong>Patient Full Name:</strong> {selectedLab.patientName}</div>
                  <div><strong>Age / Sex:</strong> {selectedLab.age} yrs / {selectedLab.sex}</div>
                  <div><strong>Reason for Exam:</strong> {selectedLab.reasonForExam}</div>
                  <div><strong>Treatment History:</strong> {selectedLab.treatmentHistory}</div>
                  <div><strong>Test Requested:</strong> {selectedLab.testRequested}</div>
                  <div><strong>Specimen Type:</strong> {selectedLab.specimenType}</div>
                  <div><strong>Collected / Dispatched:</strong> {selectedLab.specimen1Collected} / {selectedLab.specimen1Dispatched}</div>
                  <div><strong>Requesting Physician:</strong> {selectedLab.requestingPhysician}</div>
                </div>
                <div><strong>Remarks:</strong> {selectedLab.requestRemarks || 'None'}</div>
              </div>

              <div className="border border-slate-300 rounded-lg p-3 space-y-2">
                <p className="font-bold uppercase text-[11px] bg-slate-100 px-2 py-1">Part 2: Diagnostic Laboratory Result</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Laboratory Name:</strong> {selectedLab.labName}</div>
                  <div><strong>Lab Serial No.:</strong> {selectedLab.labSerialNo || 'Pending'}</div>
                  <div><strong>Specimen Quality:</strong> {selectedLab.specimenQuality}</div>
                  <div><strong>Date Examined:</strong> {selectedLab.dateExamined || 'Pending'}</div>
                  <div><strong>Xpert MTB/RIF:</strong> {selectedLab.xpertResult || '—'}</div>
                  <div><strong>Smear / Paragonimiasis:</strong> {selectedLab.smearReading1 || '—'} / {selectedLab.paragonimiasisResult || '—'}</div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded font-bold text-blue-900">
                  Laboratory Diagnosis: {selectedLab.labDiagnosis || 'Awaiting MedTech Release'}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600">
                  <div>Performed by: <strong>{selectedLab.performedBy || '—'}</strong></div>
                  <div>Verified by: <strong>{selectedLab.verifiedBy || '—'}</strong></div>
                  <div>Released: <strong>{selectedLab.dateTimeReleased || '—'}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}