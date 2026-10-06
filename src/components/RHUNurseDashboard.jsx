import React, { useState } from 'react';
import { CheckCircle, FileSpreadsheet, LayoutDashboard, ClipboardCheck, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function RHUNurseDashboard() {
  const [activeTab, setActiveTab] = useState('validation');
  
  // Mock data representing BHW submissions
  const [records, setRecords] = useState([
    { id: 'REC-001', patient: 'Maria Santos', age: 28, disease: 'Dengue Clinical Case', date: '2026-10-06', status: 'Pending Review' },
    { id: 'REC-002', patient: 'Juan Dela Cruz', age: 45, disease: 'Hypertension', date: '2026-10-06', status: 'Pending Review' },
    { id: 'REC-003', patient: 'Ana Reyes', age: 5, disease: 'Acute Respiratory Infection', date: '2026-10-05', status: 'Approved' },
  ]);

  const handleApprove = (id) => {
    setRecords(records.map(rec => rec.id === id ? { ...rec, status: 'Approved' } : rec));
  };

  // Automated MCT calculations
  const approvedRecords = records.filter(rec => rec.status === 'Approved');
  const totalApproved = approvedRecords.length;

  // --- REPORT GENERATION LOGIC ---

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Document Header
    doc.setFontSize(16);
    doc.text("Field Health Services Information System (FHSIS)", 14, 15);
    doc.setFontSize(12);
    doc.text("Monthly Consolidation Table (MCT) - Approved Cases", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    // Prepare Table Data
    const tableColumn = ["Record ID", "Patient Name", "Age", "Disease Class", "Date Encoded"];
    const tableRows = [];

    approvedRecords.forEach(record => {
      const recordData = [record.id, record.patient, record.age, record.disease, record.date];
      tableRows.push(recordData);
    });

    // Corrected AutoTable Generation
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] } // Emerald green header
    });

    doc.save(`FHSIS_MCT_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Validated FHSIS Data');

    // Define Columns
    worksheet.columns = [
      { header: 'Record ID', key: 'id', width: 15 },
      { header: 'Patient Name', key: 'patient', width: 25 },
      { header: 'Age', key: 'age', width: 10 },
      { header: 'Disease Classification', key: 'disease', width: 30 },
      { header: 'Date Encoded', key: 'date', width: 15 },
    ];

    // Add Style to Header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };

    // Add Rows
    approvedRecords.forEach(record => {
      worksheet.addRow(record);
    });

    // Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FHSIS_MCT_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

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
              
              {/* EXPORT BUTTONS */}
              <div className="flex gap-3">
                <button 
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
                >
                  <FileText className="w-4 h-4" />
                  PDF Report
                </button>
                <button 
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel Report
                </button>
              </div>
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
                    <span className="font-semibold">{approvedRecords.filter(r => r.disease === 'Dengue Clinical Case').length}</span>
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