import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Map as MapIcon, Activity, AlertTriangle, FileSpreadsheet,
  MapPin, Layers, Filter, Download, TrendingUp, TrendingDown, Users,
  Baby, Search, CheckCircle, FileText, DownloadCloud, Clock, PenTool,
  Users2, CalendarDays, RefreshCw, Building2, Flame, Eye, X, Printer,
  Sliders, Phone, Navigation, ShieldAlert, Crosshair
} from 'lucide-react';
import {
  MapContainer, TileLayer, CircleMarker, Circle, Marker,
  Popup, Tooltip, useMap, useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- BUTUAN CITY BARANGAY HEALTH CENTERS (BHS) DIRECTORY ---
const BARANGAY_HEALTH_CENTERS = [
  {
    id: 'BHS-AMP', barangay: 'Ampayon', bhsName: 'Ampayon Barangay Health Station',
    address: 'Purok 2, National Highway, Brgy. Ampayon, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM | Sat: 8:00 AM – 12:00 PM',
    contact: '(085) 342-1101 / 0917-810-2201',
    lat: 8.9570, lng: 125.5985, population: 16420, district: 'East District',
  },
  {
    id: 'BHS-TIN', barangay: 'Tiniwisan', bhsName: 'Tiniwisan Barangay Health Station',
    address: 'BMC Compound Road, Brgy. Tiniwisan, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
    contact: '(085) 342-1102 / 0917-810-2202',
    lat: 8.9654, lng: 125.5777, population: 14890, district: 'East District',
  },
  {
    id: 'BHS-BA3', barangay: 'Baan 3', bhsName: 'Baan Km. 3 Barangay Health Station',
    address: 'Purok 1, Km. 3 Highway, Brgy. Baan 3, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
    contact: '(085) 342-1103 / 0917-810-2203',
    lat: 8.9542, lng: 125.5961, population: 13250, district: 'East District',
  },
  {
    id: 'BHS-BAR', barangay: 'Baan Riverside', bhsName: 'Baan Riverside Health Center',
    address: 'Purok 3, Riverside Road, Brgy. Baan Riverside, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
    contact: '(085) 342-1104 / 0917-810-2204',
    lat: 8.9515, lng: 125.5480, population: 11840, district: 'Poblacion East',
  },
  {
    id: 'BHS-BAD', barangay: 'Bading', bhsName: 'Bading Barangay Health Station',
    address: 'Purok 4, Agusan Riverbank, Brgy. Bading, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
    contact: '(085) 342-1105 / 0917-810-2205',
    lat: 8.9580, lng: 125.5390, population: 10910, district: 'North District',
  },
  {
    id: 'BHS-BAN', barangay: 'Bancasi', bhsName: 'Bancasi Barangay Health Station',
    address: 'Airport Access Road, Brgy. Bancasi, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
    contact: '(085) 342-1106 / 0917-810-2206',
    lat: 8.9510, lng: 125.4850, population: 9820, district: 'West District',
  },
  {
    id: 'BHS-DOO', barangay: 'Doongan', bhsName: 'Doongan Barangay Health & Birthing Center',
    address: 'J.C. Aquino Ave., Brgy. Doongan, Butuan City',
    hours: 'Mon–Sun: 24/7 Birthing | OPD 8:00 AM – 5:00 PM',
    contact: '(085) 342-1107 / 0917-810-2207',
    lat: 8.9530, lng: 125.5250, population: 19650, district: 'Central District',
  },
  {
    id: 'BHS-LIB', barangay: 'Libertad', bhsName: 'Libertad Barangay Health Station',
    address: 'Purok 6, Libertad Sports Complex Rd., Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM | Sat: 8:00 AM – 12:00 PM',
    contact: '(085) 342-1108 / 0917-810-2208',
    lat: 8.9415, lng: 125.5038, population: 24310, district: 'West District',
  },
  {
    id: 'BHS-MAH', barangay: 'Mahogany', bhsName: 'Mahogany Barangay Health Station',
    address: 'Purok 2, Mahogany St., Brgy. Mahogany, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
    contact: '(085) 342-1109 / 0917-810-2209',
    lat: 8.9560, lng: 125.5490, population: 8940, district: 'Poblacion East',
  },
  {
    id: 'BHS-SNV', barangay: 'San Vicente', bhsName: 'San Vicente Barangay Health & Birthing Center',
    address: 'Purok 3, San Vicente Proper, Butuan City',
    hours: 'Mon–Sun: 24/7 Birthing | OPD 8:00 AM – 5:00 PM',
    contact: '(085) 342-1110 / 0917-810-2210',
    lat: 8.9150, lng: 125.5420, population: 21580, district: 'South District',
  },
  {
    id: 'BHS-VLK', barangay: 'Villa Kananga', bhsName: 'Villa Kananga Barangay Health Station',
    address: 'Purok 2, Villa Kananga Road, Butuan City',
    hours: 'Mon–Fri: 8:00 AM – 5:00 PM',
    contact: '(085) 342-1111 / 0917-810-2211',
    lat: 8.9324, lng: 125.5269, population: 14120, district: 'South District',
  },
];

const BARANGAY_VIEWPORTS = {
  'All Butuan City': { center: [8.9470, 125.5480], zoom: 12 },
  ...Object.fromEntries(
    BARANGAY_HEALTH_CENTERS.map((bhs) => [
      bhs.barangay,
      { center: [bhs.lat, bhs.lng], zoom: 15 },
    ])
  ),
};

// Free OpenStreetMap tiles with CSS contrast modes (no API key required)
const BASEMAP_STYLES = {
  light: {
    label: 'High-Contrast Light',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    themeClass: 'map-theme-light',
  },
  standard: {
    label: 'Standard Streets',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    themeClass: '',
  },
  dark: {
    label: 'Dark Surveillance',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    themeClass: 'map-theme-dark',
  },
};

const FHSIS_SECTIONS = [
  'Section A: Family Planning',
  'Section B: Maternal Care',
  'Section C: Child Care & Immunization',
  'Section D: Oral Health',
  'Section E: Non-Communicable Diseases (PhilPEN)',
  'Section G: Infectious Diseases & Morbidity',
];

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

// --- CITY-WIDE BASELINE VALIDATED RECORDS (Aligned with BHW Visit Schema) ---
const BASELINE_CITY_RECORDS = [
  {
    visitId: 'CHO-2026-001', patientId: 'BHW-TIN-2026-0001',
    patientSnapshot: { name: 'Maria Santos', age: '28', sex: 'Female', address: 'Purok 2, Barangay Tiniwisan, Butuan City' },
    barangay: 'Tiniwisan', visitDate: '2026-11-24', timestamp: '11/24/2026, 9:15:22 AM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '39.1', bloodPressure: '110/70', bmi: '22.9 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'High fever for 3 days, joint pain, mild rash on arms.',
    actionTaken: 'Referred to RHU / Hospital', referralRoute: 'BHS to RHU', outcome: 'Referred to RHU / Hospital',
    latitude: '8.966800', longitude: '125.579100', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-010', patientId: 'BHW-TIN-2026-0009',
    patientSnapshot: { name: 'Carlos Perez', age: '14', sex: 'Male', address: 'Purok 3, Barangay Tiniwisan, Butuan City' },
    barangay: 'Tiniwisan', visitDate: '2026-11-21', timestamp: '11/21/2026, 2:10:00 PM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '39.0', bloodPressure: '100/65', bmi: '19.1 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'Febrile for 2 days with headache and petechial rash.',
    actionTaken: 'Referred to RHU / Hospital', referralRoute: 'BHS to RHU', outcome: 'Referred to RHU / Hospital',
    latitude: '8.964500', longitude: '125.576200', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-002', patientId: 'BHW-AMP-2026-0010',
    patientSnapshot: { name: 'Mark Bautista', age: '34', sex: 'Male', address: 'Purok 5, Barangay Ampayon, Butuan City' },
    barangay: 'Ampayon', visitDate: '2026-11-25', timestamp: '11/25/2026, 10:05:00 AM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '38.9', bloodPressure: '115/75', bmi: '23.4 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'Persistent fever, retro-orbital pain, nausea.',
    actionTaken: 'Referred to RHU / Hospital', referralRoute: 'BHS to RHU', outcome: 'Referred to RHU / Hospital',
    latitude: '8.958500', longitude: '125.600100', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-003', patientId: 'BHW-AMP-2026-0011',
    patientSnapshot: { name: 'Elena Villanueva', age: '19', sex: 'Female', address: 'Purok 3, Barangay Ampayon, Butuan City' },
    barangay: 'Ampayon', visitDate: '2026-11-22', timestamp: '11/22/2026, 1:20:00 PM',
    natureOfVisit: 'Follow-up Visit', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '38.6', bloodPressure: '105/70', bmi: '20.5 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'Day 4 fever monitoring; platelet count ordered.',
    actionTaken: 'Routine Monitoring / Advised', referralRoute: 'None', outcome: 'Under Monitoring',
    latitude: '8.957400', longitude: '125.597900', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-011', patientId: 'BHW-AMP-2026-0012',
    patientSnapshot: { name: 'Jerome Alcantara', age: '22', sex: 'Male', address: 'Purok 4, Barangay Ampayon, Butuan City' },
    barangay: 'Ampayon', visitDate: '2026-11-23', timestamp: '11/23/2026, 3:40:00 PM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '39.4', bloodPressure: '110/70', bmi: '21.7 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'Sudden high-grade fever, muscle aches, positive NS1 test.',
    actionTaken: 'Referred to RHU / Hospital', referralRoute: 'BHS to RHU', outcome: 'Referred to RHU / Hospital',
    latitude: '8.956200', longitude: '125.599400', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-013', patientId: 'BHW-MAH-2026-0015',
    patientSnapshot: { name: 'Rico Mendoza', age: '27', sex: 'Male', address: 'Upper Mahogany Sitios, Butuan City' },
    barangay: 'Mahogany', visitDate: '2026-11-25', timestamp: '11/25/2026, 11:30:00 AM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '39.2', bloodPressure: '110/70', bmi: '22.1 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'High fever and severe joint pain from hillside purok.',
    actionTaken: 'Referred to RHU / Hospital', referralRoute: 'BHS to RHU', outcome: 'Referred to RHU / Hospital',
    latitude: '8.962800', longitude: '125.560500', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-004', patientId: 'BHW-BA3-2026-0003',
    patientSnapshot: { name: 'Ana Reyes', age: '24', sex: 'Female', address: 'Purok 1, Barangay Baan 3, Butuan City' },
    barangay: 'Baan 3', visitDate: '2026-11-16', timestamp: '11/16/2026, 2:45:10 PM',
    natureOfVisit: 'Follow-up Visit', fhsisSection: 'Section B: Maternal Care',
    serviceSubtype: 'Prenatal Care (ANC Visit)', fpClientType: '', bpDangerSign: false, isPregnant: true,
    temperature: '36.8', bloodPressure: '110/80', bmi: '24.2 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'Routine 3rd prenatal check-up; Iron/Folic acid dispensed.',
    actionTaken: 'Given Immunization / Supplement', referralRoute: 'None', outcome: 'Under Monitoring',
    latitude: '8.951800', longitude: '125.581500', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-005', patientId: 'BHW-LIB-2026-0004',
    patientSnapshot: { name: 'Pedro Gomez', age: '52', sex: 'Male', address: 'Purok 6, Barangay Libertad, Butuan City' },
    barangay: 'Libertad', visitDate: '2026-11-18', timestamp: '11/18/2026, 8:40:00 AM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Acute Respiratory Infection', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '37.9', bloodPressure: '130/85', bmi: '26.8 (Overweight)', bmiCategory: 'Overweight',
    chiefComplaint: 'Productive cough and mild dyspnea for 4 days.',
    actionTaken: 'Given Medication / First Aid', referralRoute: 'None', outcome: 'Under Monitoring',
    latitude: '8.942200', longitude: '125.504800', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-006', patientId: 'BHW-VLK-2026-0005',
    patientSnapshot: { name: 'Liza Mercado', age: '31', sex: 'Female', address: 'Purok 2, Barangay Villa Kananga, Butuan City' },
    barangay: 'Villa Kananga', visitDate: '2026-11-20', timestamp: '11/20/2026, 11:10:00 AM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section G: Infectious Diseases & Morbidity',
    serviceSubtype: 'Dengue Clinical Case', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '39.3', bloodPressure: '100/70', bmi: '21.8 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'Acute febrile illness, body malaise, positive tourniquet test.',
    actionTaken: 'Referred to RHU / Hospital', referralRoute: 'BHS to RHU', outcome: 'Referred to RHU / Hospital',
    latitude: '8.933100', longitude: '125.527600', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-007', patientId: 'BHW-DOO-2026-0006',
    patientSnapshot: { name: 'Roberto Navarro', age: '64', sex: 'Male', address: 'Purok 4, Barangay Doongan, Butuan City' },
    barangay: 'Doongan', visitDate: '2026-11-21', timestamp: '11/21/2026, 9:30:00 AM',
    natureOfVisit: 'Follow-up Visit', fhsisSection: 'Section E: Non-Communicable Diseases (PhilPEN)',
    serviceSubtype: 'Hypertension (PhilPEN)', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '36.7', bloodPressure: '150/92', bmi: '29.4 (Overweight)', bmiCategory: 'Overweight',
    chiefComplaint: 'BP monitoring and antihypertensive refill (Amlodipine).',
    actionTaken: 'Given Medication / First Aid', referralRoute: 'None', outcome: 'Under Monitoring',
    latitude: '8.953800', longitude: '125.526200', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-012', patientId: 'BHW-DOO-2026-0014',
    patientSnapshot: { name: 'Lourdes Salazar', age: '58', sex: 'Female', address: 'Purok 2, Barangay Doongan, Butuan City' },
    barangay: 'Doongan', visitDate: '2026-11-23', timestamp: '11/23/2026, 10:15:00 AM',
    natureOfVisit: 'Follow-up Visit', fhsisSection: 'Section E: Non-Communicable Diseases (PhilPEN)',
    serviceSubtype: 'Type II Diabetes (PhilPEN)', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '36.6', bloodPressure: '138/86', bmi: '28.1 (Overweight)', bmiCategory: 'Overweight',
    chiefComplaint: 'Routine FBS monitoring and oral hypoglycemic follow-up.',
    actionTaken: 'Given Medication / First Aid', referralRoute: 'None', outcome: 'Under Monitoring',
    latitude: '8.952700', longitude: '125.524600', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-008', patientId: 'BHW-SNV-2026-0007',
    patientSnapshot: { name: 'Clarissa Dizon', age: '26', sex: 'Female', address: 'Purok 3, Barangay San Vicente, Butuan City' },
    barangay: 'San Vicente', visitDate: '2026-11-14', timestamp: '11/14/2026, 3:05:00 PM',
    natureOfVisit: 'New Consultation', fhsisSection: 'Section A: Family Planning',
    serviceSubtype: 'Pills (POP / COC)', fpClientType: 'New Acceptor', bpDangerSign: false, isPregnant: false,
    temperature: '36.6', bloodPressure: '118/78', bmi: '22.0 (Normal)', bmiCategory: 'Normal',
    chiefComplaint: 'Family planning counseling and initial pills supply.',
    actionTaken: 'Given Medication / First Aid', referralRoute: 'None', outcome: 'Completed',
    latitude: '8.916200', longitude: '125.543400', syncStatus: 'Validated', source: 'CHO Baseline',
  },
  {
    visitId: 'CHO-2026-009', patientId: 'BHW-DOO-2026-0008',
    patientSnapshot: { name: 'Mateo Lim', age: '1', sex: 'Male', address: 'Purok 1, Barangay Doongan, Butuan City' },
    barangay: 'Doongan', visitDate: '2026-10-18', timestamp: '10/18/2026, 10:15:00 AM',
    natureOfVisit: 'Follow-up Visit', fhsisSection: 'Section C: Child Care & Immunization',
    serviceSubtype: 'Immunization (MMR / FIC)', fpClientType: '', bpDangerSign: false, isPregnant: false,
    temperature: '36.8', bloodPressure: '90/60', bmi: '16.9 (Underweight)', bmiCategory: 'Underweight',
    chiefComplaint: 'MMR Dose 1 and routine growth check.',
    actionTaken: 'Given Immunization / Supplement', referralRoute: 'None', outcome: 'Completed',
    latitude: '8.952400', longitude: '125.524100', syncStatus: 'Validated', source: 'CHO Baseline',
  },
];

// --- SPATIAL & EPIDEMIOLOGICAL HELPERS ---
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const extractBarangayFromAddress = (address = '') => {
  const lower = address.toLowerCase();
  const matched = BARANGAY_HEALTH_CENTERS.find((bhs) =>
    lower.includes(bhs.barangay.toLowerCase())
  );
  if (matched) return matched.barangay;
  const brgyMatch = address.match(/Barangay\s+([^,]+)/i);
  return brgyMatch ? brgyMatch[1].trim() : 'Ampayon';
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

const daysAgoFromToday = (isoDate) => {
  if (!isoDate) return 9999;
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rec = new Date(`${isoDate}T00:00:00`);
  return Math.floor((todayMidnight - rec) / (1000 * 60 * 60 * 24));
};

// --- CANVAS THERMAL HEAT MAP (Weighted Case Density & Normalized Attack Rate + Zoom Adaptive) ---
function ThermalHeatmapLayer({
  cases,
  heatMode,
  opacity,
  intensityScale,
  zoomAdaptive,
  barangayPopMap,
}) {
  const map = useMap();

  useEffect(() => {
    const canvas = L.DomUtil.create('canvas', 'leaflet-thermal-heat-layer');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = String(opacity);

    const overlayPane = map.getPanes().overlayPane;
    overlayPane.appendChild(canvas);

    // 256-step smooth thermal spectrum (Blue -> Green -> Yellow -> Orange -> Red)
    const gradCanvas = document.createElement('canvas');
    gradCanvas.width = 1;
    gradCanvas.height = 256;
    const gCtx = gradCanvas.getContext('2d');
    const ramp = gCtx.createLinearGradient(0, 0, 0, 256);
    ramp.addColorStop(0.0, 'rgba(37, 99, 235, 0)');
    ramp.addColorStop(0.15, 'rgba(59, 130, 246, 0.72)'); // Blue
    ramp.addColorStop(0.36, 'rgba(34, 197, 94, 0.82)');  // Green
    ramp.addColorStop(0.58, 'rgba(250, 204, 21, 0.88)'); // Yellow
    ramp.addColorStop(0.78, 'rgba(249, 115, 22, 0.94)'); // Orange
    ramp.addColorStop(1.0, 'rgba(239, 68, 68, 0.98)');   // Red
    gCtx.fillStyle = ramp;
    gCtx.fillRect(0, 0, 1, 256);
    const colorLut = gCtx.getImageData(0, 0, 1, 256).data;

    const createBrush = (radius) => {
      const size = radius * 2;
      const brush = document.createElement('canvas');
      brush.width = size;
      brush.height = size;
      const bCtx = brush.getContext('2d');
      const radGrad = bCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      radGrad.addColorStop(0.0, 'rgba(0, 0, 0, 1)');
      radGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.65)');
      radGrad.addColorStop(0.68, 'rgba(0, 0, 0, 0.24)');
      radGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
      bCtx.fillStyle = radGrad;
      bCtx.fillRect(0, 0, size, size);
      return brush;
    };

    const drawHeatmap = () => {
      const size = map.getSize();
      if (!size || size.x <= 0 || size.y <= 0) return;

      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);
      canvas.width = size.x;
      canvas.height = size.y;
      canvas.style.opacity = String(opacity);

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, size.x, size.y);

      if (!cases || cases.length === 0) return;

      const zoom = map.getZoom();
      const radius = zoomAdaptive
        ? Math.max(42, Math.min(120, Math.round(52 + (zoom - 12) * 15)))
        : 64;
      const zoomIntensityFactor = zoomAdaptive
        ? Math.max(0.75, Math.min(1.25, 1 + (13 - zoom) * 0.08))
        : 1.0;

      const brush = createBrush(radius);

      cases.forEach((rec) => {
        const lat = parseFloat(rec.latitude);
        const lng = parseFloat(rec.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const pt = map.latLngToContainerPoint([lat, lng]);
        if (pt.x < -radius || pt.y < -radius || pt.x > size.x + radius || pt.y > size.y + radius) {
          return;
        }

        let baseWeight = 0.36;
        if (heatMode === 'weighted') {
          const isDengue = (rec.serviceSubtype || '').includes('Dengue');
          const isInfectious = rec.fhsisSection === 'Section G: Infectious Diseases & Morbidity';
          const isHighRiskMaternal = rec.bpDangerSign || rec.fhsisSection === 'Section B: Maternal Care';
          baseWeight = isDengue ? 0.58 : isInfectious ? 0.45 : isHighRiskMaternal ? 0.40 : 0.32;
        } else {
          const pop = barangayPopMap[rec.barangay] || 15000;
          const per10kContribution = 10000 / pop;
          baseWeight = Math.min(0.72, Math.max(0.24, per10kContribution * 0.52));
        }

        ctx.globalAlpha = Math.min(0.95, baseWeight * intensityScale * zoomIntensityFactor);
        ctx.drawImage(brush, pt.x - radius, pt.y - radius);
      });

      const imgData = ctx.getImageData(0, 0, size.x, size.y);
      const pixels = imgData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = pixels[i + 3];
        if (alpha > 4) {
          const lutIdx = alpha * 4;
          pixels[i] = colorLut[lutIdx];
          pixels[i + 1] = colorLut[lutIdx + 1];
          pixels[i + 2] = colorLut[lutIdx + 2];
          pixels[i + 3] = colorLut[lutIdx + 3];
        } else {
          pixels[i + 3] = 0;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };

    const handleZoomStart = () => {
      canvas.style.visibility = 'hidden';
    };
    const handleZoomEnd = () => {
      canvas.style.visibility = 'visible';
      drawHeatmap();
    };

    drawHeatmap();
    map.on('move', drawHeatmap);
    map.on('moveend', drawHeatmap);
    map.on('resize', drawHeatmap);
    map.on('viewreset', drawHeatmap);
    map.on('zoomstart', handleZoomStart);
    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('move', drawHeatmap);
      map.off('moveend', drawHeatmap);
      map.off('resize', drawHeatmap);
      map.off('viewreset', drawHeatmap);
      map.off('zoomstart', handleZoomStart);
      map.off('zoomend', handleZoomEnd);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [map, cases, heatMode, opacity, intensityScale, zoomAdaptive, barangayPopMap]);

  return null;
}

// --- PIN & CLUSTER ICONS ---
const createHealthCenterPinIcon = (caseCount, isFocused) => {
  const fill = isFocused ? '#be185d' : '#ec0075';
  const stroke = isFocused ? '#fde047' : '#ffffff';
  const scale = isFocused ? 'transform:scale(1.16);' : '';
  const badge =
    caseCount > 0
      ? `<span style="position:absolute;top:-5px;right:-7px;min-width:17px;height:17px;padding:0 4px;border-radius:999px;background:#0f172a;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:1.5px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.35);">${caseCount}</span>`
      : '';

  return L.divIcon({
    className: 'custom-bhs-pin',
    html: `
      <div style="position:relative;width:30px;height:38px;display:flex;align-items:center;justify-content:center;${scale}filter:drop-shadow(0 3px 4px rgba(15,23,42,0.38));">
        <svg width="30" height="38" viewBox="0 0 30 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 1C7.82 1 2 6.82 2 14C2 23.25 15 36.5 15 36.5C15 36.5 28 23.25 28 14C28 6.82 22.18 1 15 1Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
          <circle cx="15" cy="13.5" r="6" fill="#ffffff"/>
          <path d="M15 10.5V16.5M12 13.5H18" stroke="${fill}" stroke-width="2" stroke-linecap="round"/>
        </svg>
        ${badge}
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 37],
    popupAnchor: [0, -34],
  });
};

const createClusterBadgeIcon = (facilityCount, totalCases) =>
  L.divIcon({
    className: 'custom-bhs-cluster',
    html: `
      <div style="position:relative;width:44px;height:44px;border-radius:999px;background:rgba(236,0,117,0.22);display:flex;align-items:center;justify-content:center;">
        <div style="width:34px;height:34px;border-radius:999px;background:#ec0075;border:2.5px solid #ffffff;color:#ffffff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(15,23,42,0.35);">
          ${facilityCount}
        </div>
        <span style="position:absolute;bottom:-6px;background:#0f172a;color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:999px;border:1px solid #fff;white-space:nowrap;">
          ${totalCases} cases
        </span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

// --- SMART PIN CLUSTERING LAYER ---
function SmartPinClusterLayer({
  healthCenters,
  clusteringEnabled,
  focusedBhsId,
  bufferKm,
  onSelectBhs,
  onToggleRingForBhs,
  showAllBuffers,
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const clusters = useMemo(() => {
    if (!clusteringEnabled || zoom >= 14) {
      return healthCenters.map((bhs) => ({
        isCluster: false,
        id: bhs.id,
        lat: bhs.lat,
        lng: bhs.lng,
        items: [bhs],
      }));
    }

    const thresholdPx = zoom <= 12 ? 56 : 44;
    const grouped = [];

    healthCenters.forEach((bhs) => {
      if (bhs.id === focusedBhsId) {
        grouped.push({
          isCluster: false,
          id: bhs.id,
          lat: bhs.lat,
          lng: bhs.lng,
          items: [bhs],
        });
        return;
      }

      const pt = map.latLngToContainerPoint([bhs.lat, bhs.lng]);
      let matchedCluster = null;

      for (const c of grouped) {
        if (c.items.some((i) => i.id === focusedBhsId)) continue;
        const cPt = map.latLngToContainerPoint([c.lat, c.lng]);
        const dist = Math.hypot(pt.x - cPt.x, pt.y - cPt.y);
        if (dist <= thresholdPx) {
          matchedCluster = c;
          break;
        }
      }

      if (matchedCluster) {
        matchedCluster.items.push(bhs);
        const n = matchedCluster.items.length;
        matchedCluster.lat = matchedCluster.items.reduce((s, x) => s + x.lat, 0) / n;
        matchedCluster.lng = matchedCluster.items.reduce((s, x) => s + x.lng, 0) / n;
        matchedCluster.isCluster = true;
      } else {
        grouped.push({
          isCluster: false,
          id: bhs.id,
          lat: bhs.lat,
          lng: bhs.lng,
          items: [bhs],
        });
      }
    });

    return grouped;
  }, [healthCenters, clusteringEnabled, zoom, focusedBhsId, map]);

  return (
    <>
      {clusters.map((entry) => {
        if (entry.isCluster && entry.items.length > 1) {
          const totalCases = entry.items.reduce((sum, b) => sum + b.totalCases, 0);
          return (
            <Marker
              key={`cluster-${entry.items.map((i) => i.id).join('-')}`}
              position={[entry.lat, entry.lng]}
              icon={createClusterBadgeIcon(entry.items.length, totalCases)}
              eventHandlers={{
                click: () => {
                  const bounds = L.latLngBounds(entry.items.map((i) => [i.lat, i.lng]));
                  map.flyToBounds(bounds.pad(0.45), { maxZoom: 15, duration: 0.85 });
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -18]} opacity={0.96}>
                <div className="text-xs font-sans">
                  <strong>{entry.items.length} Health Centers Clustered</strong>
                  <div className="text-slate-600">{entry.items.map((i) => i.barangay).join(', ')}</div>
                  <div className="text-[10px] text-pink-700 font-semibold mt-0.5">Click to zoom & expand pins</div>
                </div>
              </Tooltip>
            </Marker>
          );
        }

        const bhs = entry.items[0];
        const isFocused = focusedBhsId === bhs.id;

        return (
          <Marker
            key={bhs.id}
            position={[bhs.lat, bhs.lng]}
            icon={createHealthCenterPinIcon(bhs.totalCases, isFocused)}
            eventHandlers={{
              click: () => onSelectBhs(bhs),
            }}
          >
            <Popup>
              <div className="text-xs font-sans min-w-[245px] space-y-2">
                <div className="border-b border-slate-200 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-block px-1.5 py-0.5 bg-pink-100 text-pink-800 rounded text-[10px] font-bold uppercase">
                      Barangay Health Center
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{bhs.district}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{bhs.bhsName}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{bhs.address}</p>
                </div>

                {/* Facility Basics: Operating Hours & Contact */}
                <div className="space-y-1 text-[11px] text-slate-700">
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{bhs.hours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium">{bhs.contact}</span>
                  </div>
                </div>

                {/* Catchment Case Load */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <span className="text-blue-600 block text-[10px] font-semibold uppercase">Active Cases</span>
                    <strong className="text-blue-900 text-sm">{bhs.totalCases}</strong>
                    <span className="block text-[10px] text-slate-500">Assigned Brgy</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded border border-rose-100">
                    <span className="text-rose-600 block text-[10px] font-semibold uppercase">Recent 7-Day</span>
                    <strong className="text-rose-900 text-sm">{bhs.recent7DayCases}</strong>
                    <span className="block text-[10px] text-slate-500">Rate: {bhs.attackRate}/10k</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                  <div className="bg-slate-50 p-1 rounded border border-slate-200">
                    <span className="text-slate-400 block">Dengue</span>
                    <strong className="text-rose-700">{bhs.dengue}</strong>
                  </div>
                  <div className="bg-slate-50 p-1 rounded border border-slate-200">
                    <span className="text-slate-400 block">Maternal</span>
                    <strong className="text-pink-700">{bhs.maternal}</strong>
                  </div>
                  <div className="bg-slate-50 p-1 rounded border border-slate-200">
                    <span className="text-slate-400 block">In {bufferKm}km</span>
                    <strong className="text-emerald-700">{bhs.casesInRadius}</strong>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    Pop: <strong>{bhs.population.toLocaleString()}</strong>
                  </span>
                  <button
                    onClick={() => onToggleRingForBhs(bhs.id)}
                    className="px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-semibold hover:bg-slate-700 transition"
                  >
                    {isFocused || showAllBuffers ? `${bufferKm} km Ring Active` : `Show ${bufferKm} km Buffer`}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// Programmatic Map Camera Controller
function MapCameraController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo(target.center, target.zoom, { duration: 0.9 });
  }, [target, map]);
  return null;
}

export default function CHODashboard() {
  const [activeMenu, setActiveMenu] = useState('spatial'); // 'spatial' | 'registry' | 'reports'

  // --- INDEPENDENT LAYER TOGGLES ---
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showHealthPins, setShowHealthPins] = useState(true);

  // --- HEAT MAP ADVANCED CONTROLS ---
  const [heatMode, setHeatMode] = useState('weighted'); // 'weighted' | 'attackRate'
  const [heatOpacity, setHeatOpacity] = useState(0.76);
  const [heatIntensity, setHeatIntensity] = useState(1.1);
  const [zoomAdaptive, setZoomAdaptive] = useState(true);
  const [baseMapStyle, setBaseMapStyle] = useState('light'); // 'light' | 'standard' | 'dark'

  // --- PIN MAP & SPATIAL PROXIMITY CONTROLS ---
  const [showAllBuffers, setShowAllBuffers] = useState(false);
  const [bufferKm, setBufferKm] = useState(2); // 1, 2, or 3 km
  const [clusteringEnabled, setClusteringEnabled] = useState(true);
  const [focusedBhsId, setFocusedBhsId] = useState(null);
  const [inspectedHotspot, setInspectedHotspot] = useState(null);
  const [mapTarget, setMapTarget] = useState(BARANGAY_VIEWPORTS['All Butuan City']);

  // --- EPIDEMIOLOGICAL & TIME-RANGE FILTERS ---
  const [filterBarangay, setFilterBarangay] = useState('All Butuan City');
  const [filterSection, setFilterSection] = useState('All FHSIS Sections');
  const [filterTimeframe, setFilterTimeframe] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('2026-11-01');
  const [customEndDate, setCustomEndDate] = useState('2026-11-30');

  // --- REGISTRY STATES ---
  const [registrySearch, setRegistrySearch] = useState('');
  const [registryBarangay, setRegistryBarangay] = useState('All Butuan City');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // --- LIVE SYNCHRONIZED RECORDS (BHW + Baseline) ---
  const [allRecords, setAllRecords] = useState([]);
  const [bhwSyncedCount, setBhwSyncedCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date().toLocaleTimeString());

  // --- FHSIS REPORT TAB STATES ---
  const now = new Date();
  const [exportScope, setExportScope] = useState('All Butuan City');
  const [reportPeriodType, setReportPeriodType] = useState('Monthly');
  const [exportMonth, setExportMonth] = useState(now.getMonth() + 1);
  const [exportQuarter, setExportQuarter] = useState(`Q${Math.floor(now.getMonth() / 3) + 1}`);
  const [exportYear, setExportYear] = useState(String(now.getFullYear()));
  const [projectedPopulation, setProjectedPopulation] = useState('377,852');
  const [preparedBy, setPreparedBy] = useState('CHO FHSIS Coordinator');
  const [approvedBy, setApprovedBy] = useState('City Health Officer, Butuan City');
  const [datePrepared, setDatePrepared] = useState(now.toISOString().split('T')[0]);
  const [exportHistory, setExportHistory] = useState([
    {
      id: 'EXP-1',
      title: 'FHSIS Form M1 Consolidated Summary (PDF)',
      coverage: 'October 2026 | All Butuan City',
      exportedAt: 'Nov 1, 2026, 08:30 AM',
      format: 'PDF',
    },
    {
      id: 'EXP-2',
      title: 'FHSIS Quarterly Accomplishment (CSV)',
      coverage: 'Q3 (Jul–Sep) 2026 | Barangay Ampayon',
      exportedAt: 'Oct 5, 2026, 09:15 AM',
      format: 'CSV',
    },
  ]);

  const barangayPopMap = useMemo(
    () => Object.fromEntries(BARANGAY_HEALTH_CENTERS.map((b) => [b.barangay, b.population])),
    []
  );

  // --- LOAD & MERGE LIVE BHW PORTAL DATA FROM LOCALSTORAGE ---
  const loadAlignedRecords = useCallback(() => {
    const bhwVisits = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('idg4health_visits_')) {
          const parsed = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(parsed)) {
            parsed.forEach((v) => {
              const brgy = v.barangay || extractBarangayFromAddress(v.patientSnapshot?.address || '');
              const fallbackBhs =
                BARANGAY_HEALTH_CENTERS.find((b) => b.barangay === brgy) || BARANGAY_HEALTH_CENTERS[0];
              bhwVisits.push({
                ...v,
                barangay: brgy,
                latitude: v.latitude || String(fallbackBhs.lat),
                longitude: v.longitude || String(fallbackBhs.lng),
                source: 'Live BHW Portal',
              });
            });
          }
        }
      }
    } catch (_) {}

    const mergedMap = new Map();
    BASELINE_CITY_RECORDS.forEach((r) => mergedMap.set(r.visitId, r));
    bhwVisits.forEach((r) => mergedMap.set(r.visitId, r));

    const mergedList = Array.from(mergedMap.values()).sort((a, b) =>
      (b.visitDate || '') > (a.visitDate || '') ? 1 : -1
    );

    setAllRecords(mergedList);
    setBhwSyncedCount(bhwVisits.length);
    setLastSyncedAt(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    loadAlignedRecords();
    const handleStorage = () => loadAlignedRecords();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadAlignedRecords]);

  useEffect(() => {
    if (exportScope === 'All Butuan City') {
      setProjectedPopulation('377,852');
    } else {
      const bhs = BARANGAY_HEALTH_CENTERS.find((b) => b.barangay === exportScope);
      if (bhs) setProjectedPopulation(bhs.population.toLocaleString());
    }
  }, [exportScope]);

  // --- TIME-RANGE FILTER & 7-DAY TREND CALCULATION ---
  const matchesTimeframe = useCallback(
    (visitDate) => {
      if (filterTimeframe === 'All Time' || !visitDate) return true;
      const diff = daysAgoFromToday(visitDate);
      if (filterTimeframe === 'Last 7 Days') return diff >= -1 && diff <= 7;
      if (filterTimeframe === 'Last 14 Days') return diff >= -1 && diff <= 14;
      if (filterTimeframe === 'Last 30 Days') return diff >= -1 && diff <= 30;
      if (filterTimeframe === 'Custom Range') {
        return (!customStartDate || visitDate >= customStartDate) && (!customEndDate || visitDate <= customEndDate);
      }
      return true;
    },
    [filterTimeframe, customStartDate, customEndDate]
  );

  const filteredCases = useMemo(() => {
    return allRecords.filter((rec) => {
      const matchBrgy = filterBarangay === 'All Butuan City' || rec.barangay === filterBarangay;
      const matchSec = filterSection === 'All FHSIS Sections' || rec.fhsisSection === filterSection;
      const matchTime = matchesTimeframe(rec.visitDate);
      return matchBrgy && matchSec && matchTime;
    });
  }, [allRecords, filterBarangay, filterSection, matchesTimeframe]);

  const trendStats = useMemo(() => {
    const scoped = allRecords.filter((rec) => {
      const matchBrgy = filterBarangay === 'All Butuan City' || rec.barangay === filterBarangay;
      const matchSec = filterSection === 'All FHSIS Sections' || rec.fhsisSection === filterSection;
      return matchBrgy && matchSec;
    });
    const recent7 = scoped.filter((r) => {
      const d = daysAgoFromToday(r.visitDate);
      return d >= 0 && d <= 7;
    }).length;
    const prev7 = scoped.filter((r) => {
      const d = daysAgoFromToday(r.visitDate);
      return d > 7 && d <= 14;
    }).length;

    const deltaPct = prev7 === 0 ? (recent7 > 0 ? 100 : 0) : Math.round(((recent7 - prev7) / prev7) * 100);
    return { recent7, prev7, deltaPct };
  }, [allRecords, filterBarangay, filterSection]);

  const enrichedHealthCenters = useMemo(() => {
    return BARANGAY_HEALTH_CENTERS.filter(
      (bhs) => filterBarangay === 'All Butuan City' || bhs.barangay === filterBarangay
    ).map((bhs) => {
      const brgyCases = filteredCases.filter((c) => c.barangay === bhs.barangay);
      const recent7DayCases = brgyCases.filter((c) => {
        const d = daysAgoFromToday(c.visitDate);
        return d >= 0 && d <= 7;
      }).length;
      const casesInRadius = filteredCases.filter((c) => {
        const lat = parseFloat(c.latitude);
        const lng = parseFloat(c.longitude);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
        return haversineKm(bhs.lat, bhs.lng, lat, lng) <= bufferKm;
      }).length;
      const dengue = brgyCases.filter((c) => (c.serviceSubtype || '').includes('Dengue')).length;
      const maternal = brgyCases.filter((c) => c.fhsisSection === 'Section B: Maternal Care' || c.isPregnant).length;
      const attackRate = ((brgyCases.length / bhs.population) * 10000).toFixed(1);

      return {
        ...bhs,
        totalCases: brgyCases.length,
        recent7DayCases,
        casesInRadius,
        dengue,
        maternal,
        attackRate,
      };
    });
  }, [filterBarangay, filteredCases, bufferKm]);

  const bufferCoverageStats = useMemo(() => {
    let inside = 0;
    let outside = 0;
    filteredCases.forEach((rec) => {
      const lat = parseFloat(rec.latitude);
      const lng = parseFloat(rec.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return;
      const nearestDist = Math.min(
        ...BARANGAY_HEALTH_CENTERS.map((b) => haversineKm(lat, lng, b.lat, b.lng))
      );
      if (nearestDist <= bufferKm) inside += 1;
      else outside += 1;
    });
    return { inside, outside };
  }, [filteredCases, bufferKm]);

  const focusedBhs = useMemo(
    () => enrichedHealthCenters.find((b) => b.id === focusedBhsId) || null,
    [enrichedHealthCenters, focusedBhsId]
  );

  // --- HOTSPOT-TO-PIN INSPECTION HANDLER ---
  const handleInspectHotspot = (record) => {
    const lat = parseFloat(record.latitude);
    const lng = parseFloat(record.longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    let nearestBhs = BARANGAY_HEALTH_CENTERS[0];
    let minDist = Infinity;
    BARANGAY_HEALTH_CENTERS.forEach((bhs) => {
      const d = haversineKm(lat, lng, bhs.lat, bhs.lng);
      if (d < minDist) {
        minDist = d;
        nearestBhs = bhs;
      }
    });

    const nearbyCases = filteredCases.filter((c) => {
      const cLat = parseFloat(c.latitude);
      const cLng = parseFloat(c.longitude);
      if (Number.isNaN(cLat) || Number.isNaN(cLng)) return false;
      return haversineKm(lat, lng, cLat, cLng) <= 0.8;
    }).length;

    const brgyPop = barangayPopMap[record.barangay] || 15000;
    const brgyCases = filteredCases.filter((c) => c.barangay === record.barangay).length;
    const attackRate = ((brgyCases / brgyPop) * 10000).toFixed(1);

    setInspectedHotspot({
      record,
      nearestBhs,
      distanceKm: minDist.toFixed(2),
      isOutsideBuffer: minDist > bufferKm,
      nearbyCases,
      attackRate,
    });
  };

  const handleFocusBhs = (bhs) => {
    setFocusedBhsId(bhs.id);
    setShowHealthPins(true);
    setMapTarget({ center: [bhs.lat, bhs.lng], zoom: 14 });
  };

  const handleClearFocus = () => {
    setFocusedBhsId(null);
    setInspectedHotspot(null);
  };

  const handleBarangayDropdownChange = (brgy) => {
    setFilterBarangay(brgy);
    setMapTarget(BARANGAY_VIEWPORTS[brgy] || BARANGAY_VIEWPORTS['All Butuan City']);
    if (brgy === 'All Butuan City') {
      setFocusedBhsId(null);
    } else {
      const matched = BARANGAY_HEALTH_CENTERS.find((b) => b.barangay === brgy);
      if (matched) setFocusedBhsId(matched.id);
    }
  };

  // --- DYNAMIC KPI CALCULATIONS ---
  const kpiStats = useMemo(() => {
    const totalCases = allRecords.length;
    const dengueAlerts = allRecords.filter((r) => (r.serviceSubtype || '').includes('Dengue')).length;
    const maternalVisits = allRecords.filter(
      (r) => r.fhsisSection === 'Section B: Maternal Care' || r.isPregnant
    ).length;

    const brgyCounts = {};
    allRecords.forEach((r) => {
      brgyCounts[r.barangay] = (brgyCounts[r.barangay] || 0) + 1;
    });
    const topBrgyEntry = Object.entries(brgyCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalCases,
      dengueAlerts,
      maternalVisits,
      topBarangay: topBrgyEntry ? `Brgy. ${topBrgyEntry[0]} (${topBrgyEntry[1]})` : 'No data',
    };
  }, [allRecords]);

  // --- REGISTRY & FHSIS REPORT AGGREGATION ---
  const filteredRegistry = useMemo(() => {
    const q = registrySearch.toLowerCase();
    return allRecords.filter((r) => {
      const matchBrgy = registryBarangay === 'All Butuan City' || r.barangay === registryBarangay;
      const matchQuery =
        !q ||
        (r.visitId || '').toLowerCase().includes(q) ||
        (r.patientId || '').toLowerCase().includes(q) ||
        (r.patientSnapshot?.name || '').toLowerCase().includes(q) ||
        (r.barangay || '').toLowerCase().includes(q) ||
        (r.serviceSubtype || '').toLowerCase().includes(q);
      return matchBrgy && matchQuery;
    });
  }, [allRecords, registrySearch, registryBarangay]);

  const filteredReportRecords = useMemo(() => {
    return allRecords.filter((r) => {
      const matchScope = exportScope === 'All Butuan City' || r.barangay === exportScope;
      if (!matchScope || !r.visitDate) return false;
      const [y, m] = r.visitDate.split('-').map(Number);
      if (String(y) !== String(exportYear)) return false;
      if (reportPeriodType === 'Annual') return true;
      if (reportPeriodType === 'Monthly') return m === Number(exportMonth);
      const qObj = QUARTERS.find((q) => q.id === exportQuarter);
      return qObj ? qObj.months.includes(m) : false;
    });
  }, [allRecords, exportScope, reportPeriodType, exportMonth, exportQuarter, exportYear]);

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
      secA: { newAcceptors: makeWRA(), currentUsers: makeWRA(), dropOuts: makeWRA() },
      secB: {
        ancVisits: makeWRA(),
        completed8ANC: makeWRA(),
        bpMeasured: makeWRA(),
        highBpDanger: makeWRA(),
        fbdDeliveries: makeWRA(),
        pncVisits: makeWRA(),
      },
      secC: {
        bcgHepB: makeSex(),
        pentaOpvPcv: makeSex(),
        mmrFic: makeSex(),
        vitA: makeSex(),
        acuteDiarrhea: makeSex(),
        pneumonia: makeSex(),
      },
      secD: { firstVisit: makeSex(), twoVisits: makeSex() },
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
      ? `${MONTHS[exportMonth - 1]} ${exportYear}`
      : reportPeriodType === 'Quarterly'
      ? `${QUARTERS.find((q) => q.id === exportQuarter)?.label} ${exportYear}`
      : `Full Year ${exportYear}`;

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

  const handleExportRegistryCsv = () => {
    const rows = [
      ['Visit ID', 'Patient ID', 'Patient Name', 'Age', 'Sex', 'Barangay', 'Visit Date', 'Nature of Visit', 'FHSIS Section', 'Indicator / Case', 'BP', 'Temp', 'Action Taken', 'Outcome', 'Source'],
      ...filteredRegistry.map((r) => [
        r.visitId, r.patientId, r.patientSnapshot?.name, r.patientSnapshot?.age, r.patientSnapshot?.sex,
        r.barangay, r.visitDate, r.natureOfVisit, r.fhsisSection, r.serviceSubtype,
        r.bloodPressure, r.temperature, r.actionTaken, r.outcome, r.source,
      ]),
    ];
    triggerCsvDownload(rows, `CHO_City_Registry_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportFHSISCsv = () => {
    const rows = [
      [`CITY HEALTH OFFICE — FHSIS ${reportPeriodType.toUpperCase()} REPORT`],
      ['Geographic Scope', exportScope, 'City / Province', 'Butuan City, Agusan del Norte'],
      ['Reporting Period', reportPeriodLabel, 'Projected Population', projectedPopulation],
      ['Prepared By', preparedBy, 'Approved By', approvedBy],
      ['Date Prepared', datePrepared, 'Included Records', filteredReportRecords.length],
      [],
      ['SECTION A. FAMILY PLANNING (WRA)', '10-14', '15-19', '20-49', 'TOTAL'],
      ['New Acceptors', fhsisSummary.secA.newAcceptors['10-14'], fhsisSummary.secA.newAcceptors['15-19'], fhsisSummary.secA.newAcceptors['20-49'], fhsisSummary.secA.newAcceptors.total],
      ['Current Users', fhsisSummary.secA.currentUsers['10-14'], fhsisSummary.secA.currentUsers['15-19'], fhsisSummary.secA.currentUsers['20-49'], fhsisSummary.secA.currentUsers.total],
      ['Drop-outs', fhsisSummary.secA.dropOuts['10-14'], fhsisSummary.secA.dropOuts['15-19'], fhsisSummary.secA.dropOuts['20-49'], fhsisSummary.secA.dropOuts.total],
      [],
      ['SECTION B. MATERNAL CARE', '10-14', '15-19', '20-49', 'TOTAL'],
      ['Prenatal Care (ANC Visits)', fhsisSummary.secB.ancVisits['10-14'], fhsisSummary.secB.ancVisits['15-19'], fhsisSummary.secB.ancVisits['20-49'], fhsisSummary.secB.ancVisits.total],
      ['Completed 8ANC & Tracked', fhsisSummary.secB.completed8ANC['10-14'], fhsisSummary.secB.completed8ANC['15-19'], fhsisSummary.secB.completed8ANC['20-49'], fhsisSummary.secB.completed8ANC.total],
      ['Pregnant Women w/ BP Measured', fhsisSummary.secB.bpMeasured['10-14'], fhsisSummary.secB.bpMeasured['15-19'], fhsisSummary.secB.bpMeasured['20-49'], fhsisSummary.secB.bpMeasured.total],
      ['High BP / Danger Signs', fhsisSummary.secB.highBpDanger['10-14'], fhsisSummary.secB.highBpDanger['15-19'], fhsisSummary.secB.highBpDanger['20-49'], fhsisSummary.secB.highBpDanger.total],
      ['Facility-Based Deliveries (FBD)', fhsisSummary.secB.fbdDeliveries['10-14'], fhsisSummary.secB.fbdDeliveries['15-19'], fhsisSummary.secB.fbdDeliveries['20-49'], fhsisSummary.secB.fbdDeliveries.total],
      ['Postpartum Care (4PNC)', fhsisSummary.secB.pncVisits['10-14'], fhsisSummary.secB.pncVisits['15-19'], fhsisSummary.secB.pncVisits['20-49'], fhsisSummary.secB.pncVisits.total],
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
      ['Overweight / Obese (BMI)', fhsisSummary.secE.overweightObese.M, fhsisSummary.secE.overweightObese.F, fhsisSummary.secE.overweightObese.total],
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
      ['LGU DATA BANKING — CONSULTATIONS & REFERRALS', 'Total Male', 'Total Female', 'GRAND TOTAL'],
      ['New Consultations', fhsisSummary.lguConsults.newConsultation.totalM, fhsisSummary.lguConsults.newConsultation.totalF, fhsisSummary.lguConsults.newConsultation.total],
      ['Follow-up Visits', fhsisSummary.lguConsults.followUp.totalM, fhsisSummary.lguConsults.followUp.totalF, fhsisSummary.lguConsults.followUp.total],
      ['Teleconsultations', fhsisSummary.lguConsults.teleconsultation.totalM, fhsisSummary.lguConsults.teleconsultation.totalF, fhsisSummary.lguConsults.teleconsultation.total],
      ['Referrals (BHS to RHU)', fhsisSummary.lguConsults.bhsToRhuReferral.totalM, fhsisSummary.lguConsults.bhsToRhuReferral.totalF, fhsisSummary.lguConsults.bhsToRhuReferral.total],
    ];

    const scopeSlug = exportScope.replace(/\s+/g, '_');
    triggerCsvDownload(rows, `CHO_FHSIS_${reportPeriodType}_${scopeSlug}_${exportYear}.csv`);
    setExportHistory((prev) => [
      {
        id: `EXP-${Date.now()}`,
        title: `FHSIS ${reportPeriodType} Consolidated Report (CSV)`,
        coverage: `${reportPeriodLabel} | ${exportScope}`,
        exportedAt: new Date().toLocaleString(),
        format: 'CSV',
      },
      ...prev,
    ]);
  };

  const handlePrintFHSIS = () => {
    setExportHistory((prev) => [
      {
        id: `EXP-${Date.now()}`,
        title: `FHSIS ${reportPeriodType} Official Report (PDF)`,
        coverage: `${reportPeriodLabel} | ${exportScope}`,
        exportedAt: new Date().toLocaleString(),
        format: 'PDF',
      },
      ...prev,
    ]);
    window.print();
  };

  const activeBasemap = BASEMAP_STYLES[baseMapStyle] || BASEMAP_STYLES.light;

  return (
    <div className="flex min-h-[calc(100vh-57px)] bg-slate-50 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-lg z-20 shrink-0 print:hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">IDG4Health</h2>
          <p className="text-xs text-slate-400 mt-1">City Health Office Portal</p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          <button
            onClick={() => setActiveMenu('spatial')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              activeMenu === 'spatial' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MapIcon className="w-5 h-5" /> Spatial Surveillance
          </button>
          <button
            onClick={() => setActiveMenu('registry')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              activeMenu === 'registry' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" /> City-Wide Registry
          </button>
          <button
            onClick={() => setActiveMenu('reports')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
              activeMenu === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" /> FHSIS Reports (M1/Q)
          </button>
        </nav>

        {/* Live BHW Alignment Status */}
        <div className="p-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>BHW Synced Visits:</span>
            <span className="font-bold text-emerald-400">{bhwSyncedCount} live</span>
          </div>
          <button
            onClick={loadAlignedRecords}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync BHW Records
          </button>
          <p className="text-[10px] text-slate-500 text-center">Last synced: {lastSyncedAt}</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden print:h-auto print:overflow-visible">
        {/* TOP KPI & HEADER BAR */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm z-10 print:hidden">
          <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {activeMenu === 'spatial' && 'Epidemiological Spatial Surveillance'}
                {activeMenu === 'registry' && 'Master City-Wide Patient Visit Registry'}
                {activeMenu === 'reports' && 'Consolidated FHSIS Report Generation'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {activeMenu === 'spatial' && 'Independent GIS layers for disease density, attack-rate risk, and health center service buffers.'}
                {activeMenu === 'registry' && 'Unified view of BHW-encoded and CHO-validated consultation records across all health stations.'}
                {activeMenu === 'reports' && 'Aligned with BHW Form M1 (CHD.PDMD.F.001.REV00) for Monthly, Quarterly, and Annual DOH reporting.'}
              </p>
            </div>
            {activeMenu !== 'reports' && (
              <button
                onClick={handleExportRegistryCsv}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition"
              >
                <Download className="w-4 h-4" /> Export Registry CSV
              </button>
            )}
          </div>

          {activeMenu !== 'reports' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-semibold text-blue-800 uppercase">Total Aligned Cases</p>
                  <p className="text-xl font-bold text-blue-900">{kpiStats.totalCases}</p>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-semibold text-rose-800 uppercase">Active Dengue Cases</p>
                  <p className="text-xl font-bold text-rose-900">{kpiStats.dengueAlerts}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-semibold text-amber-800 uppercase">Top Morbidity Area</p>
                  <p className="text-base font-bold text-amber-900 truncate">{kpiStats.topBarangay}</p>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Baby className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs font-semibold text-emerald-800 uppercase">Maternal Care Visits</p>
                  <p className="text-xl font-bold text-emerald-900">{kpiStats.maternalVisits}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            1. SPATIAL SURVEILLANCE DASHBOARD
           ============================================================ */}
        {activeMenu === 'spatial' && (
          <div className="flex-1 flex overflow-hidden">
            {/* LEFT GIS CONTROL PANEL */}
            <div className="w-80 bg-white border-r border-slate-200 p-4 overflow-y-auto z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)] shrink-0 space-y-5">
              {/* INDEPENDENT LAYER TOGGLES */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" /> Map Layer Toggles
                </h3>
                <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-700 py-1">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showHeatMap}
                        onChange={(e) => setShowHeatMap(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <Flame className="w-3.5 h-3.5 text-rose-500" />
                      Disease Heat Map
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{filteredCases.length}</span>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer text-xs font-semibold text-slate-700 py-1">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showHealthPins}
                        onChange={(e) => setShowHealthPins(e.target.checked)}
                        className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                      />
                      <Building2 className="w-3.5 h-3.5 text-pink-600" />
                      Health Center Pins
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{enrichedHealthCenters.length} BHS</span>
                  </label>
                </div>
              </div>

              {/* HEAT MAP MODE & CONTRAST CONTROLS */}
              {showHeatMap && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-rose-600" /> Heat Map Analytics
                  </h3>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Intensity Layer Mode</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => setHeatMode('weighted')}
                        className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition ${
                          heatMode === 'weighted' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Weighted Density
                      </button>
                      <button
                        onClick={() => setHeatMode('attackRate')}
                        className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition ${
                          heatMode === 'attackRate' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Attack Rate (/10k)
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {heatMode === 'weighted'
                        ? 'Weights severe/notifiable cases (e.g., Dengue) higher to flag outbreak clusters.'
                        : 'Normalizes cases against barangay population to expose high proportional risk.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                        <span>Opacity</span>
                        <span>{Math.round(heatOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.25"
                        max="0.95"
                        step="0.05"
                        value={heatOpacity}
                        onChange={(e) => setHeatOpacity(parseFloat(e.target.value))}
                        className="w-full accent-rose-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
                        <span>Intensity</span>
                        <span>{heatIntensity.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.8"
                        step="0.1"
                        value={heatIntensity}
                        onChange={(e) => setHeatIntensity(parseFloat(e.target.value))}
                        className="w-full accent-rose-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={zoomAdaptive}
                        onChange={(e) => setZoomAdaptive(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600"
                      />
                      <span className="font-medium">Zoom-Adaptive Radius & Intensity</span>
                    </label>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Base Map Contrast</label>
                      <select
                        value={baseMapStyle}
                        onChange={(e) => setBaseMapStyle(e.target.value)}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                      >
                        {Object.entries(BASEMAP_STYLES).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* SERVICE BUFFERS & SMART CLUSTERING */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair className="w-4 h-4 text-pink-600" /> Proximity & Pin Controls
                </h3>

                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span className="font-medium">Show All Coverage Rings</span>
                  <input
                    type="checkbox"
                    checked={showAllBuffers}
                    onChange={(e) => setShowAllBuffers(e.target.checked)}
                    className="w-4 h-4 rounded text-pink-600"
                  />
                </label>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                    <span>Service Buffer Radius</span>
                    <span className="text-pink-700">{bufferKm} km</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                    {[1, 2, 3].map((km) => (
                      <button
                        key={km}
                        onClick={() => setBufferKm(km)}
                        className={`py-1 text-xs font-semibold rounded transition ${
                          bufferKm === km ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {km} km
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200">
                    <span className="text-emerald-700 font-semibold">Inside {bufferKm}km: {bufferCoverageStats.inside}</span>
                    <span className={`font-semibold ${bufferCoverageStats.outside > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      Outside Gap: {bufferCoverageStats.outside}
                    </span>
                  </div>
                </div>

                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span className="font-medium">Smart Pin Clustering (City Zoom)</span>
                  <input
                    type="checkbox"
                    checked={clusteringEnabled}
                    onChange={(e) => setClusteringEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                </label>
              </div>

              {/* TIME-RANGE & TREND CONTROLS + FILTERS */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-4 h-4 text-blue-600" /> Time & Disease Filters
                  </h3>
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      trendStats.deltaPct > 0
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                    title={`Last 7 days: ${trendStats.recent7} vs Prior 7 days: ${trendStats.prev7}`}
                  >
                    {trendStats.deltaPct > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {trendStats.deltaPct > 0 ? `+${trendStats.deltaPct}%` : `${trendStats.deltaPct}%`} (7d)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Time Range</label>
                  <select
                    value={filterTimeframe}
                    onChange={(e) => setFilterTimeframe(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="All Time">All Recorded Cases</option>
                    <option value="Last 7 Days">Last 7 Days ({trendStats.recent7} cases)</option>
                    <option value="Last 14 Days">Last 14 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Custom Range">Custom Date Range</option>
                  </select>
                </div>

                {filterTimeframe === 'Custom Range' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="text-[11px] p-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="text-[11px] p-1.5 border border-slate-200 rounded-lg bg-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Geographic Focus</label>
                  <select
                    value={filterBarangay}
                    onChange={(e) => handleBarangayDropdownChange(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="All Butuan City">All Butuan City</option>
                    {BARANGAY_HEALTH_CENTERS.map((bhs) => (
                      <option key={bhs.id} value={bhs.barangay}>Barangay {bhs.barangay}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">FHSIS Program Section</label>
                  <select
                    value={filterSection}
                    onChange={(e) => setFilterSection(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="All FHSIS Sections">All FHSIS Sections</option>
                    {FHSIS_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* INTERACTIVE LEAFLET MAP CANVAS */}
            <div className={`flex-1 relative z-0 ${activeBasemap.themeClass}`}>
              <style>{`
                .map-theme-light .leaflet-tile-pane {
                  filter: grayscale(85%) brightness(1.06) contrast(0.92);
                }
                .map-theme-dark .leaflet-tile-pane {
                  filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(92%);
                }
              `}</style>

              {/* Top Floating Facility Focus Banner */}
              {focusedBhs && (
                <div className="absolute top-4 left-14 z-[450] bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-pink-400 font-bold block">
                      Health Center Focus ({bufferKm} km Buffer)
                    </span>
                    <span className="font-semibold">
                      {focusedBhs.bhsName} — {focusedBhs.totalCases} active cases ({focusedBhs.recent7DayCases} in last 7d)
                    </span>
                  </div>
                  <button
                    onClick={handleClearFocus}
                    className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Focus
                  </button>
                </div>
              )}

              {/* Floating Hotspot-to-Pin Inspection Card */}
              {inspectedHotspot && (
                <div className="absolute top-4 right-4 z-[450] bg-white/95 backdrop-blur p-4 rounded-xl shadow-xl border border-slate-200 w-72 text-xs space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold uppercase">
                        <Flame className="w-3 h-3" /> Hotspot-to-Pin Inspection
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">
                        {inspectedHotspot.record.serviceSubtype}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Brgy. {inspectedHotspot.record.barangay} • {inspectedHotspot.record.visitDate}
                      </p>
                    </div>
                    <button
                      onClick={() => setInspectedHotspot(null)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Local Cluster (800m)</span>
                      <strong className="text-slate-800">{inspectedHotspot.nearbyCases} cases</strong>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">Brgy Attack Rate</span>
                      <strong className="text-rose-700">{inspectedHotspot.attackRate} / 10k</strong>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                      inspectedHotspot.isOutsideBuffer
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1">
                        {inspectedHotspot.isOutsideBuffer ? (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        Nearest BHS: {inspectedHotspot.nearestBhs.barangay}
                      </span>
                      <span>{inspectedHotspot.distanceKm} km</span>
                    </div>
                    <p className="text-[10px]">
                      {inspectedHotspot.isOutsideBuffer
                        ? `Outside ${bufferKm} km service buffer — potential geographic access gap.`
                        : `Within ${bufferKm} km service radius of ${inspectedHotspot.nearestBhs.bhsName}.`}
                    </p>
                  </div>

                  <button
                    onClick={() => handleFocusBhs(inspectedHotspot.nearestBhs)}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Inspect Nearest Health Center
                  </button>
                </div>
              )}

              <MapContainer
                center={BARANGAY_VIEWPORTS['All Butuan City'].center}
                zoom={BARANGAY_VIEWPORTS['All Butuan City'].zoom}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  key={baseMapStyle}
                  url={activeBasemap.url}
                  attribution={activeBasemap.attribution}
                />
                <MapCameraController target={mapTarget} />

                {/* COVERAGE RINGS / SERVICE BUFFERS (1–3 km) */}
                {enrichedHealthCenters.map((bhs) => {
                  const shouldShowRing = showAllBuffers || focusedBhsId === bhs.id;
                  if (!shouldShowRing) return null;
                  return (
                    <Circle
                      key={`buffer-${bhs.id}`}
                      center={[bhs.lat, bhs.lng]}
                      radius={bufferKm * 1000}
                      interactive={false}
                      pathOptions={{
                        color: focusedBhsId === bhs.id ? '#ec0075' : '#0284c7',
                        weight: focusedBhsId === bhs.id ? 2.5 : 1.5,
                        dashArray: '6 5',
                        fillColor: focusedBhsId === bhs.id ? '#ec0075' : '#38bdf8',
                        fillOpacity: focusedBhsId === bhs.id ? 0.10 : 0.06,
                      }}
                    />
                  );
                })}

                {/* DISEASE HEAT MAP + CLICKABLE HOTSPOT-TO-PIN HIT ZONES */}
                {showHeatMap && (
                  <>
                    <ThermalHeatmapLayer
                      cases={filteredCases}
                      heatMode={heatMode}
                      opacity={heatOpacity}
                      intensityScale={heatIntensity}
                      zoomAdaptive={zoomAdaptive}
                      barangayPopMap={barangayPopMap}
                    />

                    {filteredCases.map((record) => {
                      const lat = parseFloat(record.latitude);
                      const lng = parseFloat(record.longitude);
                      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
                      return (
                        <CircleMarker
                          key={`hotspot-hit-${record.visitId}`}
                          center={[lat, lng]}
                          radius={15}
                          pathOptions={{
                            color: 'transparent',
                            fillColor: 'transparent',
                            fillOpacity: 0,
                            opacity: 0,
                            weight: 0,
                          }}
                          eventHandlers={{
                            click: () => handleInspectHotspot(record),
                          }}
                        >
                          <Tooltip direction="top" offset={[0, -6]} opacity={0.96}>
                            <div className="text-xs font-sans">
                              <strong className="text-slate-900">{record.serviceSubtype}</strong>
                              <div className="text-slate-600">Brgy. {record.barangay} • {record.visitDate}</div>
                              <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                                Click hotspot to inspect nearest Health Center
                              </div>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      );
                    })}
                  </>
                )}

                {/* HEALTH CENTER PINS (With Smart Clustering & Click-to-Inspect Pop-ups) */}
                {showHealthPins && (
                  <SmartPinClusterLayer
                    healthCenters={enrichedHealthCenters}
                    clusteringEnabled={clusteringEnabled}
                    focusedBhsId={focusedBhsId}
                    bufferKm={bufferKm}
                    showAllBuffers={showAllBuffers}
                    onSelectBhs={(bhs) => {
                      setFocusedBhsId(bhs.id);
                      setInspectedHotspot(null);
                    }}
                    onToggleRingForBhs={(id) => {
                      setFocusedBhsId((prev) => (prev === id ? null : id));
                    }}
                  />
                )}
              </MapContainer>

              {/* ADAPTIVE MAP LEGEND */}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur px-4 py-3.5 rounded-xl shadow-lg border border-slate-200 z-[400] pointer-events-none w-72">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
                  Surveillance Legend
                </h3>

                {showHeatMap && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                      <span>
                        {heatMode === 'weighted'
                          ? 'Weighted Case Density'
                          : 'Normalized Attack Rate'}
                      </span>
                      <span className="text-[10px] font-normal text-slate-500">
                        {heatMode === 'weighted' ? 'Severity-weighted' : 'Per 10,000 pop.'}
                      </span>
                    </div>

                    <div>
                      <div
                        className="h-3 w-full rounded-full border border-slate-200 shadow-inner"
                        style={{
                          background:
                            'linear-gradient(to right, #3b82f6 0%, #22c55e 30%, #facc15 56%, #f97316 78%, #ef4444 100%)',
                        }}
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-slate-500 mt-1">
                        <span>Low</span>
                        <span>Moderate</span>
                        <span>Elevated</span>
                        <span>High</span>
                        <span className="text-rose-600">Critical</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                        Critical Outbreak Cluster
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                        High Risk Density
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
                        Elevated Cases
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
                        Moderate Activity
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                        Low Density / Isolated Case Zone
                      </div>
                    </div>
                  </div>
                )}

                {(showHealthPins || showAllBuffers || focusedBhsId) && (
                  <div className={`${showHeatMap ? 'pt-2 border-t border-slate-200' : ''} space-y-1.5 text-[11px] text-slate-600`}>
                    {showHealthPins && (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#ec0075] text-white text-[10px] font-bold">
                            +
                          </span>
                          Barangay Health Center (Click to Inspect)
                        </div>
                        {clusteringEnabled && (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#ec0075] ring-2 ring-pink-200 text-white text-[9px] font-bold">
                              3
                            </span>
                            Clustered Health Centers (Click to Expand)
                          </div>
                        )}
                      </>
                    )}
                    {(showAllBuffers || focusedBhsId) && (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-dashed border-pink-600 bg-pink-100/50 inline-block" />
                        {bufferKm} km Service Buffer Ring
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
                  <span>{filteredCases.length} cases plotted</span>
                  <span>{bufferCoverageStats.outside} outside {bufferKm}km ring</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            2. CITY-WIDE REGISTRY TABLE
           ============================================================ */}
        {activeMenu === 'registry' && (
          <div className="flex-1 p-6 md:p-8 overflow-auto bg-slate-50">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    placeholder="Search patient, Unique ID, barangay, or FHSIS case..."
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={registryBarangay}
                    onChange={(e) => setRegistryBarangay(e.target.value)}
                    className="text-sm px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="All Butuan City">All Barangays</option>
                    {BARANGAY_HEALTH_CENTERS.map((b) => (
                      <option key={b.id} value={b.barangay}>Barangay {b.barangay}</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    {filteredRegistry.length} records
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Visit / Patient ID</th>
                      <th className="p-4 font-semibold">Visit Date & Type</th>
                      <th className="p-4 font-semibold">Patient Profile</th>
                      <th className="p-4 font-semibold">Barangay BHS</th>
                      <th className="p-4 font-semibold">FHSIS Classification</th>
                      <th className="p-4 font-semibold">Source / Status</th>
                      <th className="p-4 font-semibold text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredRegistry.map((record) => (
                      <tr key={record.visitId} className="hover:bg-slate-50 transition">
                        <td className="p-4">
                          <div className="font-mono text-xs font-bold text-blue-600">{record.visitId}</div>
                          <div className="font-mono text-[11px] text-slate-400">{record.patientId}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{record.visitDate}</div>
                          <span className="text-[11px] text-slate-500">{record.natureOfVisit}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{record.patientSnapshot?.name}</div>
                          <div className="text-xs text-slate-500">
                            {record.patientSnapshot?.age} yrs • {record.patientSnapshot?.sex}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-pink-600" /> {record.barangay}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800 text-xs">{record.serviceSubtype}</div>
                          <div className="text-[11px] text-slate-500">{record.fhsisSection}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              record.source === 'Live BHW Portal'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" /> {record.source}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredRegistry.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-500 text-sm">
                          No matching records found.
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
            3. ALIGNED FHSIS REPORTS (Monthly M1 / Quarterly / Annual)
           ============================================================ */}
        {activeMenu === 'reports' && (
          <div className="flex-1 p-6 md:p-8 overflow-auto bg-slate-50 print:p-0 print:bg-white">
            <div className="max-w-6xl mx-auto space-y-6 pb-12">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
                <div className="p-5 border-b border-slate-200 bg-white flex flex-wrap justify-between items-center gap-3">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-600" /> Configure Consolidated FHSIS Report
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Preview: <strong>{filteredReportRecords.length}</strong> aligned visits included
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Geographic Scope</label>
                      <select
                        value={exportScope}
                        onChange={(e) => setExportScope(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="All Butuan City">All Butuan City (Consolidated)</option>
                        {BARANGAY_HEALTH_CENTERS.map((bhs) => (
                          <option key={bhs.id} value={bhs.barangay}>Barangay {bhs.barangay}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reporting Period</label>
                      <select
                        value={reportPeriodType}
                        onChange={(e) => setReportPeriodType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="Monthly">Monthly (Form M1)</option>
                        <option value="Quarterly">Quarterly Summary</option>
                        <option value="Annual">Annual Consolidated</option>
                      </select>
                    </div>

                    {reportPeriodType === 'Monthly' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Month</label>
                        <select
                          value={exportMonth}
                          onChange={(e) => setExportMonth(Number(e.target.value))}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {MONTHS.map((m, idx) => (
                            <option key={m} value={idx + 1}>{m}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {reportPeriodType === 'Quarterly' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quarter</label>
                        <select
                          value={exportQuarter}
                          onChange={(e) => setExportQuarter(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {QUARTERS.map((q) => (
                            <option key={q.id} value={q.id}>{q.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Year</label>
                      <select
                        value={exportYear}
                        onChange={(e) => setExportYear(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                        <Users2 className="w-3.5 h-3.5 text-slate-400" /> Projected Population
                      </label>
                      <input
                        type="text"
                        value={projectedPopulation}
                        onChange={(e) => setProjectedPopulation(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-slate-400" /> Prepared By
                      </label>
                      <input
                        type="text"
                        value={preparedBy}
                        onChange={(e) => setPreparedBy(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Approved By</label>
                      <input
                        type="text"
                        value={approvedBy}
                        onChange={(e) => setApprovedBy(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Date Prepared
                      </label>
                      <input
                        type="date"
                        value={datePrepared}
                        onChange={(e) => setDatePrepared(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-slate-100 border-t border-slate-200 flex flex-wrap justify-end gap-3">
                  <button
                    onClick={handleExportFHSISCsv}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export to Excel (CSV)
                  </button>
                  <button
                    onClick={handlePrintFHSIS}
                    className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print / Generate Official PDF
                  </button>
                </div>
              </div>

              {/* OFFICIAL ALIGNED FHSIS REPORT PREVIEW */}
              <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                <div className="border-b-2 border-slate-800 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Republic of the Philippines • City Government of Butuan • City Health Department
                      </p>
                      <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                        CONSOLIDATED FHSIS {reportPeriodType.toUpperCase()} REPORT — {reportPeriodLabel.toUpperCase()}
                      </h2>
                    </div>
                    <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded">
                      {reportPeriodType === 'Monthly' ? 'FORM M1 — CHO' : reportPeriodType === 'Quarterly' ? `QUARTERLY (${exportQuarter})` : `ANNUAL ${exportYear}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                    <div><span className="text-slate-500 block">Geographic Scope:</span><strong className="text-slate-800">{exportScope}</strong></div>
                    <div><span className="text-slate-500 block">City / Province:</span><strong className="text-slate-800">Butuan City, Agusan del Norte</strong></div>
                    <div><span className="text-slate-500 block">Projected Population:</span><strong className="text-slate-800">{projectedPopulation}</strong></div>
                    <div><span className="text-slate-500 block">Aligned Records Tallied:</span><strong className="text-slate-800">{filteredReportRecords.length} visits</strong></div>
                  </div>
                </div>

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
                          ['New Acceptors', fhsisSummary.secA.newAcceptors],
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
                          ['High BP / Danger Signs Identified', fhsisSummary.secB.highBpDanger],
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                      Section C & D. Child Care & Oral Health
                    </h3>
                    <table className="w-full text-xs border border-slate-200 border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700">
                          <th className="p-2 border border-slate-200 text-left">Indicator</th>
                          <th className="p-2 border border-slate-200 text-center w-10">M</th>
                          <th className="p-2 border border-slate-200 text-center w-10">F</th>
                          <th className="p-2 border border-slate-200 text-center w-12 bg-slate-200">Tot</th>
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
                          ['Oral Health (1st Visit)', fhsisSummary.secD.firstVisit],
                          ['Oral Health (2 Visits)', fhsisSummary.secD.twoVisits],
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
                          <th className="p-2 border border-slate-200 text-center w-10">M</th>
                          <th className="p-2 border border-slate-200 text-center w-10">F</th>
                          <th className="p-2 border border-slate-200 text-center w-12 bg-slate-200">Tot</th>
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
                          <th className="p-2 border border-slate-200 text-center w-10">M</th>
                          <th className="p-2 border border-slate-200 text-center w-10">F</th>
                          <th className="p-2 border border-slate-200 text-center w-12 bg-slate-200">Tot</th>
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

                <div className="overflow-x-auto">
                  <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-800 text-white px-3 py-2 rounded-t">
                    LGU Data Banking — Medical Consultations & Referrals (Age & Sex)
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
                  <div>
                    <p className="text-slate-500">Prepared by:</p>
                    <p className="mt-6 font-bold text-slate-800 border-b border-slate-400 pb-1 inline-block min-w-[240px]">
                      {preparedBy}
                    </p>
                    <p className="text-slate-500 mt-1">Date Prepared: {datePrepared}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Approved by:</p>
                    <p className="mt-6 font-bold text-slate-800 border-b border-slate-400 pb-1 inline-block min-w-[240px]">
                      {approvedBy}
                    </p>
                    <p className="text-slate-500 mt-1">City Health Department — Butuan City</p>
                  </div>
                </div>
              </div>

              {/* Recent Export History */}
              <div className="pt-2 print:hidden">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Recent Export History
                </h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                        <th className="p-3.5 font-semibold">Report Generated</th>
                        <th className="p-3.5 font-semibold">Coverage</th>
                        <th className="p-3.5 font-semibold">Date Exported</th>
                        <th className="p-3.5 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {exportHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-3.5 font-medium text-slate-800 flex items-center gap-2">
                            {item.format === 'PDF' ? (
                              <FileText className="w-4 h-4 text-rose-500" />
                            ) : (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                            )}
                            {item.title}
                          </td>
                          <td className="p-3.5 text-slate-500">{item.coverage}</td>
                          <td className="p-3.5 text-slate-500">{item.exportedAt}</td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={item.format === 'PDF' ? handlePrintFHSIS : handleExportFHSISCsv}
                              className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                            >
                              <DownloadCloud className="w-3.5 h-3.5" /> Re-Export
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* VISIT RECORD DETAIL MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800">Aligned Clinical Visit Record</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedRecord.visitId} • {selectedRecord.patientId}
                </p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-slate-400 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3.5 rounded-lg border border-blue-100">
                <div><span className="text-slate-400 block">Patient Name</span><strong className="text-sm text-slate-900">{selectedRecord.patientSnapshot?.name}</strong></div>
                <div><span className="text-slate-400 block">Age / Sex</span><strong>{selectedRecord.patientSnapshot?.age} yrs / {selectedRecord.patientSnapshot?.sex}</strong></div>
                <div><span className="text-slate-400 block">Barangay</span><strong>{selectedRecord.barangay}, Butuan City</strong></div>
                <div><span className="text-slate-400 block">Visit Date / Type</span><strong>{selectedRecord.visitDate} ({selectedRecord.natureOfVisit})</strong></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200"><span className="text-slate-400 block">BP</span><strong>{selectedRecord.bloodPressure || 'N/A'}</strong></div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200"><span className="text-slate-400 block">Temp</span><strong>{selectedRecord.temperature ? `${selectedRecord.temperature}°C` : 'N/A'}</strong></div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200"><span className="text-slate-400 block">BMI</span><strong>{selectedRecord.bmi || 'N/A'}</strong></div>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">FHSIS Classification</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedRecord.serviceSubtype} ({selectedRecord.fhsisSection})</p>
              </div>

              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Chief Complaint</span>
                <p className="p-2.5 bg-slate-50 rounded border border-slate-200 mt-1">{selectedRecord.chiefComplaint || 'No notes recorded.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-slate-400 block">Action Taken</span><strong className="text-emerald-700">{selectedRecord.actionTaken || 'N/A'}</strong></div>
                <div><span className="text-slate-400 block">Geo-Coordinates</span><strong className="font-mono">{selectedRecord.latitude}, {selectedRecord.longitude}</strong></div>
              </div>
            </div>
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}