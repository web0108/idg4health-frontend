import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, Layers, Filter } from 'lucide-react';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function CHODashboard() {
  const [mapLayer, setMapLayer] = useState('pin'); 
  
  // Coordinates for Butuan City Pilot Areas
  const mapCenter = [8.9554, 125.5977]; 
  
  // Mock spatial data representing encoded BHW consultations
  const spatialData = [
    { id: 1, lat: 8.9554, lng: 125.5977, disease: 'Dengue', barangay: 'Ampayon', patients: 3 },
    { id: 2, lat: 8.9580, lng: 125.5990, disease: 'Dengue', barangay: 'Ampayon', patients: 5 },
    { id: 3, lat: 8.9700, lng: 125.5700, disease: 'Hypertension', barangay: 'Tiniwisan', patients: 1 },
    { id: 4, lat: 8.9350, lng: 125.5500, disease: 'Acute Respiratory', barangay: 'Baan 3', patients: 2 },
  ];

  // Simulated GeoJSON boundaries for the pilot barangays
  const barangayBoundaries = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Ampayon", color: "#3b82f6" },
        geometry: {
          type: "Polygon",
          coordinates: [[[125.58, 8.94], [125.61, 8.94], [125.61, 8.965], [125.58, 8.965], [125.58, 8.94]]]
        }
      },
      {
        type: "Feature",
        properties: { name: "Tiniwisan", color: "#10b981" },
        geometry: {
          type: "Polygon",
          coordinates: [[[125.55, 8.96], [125.575, 8.96], [125.575, 8.98], [125.55, 8.98], [125.55, 8.96]]]
        }
      },
      {
        type: "Feature",
        properties: { name: "Baan 3", color: "#f59e0b" },
        geometry: {
          type: "Polygon",
          coordinates: [[[125.53, 8.93], [125.55, 8.93], [125.55, 8.95], [125.53, 8.95], [125.53, 8.93]]]
        }
      }
    ]
  };

  // Styling function for the GeoJSON polygons
  const boundaryStyle = (feature) => {
    return {
      fillColor: feature.properties.color,
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.3
    };
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* Analytics Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800">CHO Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Municipal Spatial Dashboard</p>
        </div>
        
        <div className="p-6 space-y-6 flex-1">
          {/* Map Layer Toggle */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Map Visualization Layer
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setMapLayer('pin')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${mapLayer === 'pin' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pin Map
              </button>
              <button 
                onClick={() => setMapLayer('heat')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition ${mapLayer === 'heat' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Heat Map
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter by Barangay
            </h3>
            <select className="w-full text-sm border-slate-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-blue-500 bg-slate-50">
              <option>All Pilot Areas</option>
              <option>Ampayon</option>
              <option>Tiniwisan</option>
              <option>Baan 3</option>
            </select>
          </div>

          {/* GeoJSON Legend */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Geofence Legend</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 opacity-70"></div> Ampayon Boundary</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500 opacity-70"></div> Tiniwisan Boundary</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 opacity-70"></div> Baan 3 Boundary</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Web-GIS Map Interface */}
      <main className="flex-1 relative h-[calc(100vh-70px)] md:h-screen">
        <MapContainer center={mapCenter} zoom={13} className="w-full h-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render the GeoJSON Barangay Boundaries */}
          <GeoJSON 
            data={barangayBoundaries} 
            style={boundaryStyle}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`<b>${feature.properties.name}</b><br>Geofenced Pilot Area`);
            }}
          />

          {/* Render Pin Maps or Simulated Heat Maps */}
          {spatialData.map((point) => {
            if (mapLayer === 'pin') {
              return (
                <Marker key={point.id} position={[point.lat, point.lng]}>
                  <Popup>
                    <div className="text-sm font-sans">
                      <p className="font-bold text-slate-800">{point.barangay}</p>
                      <p className="text-blue-600">{point.disease}</p>
                      <p className="text-xs text-slate-500 mt-1">Cases: {point.patients}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            } else {
              return (
                <CircleMarker 
                  key={`heat-${point.id}`} 
                  center={[point.lat, point.lng]} 
                  radius={point.patients * 8} 
                  fillColor="red" 
                  color="transparent"
                  fillOpacity={0.6}
                >
                  <Popup>Cluster Density: {point.patients} Cases ({point.disease})</Popup>
                </CircleMarker>
              );
            }
          })}
        </MapContainer>
      </main>
    </div>
  );
}