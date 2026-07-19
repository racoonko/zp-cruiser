import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { LocateFixed, MapPin, Compass, HelpCircle, Info, Shield, Users, Leaf, Tent, Lock, Crown, Gem } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HOTSPOTS = [
  { id: 1, lat: 48.1835, lng: 17.1945, name: "Nudapláž", desc: "Hlavná pláž na lovenie" },
  { id: 2, lat: 48.1835, lng: 17.1970, name: "Lesík", desc: "Súkromnejšie miesta v tieni stromov" },
  { id: 3, lat: 48.1885, lng: 17.1865, name: "Kemp", desc: "Klasická zastávka, veľká premávka" }
];

function UserLocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ watch: true, setView: false }).on("locationfound", function (e) {
      setPosition(e.latlng);
    }).on("locationerror", function (e) {
      console.log("Nemohli sme nájsť tvoju polohu.");
    });

    return () => {
      map.stopLocate();
    }
  }, [map]);

  const handleLocate = () => {
    if (position) {
      map.flyTo(position, map.getZoom());
    } else {
      map.locate({ setView: true, maxZoom: 16 });
    }
  };

  return (
    <>
      {position && (
        <Marker 
          position={position}
          icon={L.divIcon({
            className: 'bg-transparent',
            html: `<div class="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md animate-pulse"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Popup>Moja Poloha</Popup>
        </Marker>
      )}
      <button 
        onClick={handleLocate}
        className="absolute bottom-4 right-4 z-[1000] bg-primary text-on-primary p-3.5 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all"
        aria-label="Find my location"
      >
        <LocateFixed size={20} />
      </button>
    </>
  );
}

interface MapScreenProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
  key?: string;
}

export function MapScreen({ isPremium, onUpgradeClick }: MapScreenProps) {
  const center: [number, number] = [48.1847, 17.1910];
  
  // Dynamic crowd density states
  const [densities, setDensities] = useState<Record<string, { level: string; color: string; bg: string; border: string }>>({
    Nudapláž: { level: 'Pohoda 👥', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    Lesík: { level: 'Voľno 🍃', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    Kemp: { level: 'Plno 🔥', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  });

  const handleUpdateDensity = (zone: string) => {
    const states = [
      { level: 'Voľno 🍃', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
      { level: 'Pohoda 👥', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
      { level: 'Plno 🔥', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
    ];
    setDensities(prev => {
      const currentVal = prev[zone as keyof typeof prev].level;
      const currentIdx = states.findIndex(s => s.level === currentVal);
      const nextIdx = (currentIdx + 1) % states.length;
      return {
        ...prev,
        [zone]: states[nextIdx]
      };
    });
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(12); } catch (e) {}
    }
  };

  // Approximate coordinates for the yellow nudapláž line
  const nudaplazLine: [number, number][] = [
    [48.1870, 17.1955],
    [48.1835, 17.1945],
    [48.1795, 17.1925]
  ];
  
  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Upper Map Pane (Approx 45% Screen Height) */}
      <div className="w-full h-[280px] sm:h-[340px] relative shrink-0 border-b border-outline-variant/20 shadow-xs">
        <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
          <div className="bg-surface/90 backdrop-blur-md rounded-full px-4 py-2.5 shadow-sm border border-outline-variant/30 pointer-events-auto flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
              <Compass size={14} className="text-primary animate-spin-slow" /> Mapa Zlatých Pieskov
            </span>
            <span className="text-[10px] bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-bold">LIVE GPS</span>
          </div>
        </div>
        
        <MapContainer 
          center={center} 
          zoom={15} 
          zoomControl={false}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* Kemp Zone (Blue) */}
          <Circle 
            center={[48.1885, 17.1865]} 
            radius={180} 
            pathOptions={{ color: '#0ea5e9', fillColor: '#0ea5e9', fillOpacity: 0.15, weight: 2 }}
          >
            <Popup>
              <div className="text-center font-sans">
                <h3 className="font-bold text-[#0ea5e9]">Kemp</h3>
                <p className="text-xs text-on-surface-variant">Zóna pri kempe</p>
              </div>
            </Popup>
          </Circle>
    
          {/* Nudapláž Zone (Yellow) */}
          <Polyline 
            positions={nudaplazLine} 
            pathOptions={{ color: '#eab308', weight: 8, opacity: 0.8 }}
          >
            <Popup>
              <div className="text-center font-sans">
                <h3 className="font-bold text-[#ca8a04]">Nudapláž</h3>
                <p className="text-xs text-on-surface-variant">Hlavná plážová línia</p>
              </div>
            </Popup>
          </Polyline>
    
          {/* Lesík Zone (Green) */}
          <Circle 
            center={[48.1835, 17.1970]} 
            radius={150} 
            pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15, weight: 2 }}
          >
            <Popup>
              <div className="text-center font-sans">
                <h3 className="font-bold text-[#10b981]">Lesík</h3>
                <p className="text-xs text-on-surface-variant">Oblasť v lese</p>
              </div>
            </Popup>
          </Circle>
    
          {HOTSPOTS.map(spot => (
            <Marker key={spot.id} position={[spot.lat, spot.lng]}>
              <Popup>
                <div className="font-sans">
                  <h3 className="font-bold text-on-surface mb-1">{spot.name}</h3>
                  <p className="text-sm text-on-surface-variant">{spot.desc}</p>
                </div>
              </Popup>
            </Marker>
          ))}
    
          <UserLocationMarker />
        </MapContainer>
      </div>

      {/* Lower Scrollable Pane (Zone Guide, Interactive Reporting & Beach Etiquette) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-20">
        
        {/* Dynamic Crowds Header & Reporting Card */}
        <div className="bg-surface-container rounded-[28px] p-5 border border-outline-variant/30 shadow-xs">
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-1.5">
              <Users size={18} className="text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Reálna obsadenosť zón</h3>
            </div>
            <span className="text-[10px] text-outline bg-surface-variant px-2.5 py-0.5 rounded-full border border-outline-variant/10">
              Nahlásené komunitou
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Object.entries(densities).map(([zone, val]) => {
              const data = val as { level: string; color: string; bg: string; border: string };
              return (
                <button 
                  key={zone}
                  onClick={() => handleUpdateDensity(zone)}
                  className={`flex flex-col items-center p-2.5 rounded-2xl border transition-all active:scale-95 text-center ${data.bg} ${data.border}`}
                  title="Klikni pre zmenu stavu obsadenosti"
                >
                  <span className="text-xs font-bold text-on-surface mb-1 flex items-center gap-1">
                    {zone === 'Nudapláž' && <Tent className="text-amber-500" size={12} />}
                    {zone === 'Lesík' && <Leaf className="text-green-500" size={12} />}
                    {zone === 'Kemp' && <Users className="text-sky-500" size={12} />}
                    {zone}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${data.color}`}>
                    {data.level}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-outline text-center mt-3 font-light leading-snug">
            💡 Vidíš inú situáciu? Kliknutím na zónu vyššie okamžite nahlásiš aktuálny stav.
          </p>
        </div>

        {/* VIP Cruising Radar Widget */}
        <div className="bg-surface-container rounded-[28px] p-5 border border-outline-variant/30 shadow-xs relative overflow-hidden">
          {/* Header block */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-1.5">
              <Compass size={18} className="text-amber-500 animate-spin-slow" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">📡 VIP Cruising Radar</h3>
            </div>
            {isPremium ? (
              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full font-extrabold uppercase border border-amber-500/20">
                VIP PRÍSTUP
              </span>
            ) : (
              <button 
                onClick={onUpgradeClick}
                className="text-[9px] bg-primary text-on-primary px-2.5 py-0.5 rounded-full font-bold uppercase hover:opacity-90 active:scale-95 transition-all"
              >
                Odomknúť 🔓
              </button>
            )}
          </div>

          {/* Details list (blurred if Free, detailed if Premium) */}
          <div className="space-y-3.5 relative">
            {!isPremium && (
              <div className="absolute inset-0 bg-surface-container/60 backdrop-blur-xs z-10 flex flex-col items-center justify-center text-center p-4">
                <Lock size={22} className="text-amber-400 mb-2 animate-bounce" />
                <p className="text-xs font-bold text-on-surface">Cruising & Flirt štatistiky sú skryté</p>
                <p className="text-[9px] text-on-surface-variant mt-0.5 max-w-[200px] leading-snug">Aktuálny vekový priemer, stupne aktivity a najlepšie časy pre pláž.</p>
                <button
                  onClick={onUpgradeClick}
                  className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold py-2 px-4 rounded-full shadow-xs active:scale-95 transition-all uppercase tracking-wider"
                >
                  Odomknúť s VIP Premium
                </button>
              </div>
            )}

            <div className={`space-y-3.5 ${!isPremium ? 'blur-xs select-none pointer-events-none' : ''}`}>
              {/* Nudapláž stats */}
              <div className="bg-surface-variant/20 p-3 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏖️</span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Hlavná Nudapláž</h4>
                    <p className="text-[9px] text-on-surface-variant font-medium">Uvoľnená, priateľská atmosféra</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">88% Aktivita</span>
                  <p className="text-[9px] text-outline font-mono mt-0.5">Vek: 20-45 r. | Naj o 14:00</p>
                </div>
              </div>

              {/* Lesík stats */}
              <div className="bg-surface-variant/20 p-3 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌳</span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Lesík & Chládok</h4>
                    <p className="text-[9px] text-on-surface-variant font-medium">Vysoká intenzita, cruising</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">94% Aktivita</span>
                  <p className="text-[9px] text-outline font-mono mt-0.5">Vek: 28-55 r. | Naj o 17:00</p>
                </div>
              </div>

              {/* Kemp stats */}
              <div className="bg-surface-variant/20 p-3 rounded-2xl border border-outline-variant/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⛺</span>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Zóna Kemp</h4>
                    <p className="text-[9px] text-on-surface-variant font-medium">Turistická, zmiešaná zóna</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">35% Aktivita</span>
                  <p className="text-[9px] text-outline font-mono mt-0.5">Vek: 18-35 r. | Naj o 12:00</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Zone Guide */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1 flex items-center gap-1.5">
            <Info size={14} className="text-primary" /> Sprievodca zónami pláže
          </h3>

          <div className="space-y-3">
            {/* Nudaplaz Card */}
            <div className="bg-surface-container/60 rounded-[24px] p-4 border border-outline-variant/10 flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0 border border-amber-500/20">
                🏖️
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">Hlavná Nudapláž</h4>
                <p className="text-xs text-on-surface-variant/90 leading-relaxed mt-1">
                  Tradičná pieskovo-trávnatá pláž s výborným vstupom do vody. Prvá a najznámejšia certifikovaná nudistická zóna v Bratislave. Vhodná na celodenné opaľovanie a spoločný rodinný relax bez plaviek.
                </p>
              </div>
            </div>

            {/* Lesik Card */}
            <div className="bg-surface-container/60 rounded-[24px] p-4 border border-outline-variant/10 flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center font-bold text-lg shrink-0 border border-green-500/20">
                🌳
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">Lesík & Chládok</h4>
                <p className="text-xs text-on-surface-variant/90 leading-relaxed mt-1">
                  Stromy za hlavnou plážou poskytujúce dokonalý úkryt pred páliacim slnkom. Populárna trasa pre pokojné prechádzky a diskrétne, príjemné spoznávanie sa v komunitnom duchu.
                </p>
              </div>
            </div>

            {/* Kemp Card */}
            <div className="bg-surface-container/60 rounded-[24px] p-4 border border-outline-variant/10 flex gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-lg shrink-0 border border-sky-500/20">
                ⛺
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">Zóna Kemp</h4>
                <p className="text-xs text-on-surface-variant/90 leading-relaxed mt-1">
                  Zmiešaná zóna na druhej strane jazera blízko autokempu. Nájdete tu textilných rekreantov aj nudistov. Skvelá poloha kvôli priamemu prístupu k bufetovým zariadeniam a letným plážovým barom.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Etiquette (ZP Etiketa) */}
        <div className="bg-surface-container rounded-[28px] p-5 border border-outline-variant/30 shadow-xs space-y-3.5">
          <div className="flex items-center gap-1.5">
            <Shield size={18} className="text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Komunitná Etiketa (Nude kódex)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex gap-2.5">
              <span className="text-base shrink-0">📸</span>
              <div>
                <p className="font-bold text-on-surface">Absolútny zákaz fotenia bez súhlasu</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  Rešpektujte súkromie ostatných. Nikdy nefoťte iných návštevníkov. Zariadenia používajte len diskrétne.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 border-t border-outline-variant/10 pt-3">
              <span className="text-base shrink-0">🧴</span>
              <div>
                <p className="font-bold text-on-surface">Ochrana zdravia a čistota</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  Pri sedení na verejných lavičkách, v bufete alebo na prenájmoch vždy z hygienických dôvodov používajte vlastnú podložku či osušku.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 border-t border-outline-variant/10 pt-3">
              <span className="text-base shrink-0">🤝</span>
              <div>
                <p className="font-bold text-on-surface">Rešpektujúci konsenzus</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                  Zlaté Piesky sú o slobode a oddychu. Všetky interakcie musia byť plne konsenzuálne. Chráňte priateľskú a bezpečnú atmosféru pláže.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
