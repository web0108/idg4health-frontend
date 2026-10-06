import React, { useState } from 'react';
import { 
  Map as MapIcon, Activity, AlertTriangle, FileSpreadsheet, 
  MapPin, Layers, Filter, Calendar, Download, TrendingUp, Users, Baby, Search, CheckCircle
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function CHODashboard() {
  const [activeMenu, setActiveMenu] = useState('spatial');
  const [mapLayer, setMapLayer] = useState('pin'); 
  const [filterBarangay, setFilterBarangay] = useState('All Butuan City');
  const [filterDisease, setFilterDisease] = useState('All FHSIS Categories');
  const [filterTimeframe, setFilterTimeframe] = useState('This Month');

  // Hard-coded mock database using REAL Butuan City GPS Coordinates
  const mockChoData = [
    { id: 'CHO-001', name: 'Maria Santos', barangay: 'Tiniwisan', disease: 'Dengue Clinical Case', category: 'Disease Morbidity', date: '2026-10-06', status: 'Validated', lat: 8.9654, lng: 125.5777 },
    { id: 'CHO-002', name: 'Juan Dela Cruz', barangay: 'Ampayon', disease: 'Hypertension', category: 'Disease Morbidity', date: '2026-10-06', status: 'Validated', lat: 8.9561, lng: 125.5982 },
    { id: 'CHO-003', name: 'Ana Reyes', barangay: 'Baan 3', disease: 'Maternal Care', category: 'Maternal Care', date: '2026-10-05', status: 'Validated', lat: 8.9542, lng: 125.5961 },
    { id: 'CHO-004', name: 'Pedro Gomez', barangay: 'Libertad', disease: 'Acute Respiratory Infection', category: 'Disease Morbidity', date: '2026-10-04', status: 'Validated', lat: 8.9415, lng: 125.5038 },
    { id: 'CHO-005', name: 'Liza Soberano', barangay: 'Villa Kananga', disease: 'Dengue Clinical Case', category: 'Disease Morbidity', date: '2026-10-02', status: 'Validated', lat: 8.9324, lng: 125.5269 },
    { id: 'CHO-006', name: 'Mark Bautista', barangay: 'Ampayon', disease: 'Dengue Clinical Case', category: 'Disease Morbidity', date: '2026-10-01', status: 'Validated', lat: 8.9580, lng: 125.5990 },
  ];

  // List of Barangays
  const butuanBarangays = [
    'All Butuan City', 'Ampayon', 'Tiniwisan', 'Baan 3', 'Baan Riverside', 
    'Bading', 'Bancasi', 'Doongan', 'Libertad', 'Mahogany', 'San Vicente', 'Villa Kananga'
  ];

  // Filter Logic
  const filteredData = mockChoData.filter(record => {
    const matchBarangay = filterBarangay === 'All Butuan City' || record.barangay === filterBarangay;
    const matchDisease = filterDisease === 'All FHSIS Categories' || record.disease === filterDisease;
    return matchBarangay && matchDisease;
  });

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-lg z-20">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-white font-bold text-lg">IDG4Health</h2>
          <p className="text-xs text-slate-400 mt-1">City Health Office Portal</p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          <button 
            onClick={() => setActiveMenu('spatial')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeMenu === 'spatial' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <MapIcon className="w-5 h-5" /> Spatial Surveillance
          </button>
          <button 
            onClick={() => setActiveMenu('registry')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeMenu === 'registry' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> City-Wide Registry
          </button>
          <button 
            onClick={() => setActiveMenu('reports')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${activeMenu === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <FileSpreadsheet className="w-5 h-5" /> Master FHSIS Export
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
        
        {/* TOP KPI & HEADER BAR */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 shadow-sm z-10">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {activeMenu === 'spatial' ? 'Epidemiological Spatial Dashboard' : 'Master City Registry'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {activeMenu === 'spatial' ? 'Monitor disease distribution and health events across Butuan City.' : 'Tabular view of all validated FHSIS records across all local health units.'}
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Activity className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-semibold text-blue-800 uppercase">Validated Cases (Mtd)</p>
                <p className="text-xl font-bold text-blue-900">1,284</p>
              </div>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-semibold text-rose-800 uppercase">Active Dengue Alerts</p>
                <p className="text-xl font-bold text-rose-900">42</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-semibold text-amber-800 uppercase">Top Morbidity Area</p>
                <p className="text-lg font-bold text-amber-900 truncate">Brgy. Ampayon</p>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Baby className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-semibold text-emerald-800 uppercase">Maternal Care Visits</p>
                <p className="text-xl font-bold text-emerald-900">315</p>
              </div>
            </div>
          </div>
        </div>

        {activeMenu === 'spatial' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Map Controls Sidebar */}
            <div className="w-72 bg-white border-r border-slate-200 p-5 overflow-y-auto z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.05)]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Map Controls
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Visualization Layer</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setMapLayer('pin')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mapLayer === 'pin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pin Map</button>
                    <button onClick={() => setMapLayer('heat')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${mapLayer === 'heat' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Heat Map</button>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Filter className="w-4 h-4" /> Epidemiological Filters
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Geographic Area</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                      <select value={filterBarangay} onChange={(e) => setFilterBarangay(e.target.value)} className="w-full text-sm pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        {butuanBarangays.map(brgy => <option key={brgy} value={brgy}>{brgy}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">FHSIS Classification</label>
                    <div className="relative">
                      <Activity className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                      <select value={filterDisease} onChange={(e) => setFilterDisease(e.target.value)} className="w-full text-sm pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="All FHSIS Categories">All FHSIS Categories</option>
                        <option value="Dengue Clinical Case">Dengue Clinical Case</option>
                        <option value="Acute Respiratory Infection">Acute Respiratory Infection</option>
                        <option value="Hypertension">Hypertension</option>
                        <option value="Maternal Care">Maternal Care</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Timeframe</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                      <select value={filterTimeframe} onChange={(e) => setFilterTimeframe(e.target.value)} className="w-full text-sm pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="Today">Today</option>
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="This Month">This Month</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REACT-LEAFLET MAP CONTAINER */}
            <div className="flex-1 relative z-0">
              <MapContainer 
                center={[8.9475, 125.5406]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                
                {filteredData.map(record => (
                  <CircleMarker
                    key={record.id}
                    center={[record.lat, record.lng]}
                    radius={mapLayer === 'heat' ? 25 : 8}
                    pathOptions={{
                      color: record.disease.includes('Dengue') ? '#f43f5e' : '#3b82f6', // rose-500 for Dengue, blue-500 for normal
                      fillColor: record.disease.includes('Dengue') ? '#f43f5e' : '#3b82f6',
                      fillOpacity: mapLayer === 'heat' ? 0.5 : 0.9,
                      weight: mapLayer === 'heat' ? 0 : 2
                    }}
                  >
                    <Popup>
                      <div className="text-sm font-sans">
                        <strong className="text-slate-800 text-base">{record.barangay}</strong><br/>
                        <span className="text-blue-600 font-semibold">{record.disease}</span><br/>
                        <span className="text-slate-500 text-xs">Patient: {record.name}</span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Map Legend */}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur px-4 py-3 rounded-xl shadow-lg border border-slate-200 z-[400] pointer-events-none">
                <h3 className="text-xs font-bold text-slate-800 mb-2">Map Legend</h3>
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                  <div className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-sm"></div> Outbreak / Dengue
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow-sm"></div> Standard Morbidity
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                  Showing {filteredData.length} records
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CITY-WIDE REGISTRY TABLE */}
        {activeMenu === 'registry' && (
          <div className="flex-1 p-8 overflow-auto bg-slate-50">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search patient, ID, or barangay..." className="text-sm bg-transparent border-none focus:ring-0 w-64 outline-none" />
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="p-4 font-semibold">Record ID</th>
                    <th className="p-4 font-semibold">Date Validated</th>
                    <th className="p-4 font-semibold">Patient Name</th>
                    <th className="p-4 font-semibold">Barangay Location</th>
                    <th className="p-4 font-semibold">FHSIS Classification</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {mockChoData.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-blue-600">{record.id}</td>
                      <td className="p-4 text-slate-500">{record.date}</td>
                      <td className="p-4 font-medium text-slate-800">{record.name}</td>
                      <td className="p-4 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {record.barangay}</td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{record.disease}</div>
                        <div className="text-xs text-slate-500">{record.category}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeMenu === 'reports' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-50">
            <FileSpreadsheet className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700">Master FHSIS Export</h2>
            <p className="text-sm mt-2">PDF and Excel generation logic will be connected here.</p>
          </div>
        )}

      </main>
    </div>
  );
}