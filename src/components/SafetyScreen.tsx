import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  PersonStanding, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Lock,
  ShieldCheck,
  Timer,
  Check,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface SafetyScreenProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
  key?: string;
}

export function SafetyScreen({ isPremium, onUpgradeClick }: SafetyScreenProps) {
  const [sirenActive, setSirenActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Premium Safe Check-in Guard Timer
  const [safeTimer, setSafeTimer] = useState<number | null>(null);
  const [safeTimerActive, setSafeTimerActive] = useState<boolean>(false);
  const [safeTimerAlert, setSafeTimerAlert] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (safeTimerActive && safeTimer !== null && safeTimer > 0) {
      interval = setInterval(() => {
        setSafeTimer((prev) => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          } else {
            setSafeTimerActive(false);
            setSafeTimerAlert(true);
            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
              try { window.navigator.vibrate([200, 100, 200, 100, 500]); } catch (e) {}
            }
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [safeTimerActive, safeTimer]);

  const handleStartSafeTimer = (minutes: number) => {
    if (!isPremium) {
      onUpgradeClick();
      return;
    }
    setSafeTimer(minutes * 60);
    setSafeTimerActive(true);
    setSafeTimerAlert(false);
  };

  const handleCancelSafeTimer = () => {
    setSafeTimer(null);
    setSafeTimerActive(false);
    setSafeTimerAlert(false);
  };

  const startSiren = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1300, ctx.currentTime + 0.4);
      osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Safe volume setting
      gain.gain.setValueAtTime(0.25, ctx.currentTime);

      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;

      // Set up simple sweeping interval
      const intervalId = setInterval(() => {
        if (audioCtxRef.current && osc) {
          const t = audioCtxRef.current.currentTime;
          osc.frequency.setValueAtTime(700, t);
          osc.frequency.linearRampToValueAtTime(1300, t + 0.35);
          osc.frequency.linearRampToValueAtTime(700, t + 0.7);
        }
      }, 700);

      (osc as any)._sweepInterval = intervalId;
    } catch (e) {
      console.error("Audio Context is not supported or was blocked by browser policies:", e);
    }
  };

  const stopSiren = () => {
    if (oscillatorRef.current) {
      clearInterval((oscillatorRef.current as any)._sweepInterval);
      try { oscillatorRef.current.stop(); } catch (err) {}
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  const toggleSiren = () => {
    if (sirenActive) {
      stopSiren();
      setSirenActive(false);
    } else {
      startSiren();
      setSirenActive(true);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate([100, 50, 100, 50, 100]); } catch (e) {}
      }
    }
  };

  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, []);

  const handleSOS = () => {
    window.location.href = "tel:112";
  };

  const handleSendLocation = () => {
    const message = encodeURIComponent("SOS - som na Zlaté Piesky, pomôžte! Lokácia: https://maps.google.com/?q=48.1847,17.1894");
    window.location.href = `sms:?body=${message}`;
  };

  const handleQuickExit = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto min-h-full">
      {/* Visual Strobe Overlay when Siren is Active */}
      {sirenActive && (
        <motion.div 
          animate={{ backgroundColor: ["rgba(239, 68, 68, 0.4)", "rgba(59, 130, 246, 0.4)", "rgba(239, 68, 68, 0.4)"] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
          className="fixed inset-0 z-[1500] pointer-events-none"
        />
      )}

      <h1 className="text-2xl font-medium text-on-background mb-6 mt-4 text-center">
        BEZPEČNOSŤ NA PRVOM MIESTE
      </h1>

      <motion.button
        onClick={handleSOS}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-full h-[88px] bg-error text-on-error rounded-[28px] flex items-center justify-center gap-3 hover:opacity-90 active:opacity-80 transition-opacity mb-4 shadow-sm"
      >
        <PhoneCall size={32} />
        <span className="text-2xl font-medium">SOS - Zavolať 112</span>
      </motion.button>

      {/* Interactive Siren Button */}
      <button
        onClick={toggleSiren}
        className={`w-full py-4 px-6 rounded-[24px] flex items-center justify-center gap-2.5 transition-colors mb-6 shadow-md border ${
          sirenActive 
            ? 'bg-red-600 text-white border-red-600 animate-pulse' 
            : 'bg-surface-container-high text-error border-error/20 hover:bg-error/10'
        }`}
      >
        {sirenActive ? <VolumeX size={20} /> : <Volume2 size={20} />}
        <span className="font-semibold text-sm">
          {sirenActive ? "Vypnúť výstražnú sirénu" : "Spustiť sirénu (Panic)"}
        </span>
      </button>

      <div className="flex w-full gap-3 mb-8">
        <button
          onClick={handleSendLocation}
          className="flex-1 bg-secondary-container text-on-secondary-container py-4 px-2 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <MapPin size={24} />
          <span className="text-sm font-medium text-center">Poslať polohu</span>
        </button>

        <button
          onClick={handleQuickExit}
          className="flex-1 bg-secondary-container text-on-secondary-container py-4 px-2 rounded-[24px] flex flex-col items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <PersonStanding size={24} />
          <span className="text-sm font-medium text-center">Quick Exit</span>
        </button>
      </div>

      {/* Premium Safe Check-In Guard */}
      <div className="w-full bg-surface-container rounded-[28px] p-5 mb-6 border border-outline-variant/30 shadow-xs relative overflow-hidden">
        {/* If alert is active, show pulsating red overlay */}
        {safeTimerAlert && (
          <div className="absolute inset-0 bg-error/10 border-2 border-error animate-pulse rounded-[28px] pointer-events-none" />
        )}

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-1.5">
            <Timer className="text-primary" size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Safe Check-in Strážca</h3>
          </div>
          {isPremium ? (
            <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-full font-extrabold uppercase border border-emerald-500/20">
              VIP Aktivované 💎
            </span>
          ) : (
            <button 
              onClick={onUpgradeClick}
              className="text-[9px] bg-primary text-on-primary px-2.5 py-0.5 rounded-full font-bold uppercase hover:opacity-90 active:scale-95 transition-all flex items-center gap-1"
            >
              <Lock size={10} /> VIP funkcia
            </button>
          )}
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed mb-4">
          Stretávaš sa s niekým novým z pláže? Spusti si bezpečnostný odpočet. Ak ho do limitu nevypneš, aplikácia spustí núdzový režim a upozorní okolie.
        </p>

        {safeTimer === null && !safeTimerAlert ? (
          <div className="grid grid-cols-3 gap-2">
            {[15, 30, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => handleStartSafeTimer(mins)}
                className="py-2.5 px-2 rounded-2xl bg-surface-variant/40 hover:bg-surface-variant/80 border border-outline-variant/20 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
              >
                <span className="text-xs font-bold text-on-surface">{mins} min</span>
                <span className="text-[8px] text-outline uppercase tracking-wider font-mono">Časovač</span>
              </button>
            ))}
          </div>
        ) : safeTimer !== null && !safeTimerAlert ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-between w-full bg-surface-variant/40 py-2 px-4 rounded-xl border border-outline-variant/10">
              <span className="text-xs font-bold text-on-surface-variant">Bezpečnostný odpočet aktívny:</span>
              <span className="text-sm font-mono font-black text-primary animate-pulse bg-primary/10 px-2.5 py-1 rounded-md">
                {Math.floor(safeTimer / 60)}:{(safeTimer % 60) < 10 ? '0' : ''}{safeTimer % 60}
              </span>
            </div>
            <button
              onClick={handleCancelSafeTimer}
              className="w-full bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check size={14} /> Potvrdzujem, že som v bezpečí (Vypnúť)
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 py-1">
            <div className="p-2.5 bg-error/10 text-error rounded-full animate-bounce">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-bold text-sm text-error uppercase tracking-wider">⚠️ NEBEZPEČENSTVO - LIMIT VYPRŠAL!</p>
              <p className="text-[11px] text-on-surface-variant leading-relaxed mt-0.5">
                Nepotvrdili ste bezpečnosť v stanovenom čase. Spúšťa sa siréna a núdzové upozornenia.
              </p>
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleCancelSafeTimer}
                className="flex-1 bg-surface-variant text-on-surface font-bold text-xs py-2 px-3 rounded-xl hover:bg-outline-variant/20 transition-all"
              >
                Som v poriadku
              </button>
              <button
                onClick={() => {
                  handleCancelSafeTimer();
                  toggleSiren();
                }}
                className="flex-1 bg-error text-on-error font-bold text-xs py-2 px-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
              >
                Spustiť Panic Sirénu
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-surface-container-high rounded-[28px] p-6">
        <h2 className="text-lg font-medium text-on-surface mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={20} />
          Základné pravidlá:
        </h2>
        <ul className="space-y-3 text-on-surface-variant">
          <li className="flex gap-3"><span className="text-primary">•</span> <span>Consent je POVINNÝ</span></li>
          <li className="flex gap-3"><span className="text-primary">•</span> <span>Public sex = riziko polície</span></li>
          <li className="flex gap-3"><span className="text-primary">•</span> <span>Použi kondóm + testuj sa pravidelne</span></li>
          <li className="flex gap-3"><span className="text-primary">•</span> <span>Ak sa necítiš dobre — okamžite odíď</span></li>
        </ul>
      </div>
    </div>
  );
}
