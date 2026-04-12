"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayersControl, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import axios from "axios";

// Correction icône Leaflet par défaut
const customerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -34],
});

const storeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1162/1162456.png",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

const MapController = ({ position }: any) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  return null;
};

export default function AddressMap({ position, setPosition, storePosition = { lat: 12.328768, lng: -1.550294 } }: any) {
  const [route, setRoute] = useState<[number, number][]>([]);

  // Gestion du clic sur la carte
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  useEffect(() => {
    if (position) {
      const getRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${storePosition.lng},${storePosition.lat};${position.lng},${position.lat}?overview=full&geometries=geojson`;
          const res = await axios.get(url);
          if (res.data.routes?.[0]) {
            const coords = res.data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
            setRoute(coords);
          }
        } catch (err) {
          setRoute([[storePosition.lat, storePosition.lng], [position.lat, position.lng]]);
        }
      };
      getRoute();
    }
  }, [position, storePosition]);

  return (
    <div className="h-full w-full relative">
      <MapContainer center={storePosition} zoom={15} className="h-full w-full z-0">
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Vue Satellite">
            <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Plan">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />
          </LayersControl.BaseLayer>
        </LayersControl>

        <MapEvents />
        <MapController position={position} />

        <Marker position={storePosition} icon={storeIcon}>
          <Popup><b>La Boucherie</b></Popup>
        </Marker>

        {position && (
          <Marker 
            position={position} 
            icon={customerIcon} 
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const coords = e.target.getLatLng();
                setPosition({ lat: coords.lat, lng: coords.lng });
              }
            }}
          />
        )}

        {route.length > 0 && (
          <Polyline positions={route} pathOptions={{ color: "#b91c1c", weight: 5, dashArray: "10, 10" }} />
        )}
      </MapContainer>
    </div>
  );
}