import { useState, useEffect } from "react";
import { CloseIcon, CheckCircleIcon, InfoIcon } from "../../../icons";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import apiClient from "../../../api/apiClient";

// Fix for default marker icons in Leaflet + React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationModalProps {
  customerId: number;
  initialLat?: number;
  initialLng?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LocationModal({ customerId, initialLat, initialLng, onClose, onSuccess }: LocationModalProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : [6.9271, 79.8612] // Default to Colombo
  );
  const [loading, setLoading] = useState(false);

  function MapEvents() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  }

  function RecenterMap({ pos }: { pos: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(pos);
    }, [pos, map]);
    return null;
  }

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  const handleSave = async () => {
    if (!position) return;
    setLoading(true);
    try {
      await apiClient.post(`/customers/${customerId}/location`, {
        latitude: position[0],
        longitude: position[1]
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save location", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 sm:px-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-error-50 dark:bg-error-500/10 text-error-500 flex items-center justify-center">
              <InfoIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Location</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Set exact GPS coordinates for this customer. You can capture current location or click on the map.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Latitude</label>
              <input 
                type="text" 
                readOnly 
                value={position?.[0] || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Longitude</label>
              <input 
                type="text" 
                readOnly 
                value={position?.[1] || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="h-64 w-full rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 z-0">
            <MapContainer center={position || [6.9271, 79.8612]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapEvents />
              {position && <Marker position={position} icon={DefaultIcon} />}
              {position && <RecenterMap pos={position} />}
            </MapContainer>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleCaptureLocation}
              className="w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold rounded-xl border border-brand-200 transition-colors flex items-center justify-center gap-2"
            >
              <InfoIcon className="w-4 h-4" /> Use My Current Location
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Saving..." : <><CheckCircleIcon className="w-4 h-4" /> Save Coordinates</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
