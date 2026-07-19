import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { format } from 'date-fns';
import { 
  MessageSquarePlus, 
  CloudSun, 
  Sun, 
  CloudRain, 
  Snowflake, 
  Cloud, 
  Thermometer, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Maximize2,
  AlertCircle,
  Flame,
  Droplets,
  Sparkles,
  Timer,
  ShieldAlert,
  Wind,
  Search,
  Info,
  Smile,
  Compass,
  Heart,
  Filter,
  Lock,
  Crown,
  Gem,
  Clock,
  Users
} from 'lucide-react';

interface CheckIn {
  id: string;
  text: string;
  userId: string;
  timestamp: Date | null;
  photo?: string; // base64 JPEG
}

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed?: number;
}

interface TodayScreenProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
  key?: string;
}

const defaultMockCheckIns: CheckIn[] = [
  {
    id: "mock-1",
    text: "Nudapláž hlási perfektné podmienky, voda má aspoň 24 stupňov a nefúka skoro vôbec! ☀️ Bezvetrie 🍃 Teplá voda ☀️",
    userId: "lovecc84",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    photo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mock-2",
    text: "V lesíku pri chládku sme stretli fajn partiu na pokec. Pridajte sa niekto! Tieň 🌳 Veľa ľudí 👥 Cruising 🔥",
    userId: "pieskofill",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
  },
  {
    id: "mock-3",
    text: "Bufety sú otvorené, na pivo a kofolu sa čaká len chvíľu. Voda je čistá! Čistá voda 🌊 Teplá voda ☀️",
    userId: "nudesunny",
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    photo: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80"
  }
];

export function TodayScreen({ isPremium, onUpgradeClick }: TodayScreenProps) {
  const reasons = [
    "Dnes sú skvelé slnečné lúče! Nudapláž hlási ideálne podmienky na rovnomerné opálenie bez plavkových pásikov. ☀️🏖️",
    "Príjemný chládok a tieň v lesíku dnes priam lákajú na poobednú prechádzku, únik pred úpalom a spoznávanie nových ľudí. 🌳🚶‍♂️",
    "Voda na Zlatých Pieskoch je priezračná a príjemne osviežujúca. Ideálny čas skočiť si zaplávať načisto \"naostro\". 🌊🏊",
    "Podľa hlásení v komunite dnes vládne skvelá, uvoľnená a priateľská atmosféra plná príjemných pohľadov. 😘✨",
    "Bufety pri kempovej zóne chladia nápoje na maximum. Dokonalé osvieženie po celom dni na deke! 🍺🍦",
    "Dnes je ideálne bezvetrie. Hladina jazera je ako zrkadlo – ideálne podmienky na pokojný relax pri vode. 🍃🧘",
    "Komunita dnes odporúča: Chráňte si citlivé partie, nahoďte SPF 30+ a užite si uvoľnenú atmosféru nudapláže! 🧴🕶️"
  ];
  
  const [todayReason] = useState(() => reasons[Math.floor(Math.random() * reasons.length)]);

  // Live Beach Vibe & Activity Index States
  const [vibeScore, setVibeScore] = useState<number>(() => {
    const saved = localStorage.getItem('zp_cruiser_vibe_score');
    return saved ? parseInt(saved, 10) : 45;
  });
  const [vibeVoted, setVibeVoted] = useState<string | null>(() => {
    return localStorage.getItem('zp_cruiser_vibe_voted');
  });
  const [voteBreakdown, setVoteBreakdown] = useState<{ relax: number; flirt: number; action: number }>(() => {
    const saved = localStorage.getItem('zp_cruiser_vibe_breakdown');
    return saved ? JSON.parse(saved) : { relax: 40, flirt: 35, action: 25 };
  });

  // Sunscreen UV & Water Hydration Timer States
  const [sunTimer, setSunTimer] = useState<number | null>(null);
  const [sunTimerType, setSunTimerType] = useState<'sunscreen' | 'water' | null>(null);
  const [sunTimerDuration, setSunTimerDuration] = useState<number>(0);
  const [sunTimerActive, setSunTimerActive] = useState<boolean>(false);
  const [sunTimerAlert, setSunTimerAlert] = useState<boolean>(false);
  const [showNudeSafetyTips, setShowNudeSafetyTips] = useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Countdown useEffect for the notification helper
  useEffect(() => {
    let interval: any = null;
    if (sunTimerActive && sunTimer !== null && sunTimer > 0) {
      interval = setInterval(() => {
        setSunTimer((prev) => {
          if (prev !== null && prev > 1) {
            return prev - 1;
          } else {
            setSunTimerActive(false);
            setSunTimerAlert(true);
            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
              try { window.navigator.vibrate([100, 50, 100, 50, 100, 50, 200]); } catch (e) {}
            }
            return 0;
          }
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sunTimerActive, sunTimer]);

  const handleVoteVibe = (type: 'relax' | 'flirt' | 'action') => {
    let newScore = vibeScore;
    let newBreakdown = { ...voteBreakdown };

    if (type === 'relax') {
      newScore = Math.max(10, Math.floor(vibeScore * 0.85 + 5));
      newBreakdown.relax += 8;
      newBreakdown.action = Math.max(5, newBreakdown.action - 4);
      newBreakdown.flirt = Math.max(5, newBreakdown.flirt - 4);
    } else if (type === 'flirt') {
      newScore = Math.min(85, Math.floor(vibeScore * 0.9 + 10));
      newBreakdown.flirt += 8;
      newBreakdown.relax = Math.max(5, newBreakdown.relax - 4);
      newBreakdown.action = Math.max(5, newBreakdown.action - 4);
    } else if (type === 'action') {
      newScore = Math.min(100, Math.floor(vibeScore * 0.8 + 20));
      newBreakdown.action += 8;
      newBreakdown.relax = Math.max(5, newBreakdown.relax - 4);
      newBreakdown.flirt = Math.max(5, newBreakdown.flirt - 4);
    }

    // Normalize to 100%
    const total = newBreakdown.relax + newBreakdown.flirt + newBreakdown.action;
    newBreakdown.relax = Math.round((newBreakdown.relax / total) * 100);
    newBreakdown.flirt = Math.round((newBreakdown.flirt / total) * 100);
    newBreakdown.action = 100 - newBreakdown.relax - newBreakdown.flirt;

    setVibeScore(newScore);
    setVoteBreakdown(newBreakdown);
    setVibeVoted(type);
    
    localStorage.setItem('zp_cruiser_vibe_score', newScore.toString());
    localStorage.setItem('zp_cruiser_vibe_voted', type);
    localStorage.setItem('zp_cruiser_vibe_breakdown', JSON.stringify(newBreakdown));
    
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate([20, 15, 20]); } catch (e) {}
    }
  };

  const handleStartTimer = (minutes: number, type: 'sunscreen' | 'water') => {
    const secs = minutes * 60;
    setSunTimer(secs);
    setSunTimerDuration(secs);
    setSunTimerType(type);
    setSunTimerActive(true);
    setSunTimerAlert(false);
    
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(25); } catch (e) {}
    }
  };

  const handleCancelTimer = () => {
    setSunTimer(null);
    setSunTimerType(null);
    setSunTimerActive(false);
    setSunTimerAlert(false);
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(10); } catch (e) {}
    }
  };

  const getVibeStatus = (score: number) => {
    if (score < 35) return { label: 'Pokojný oddych & Chytanie bronzu 🏖️', color: 'text-sky-500' };
    if (score < 70) return { label: 'Flirt a pohľady vo vzduchu 😘✨', color: 'text-amber-500 font-semibold' };
    return { label: 'Zvýšená aktivita v lesíku! 🔥🌿', color: 'text-rose-500 font-bold' };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const [user, setUser] = useState<User | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(defaultMockCheckIns);
  const [newCheckIn, setNewCheckIn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Camera & Upload States
  const [photo, setPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<CheckIn | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Fetch weather for Zlaté Piesky
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.1847&longitude=17.1894&current_weather=true')
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
          setWeather(data.current_weather);
        } else {
          // Fallback if data structure is unexpected
          setWeather({
            temperature: 28.5,
            weathercode: 0,
            windspeed: 6.2,
          });
        }
      })
      .catch(err => {
        console.warn("Failed to fetch live weather, using realistic fallback:", err);
        setWeather({
          temperature: 28.5,
          weathercode: 0,
          windspeed: 6.2,
        });
      });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthError(null);
    });
    return () => {
      unsubscribe();
      // Ensure any active camera streams are fully released if unmounted
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthError(error.message);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'checkins'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCheckIns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || null
      })) as CheckIn[];
      
      // If Firestore is working but there are no check-ins, or it hasn't synced yet, 
      // merge the online ones or keep defaults so the feed is never empty.
      if (fetchedCheckIns.length > 0) {
        setCheckIns(fetchedCheckIns);
      } else {
        setCheckIns(defaultMockCheckIns);
      }
    }, (error) => {
      console.warn("Could not reach Cloud Firestore backend. Continuing with offline fallback check-ins:", error);
      // Fallback is already initialized in state, but let's reinforce it on error
      setCheckIns(defaultMockCheckIns);
    });

    return () => unsubscribe();
  }, []);

  // Camera Control Functions
  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 800 }, height: { ideal: 600 } }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError("Nepodarilo sa spustiť fotoaparát. Snímku môžete nahrať z galérie.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      const MAX_SIZE = 800;
      let targetWidth = width;
      let targetHeight = height;
      if (width > height) {
        if (width > MAX_SIZE) {
          targetHeight = Math.round(height * (MAX_SIZE / width));
          targetWidth = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          targetWidth = Math.round(width * (MAX_SIZE / height));
          targetHeight = MAX_SIZE;
        }
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
        setPhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const width = img.width;
          const height = img.height;
          
          const MAX_SIZE = 800;
          let targetWidth = width;
          let targetHeight = height;
          if (width > height) {
            if (width > MAX_SIZE) {
              targetHeight = Math.round(height * (MAX_SIZE / width));
              targetWidth = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              targetWidth = Math.round(width * (MAX_SIZE / height));
              targetHeight = MAX_SIZE;
            }
          }
          
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
            setPhoto(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newCheckIn.trim() && !photo) || !user) return;

    setIsSubmitting(true);
    
    // Prepare an optimistic local check-in so that it displays instantly
    const textToSubmit = newCheckIn.trim();
    const photoToSubmit = photo || undefined;
    const optimisticCheckIn: CheckIn = {
      id: `local-${Date.now()}`,
      text: textToSubmit,
      userId: user.uid,
      timestamp: new Date(),
      photo: photoToSubmit
    };

    // Optimistically prepend to the feed
    setCheckIns(prev => [optimisticCheckIn, ...prev.filter(item => !item.id.startsWith('local-'))]);
    
    // Clear inputs immediately for better UX
    setNewCheckIn('');
    setPhoto(null);

    try {
      await addDoc(collection(db, 'checkins'), {
        text: textToSubmit,
        userId: user.uid,
        timestamp: serverTimestamp(),
        photo: photoToSubmit || null
      });
    } catch (error) {
      console.error("Error adding check-in to Firestore:", error);
      // We keep the optimistic post on screen so the user doesn't lose their post offline
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWeatherInfo = (code: number) => {
    if (code === 0) return { icon: <Sun className="text-orange-500 animate-spin-slow" size={32} />, text: 'Jasno (Ideál na pláž!)' };
    if (code >= 1 && code <= 3) return { icon: <CloudSun className="text-orange-400" size={32} />, text: 'Polooblačno' };
    if (code >= 51 && code <= 67) return { icon: <CloudRain className="text-blue-500" size={32} />, text: 'Dážď (Osvieženie)' };
    if (code >= 71 && code <= 77) return { icon: <Snowflake className="text-blue-300" size={32} />, text: 'Sneh (Otužovanie)' };
    return { icon: <Cloud className="text-gray-500" size={32} />, text: 'Zamračené' };
  };

  return (
    <div className="flex flex-col items-center min-h-full p-4 pb-12">
      <h1 className="text-2xl font-bold mb-1 text-on-background mt-4 text-center tracking-tight">
        ZP Cruiser • Dnes
      </h1>
      <p className="text-xs text-on-surface-variant/80 mb-5 text-center">Aktuálna situácia na pláži a komunitný prehľad</p>
      
      {/* Weather Widget */}
      {weather && (
        <div className="w-full max-w-md bg-primary-container text-on-primary-container rounded-[28px] p-5 mb-6 flex flex-col gap-3 shadow-sm border border-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-surface/95 p-3 rounded-2xl shadow-xs">
                {getWeatherInfo(weather.weathercode).icon}
              </div>
              <div>
                <p className="font-bold text-base leading-tight">{getWeatherInfo(weather.weathercode).text}</p>
                <p className="text-xs opacity-80 font-mono mt-0.5">Zlaté Piesky, Bratislava</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Thermometer size={20} className="text-primary" />
              <span className="text-3xl font-extrabold tracking-tighter">{Math.round(weather.temperature)}°C</span>
            </div>
          </div>
          
          {weather.windspeed !== undefined && (
            <div className="flex items-center justify-between border-t border-primary/15 pt-2.5 text-xs">
              <span className="flex items-center gap-1 opacity-90 font-medium">
                <Wind size={14} /> Sila vetra:
              </span>
              <span className="font-mono font-bold">
                {weather.windspeed} km/h {weather.windspeed < 12 ? '🍃 (Bezvetrie/Slabý)' : '💨 (Mierny vietor)'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Practical Info Card (Opening Hours & Recommended Age) */}
      <div className="w-full max-w-md bg-surface-container rounded-[28px] p-5 mb-6 border border-outline-variant/30 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3.5">
          <Clock size={16} className="text-primary animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Prevádzkové info & Komunita</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3.5">
          {/* Opening Hours */}
          <div className="bg-surface-variant/20 p-3.5 rounded-2xl border border-outline-variant/10 flex flex-col justify-between min-h-[90px]">
            <div className="flex items-center gap-1.5 text-primary">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Otvorené dnes</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-black text-on-surface">Kemp do 22:00</p>
              <p className="text-[9px] text-on-surface-variant font-medium mt-0.5 leading-snug">Ostatné priestory a nudapláž sú prístupné nonstop.</p>
            </div>
          </div>

          {/* Recommended Age */}
          <div className="bg-surface-variant/20 p-3.5 rounded-2xl border border-outline-variant/10 flex flex-col justify-between min-h-[90px]">
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Users size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Odporúčaný vek</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-black text-on-surface">Mladí (18 - 35 r.)</p>
              <p className="text-[9px] text-on-surface-variant font-medium mt-0.5 leading-snug">Najaktívnejšia a najživšia skupina na nudapláži.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Reason Header Card */}
      <div className="w-full max-w-md bg-surface-container rounded-[28px] p-5 mb-6 text-center border border-outline-variant/30 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1 flex items-center justify-center gap-1.5">
          <Sparkles size={12} /> Odporúčanie na dnes
        </p>
        <p className="text-sm text-on-surface leading-relaxed font-medium px-1">
          "{todayReason}"
        </p>
      </div>

      {/* Dynamic Feature 1: Live Beach Vibe & Activity Index */}
      <div className="w-full max-w-md bg-surface-container rounded-[28px] p-6 mb-6 border border-outline-variant/30 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Flame className="text-rose-500 animate-pulse shrink-0" size={20} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Live Atmosféra</h3>
          </div>
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            {vibeScore}% Aktivity
          </span>
        </div>

        <p className={`text-sm mb-4 transition-all duration-300 ${getVibeStatus(vibeScore).color}`}>
          {getVibeStatus(vibeScore).label}
        </p>

        {/* Meter Gauge Visual */}
        <div className="w-full bg-surface-variant/40 rounded-full h-3.5 mb-4 overflow-hidden relative border border-outline-variant/10">
          <div 
            className="bg-gradient-to-r from-sky-400 via-amber-400 to-rose-500 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${vibeScore}%` }}
          />
        </div>

        {/* Vote Breakdown stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 bg-surface-variant/20 rounded-[18px] p-3 text-[10px] border border-outline-variant/15 text-center font-mono">
          <div>
            <div className="text-sky-500 font-semibold mb-0.5">Oddych 🏖️</div>
            <div className="bg-sky-500/10 h-1.5 rounded-full w-full overflow-hidden mb-1">
              <div className="bg-sky-500 h-full" style={{ width: `${voteBreakdown.relax}%` }} />
            </div>
            <div className="font-bold text-on-surface-variant">{voteBreakdown.relax}%</div>
          </div>
          <div>
            <div className="text-amber-500 font-semibold mb-0.5">Flirt 😘</div>
            <div className="bg-amber-500/10 h-1.5 rounded-full w-full overflow-hidden mb-1">
              <div className="bg-amber-500 h-full" style={{ width: `${voteBreakdown.flirt}%` }} />
            </div>
            <div className="font-bold text-on-surface-variant">{voteBreakdown.flirt}%</div>
          </div>
          <div>
            <div className="text-rose-500 font-semibold mb-0.5">Akcia! 🔥</div>
            <div className="bg-rose-500/10 h-1.5 rounded-full w-full overflow-hidden mb-1">
              <div className="bg-rose-500 h-full" style={{ width: `${voteBreakdown.action}%` }} />
            </div>
            <div className="font-bold text-on-surface-variant">{voteBreakdown.action}%</div>
          </div>
        </div>

        {/* Voting row */}
        <div className="space-y-2">
          <p className="text-[11px] text-outline text-center font-medium">Ako to reálne vyzerá na pláži práve teraz podľa teba?</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'relax', label: '🏖️ Iba relax', bg: 'hover:bg-sky-500/10 active:bg-sky-500/20 border-sky-500/10 text-sky-500' },
              { type: 'flirt', label: '😘 Flirt', bg: 'hover:bg-amber-500/10 active:bg-amber-500/20 border-amber-500/10 text-amber-500' },
              { type: 'action', label: '🔥 Akcia!', bg: 'hover:bg-rose-500/10 active:bg-rose-500/20 border-rose-500/10 text-rose-500' }
            ].map((btn) => (
              <button
                key={btn.type}
                onClick={() => handleVoteVibe(btn.type as any)}
                className={`py-2 px-1 text-xs font-semibold rounded-full border transition-all active:scale-95 text-center ${
                  vibeVoted === btn.type 
                    ? 'bg-on-surface text-surface border-on-surface shadow-xs' 
                    : `bg-surface-variant/20 border-outline-variant/30 text-on-surface-variant ${btn.bg}`
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Feature 2: Sun & Hydration Safe-Nude Assistant */}
      <div className="w-full max-w-md bg-surface-container rounded-[28px] p-6 mb-8 border border-outline-variant/20 shadow-sm relative overflow-hidden">
        
        {/* Glowing background hint if alert is active */}
        {sunTimerAlert && (
          <div className="absolute inset-0 bg-error/10 border-2 border-error animate-pulse rounded-[28px] pointer-events-none" />
        )}

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Timer className="text-primary shrink-0" size={20} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Safe-Sun & Pitný režim</h3>
          </div>
          <span className="text-[10px] text-outline font-mono uppercase bg-surface-variant px-2.5 py-1 rounded-full border border-outline-variant/10">
            Nude Guard 🧴
          </span>
        </div>

        {/* UV Index Estimate Header based on Temperature */}
        <div className="mb-4 bg-surface-variant/30 rounded-[20px] p-3 text-xs leading-relaxed text-on-surface-variant">
          {weather ? (
            <div>
              <span className="font-semibold text-on-surface">Odhadovaný UV index: </span>
              {weather.temperature > 30 ? (
                <span className="text-rose-500 font-bold">8 (Veľmi vysoký! 🛑)</span>
              ) : weather.temperature > 24 ? (
                <span className="text-amber-500 font-bold">6 (Vysoký! ⚠️)</span>
              ) : (
                <span className="text-green-500 font-semibold">4 (Mierny 👍)</span>
              )}
              <p className="mt-1 text-outline text-[11px]">
                Bez ochrany krémom riskujete popáleniny už po {weather.temperature > 30 ? '15-20' : '25-30'} minútach pobytu na slnku.
              </p>
            </div>
          ) : (
            <p className="text-outline">Načítavam UV predpoveď...</p>
          )}
        </div>

        {/* Timer State Machine UI */}
        {sunTimer === null && !sunTimerAlert && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-on-surface-variant font-semibold">Spustiť pripomienku na slnku:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStartTimer(30, 'sunscreen')}
                className="py-2.5 px-1 text-xs font-semibold rounded-2xl bg-surface-variant hover:bg-outline-variant/20 border border-outline-variant/30 text-on-surface transition-all text-center flex flex-col items-center gap-0.5 active:scale-95"
              >
                <span>🧴 Krém</span>
                <span className="text-[10px] text-primary font-mono font-bold">30 min</span>
              </button>
              <button
                onClick={() => handleStartTimer(60, 'sunscreen')}
                className="py-2.5 px-1 text-xs font-semibold rounded-2xl bg-surface-variant hover:bg-outline-variant/20 border border-outline-variant/30 text-on-surface transition-all text-center flex flex-col items-center gap-0.5 active:scale-95"
              >
                <span>🧴 Krém</span>
                <span className="text-[10px] text-primary font-mono font-bold">60 min</span>
              </button>
              <button
                onClick={() => handleStartTimer(45, 'water')}
                className="py-2.5 px-1 text-xs font-semibold rounded-2xl bg-surface-variant hover:bg-outline-variant/20 border border-outline-variant/30 text-on-surface transition-all text-center flex flex-col items-center gap-0.5 active:scale-95"
              >
                <span>💦 Voda</span>
                <span className="text-[10px] text-secondary font-mono font-bold">45 min</span>
              </button>
            </div>
          </div>
        )}

        {sunTimer !== null && !sunTimerAlert && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                {sunTimerType === 'sunscreen' ? (
                  <>
                    <ShieldAlert className="text-primary" size={16} /> Aktívny krém filter
                  </>
                ) : (
                  <>
                    <Droplets className="text-secondary" size={16} /> Čas na hydratáciu
                  </>
                )}
              </span>
              <span className="text-lg font-mono font-bold text-on-surface bg-surface-variant/60 px-3 py-1 rounded-full">
                {formatTime(sunTimer)}
              </span>
            </div>

            {/* Timer visual progress bar */}
            <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${sunTimerType === 'sunscreen' ? 'bg-primary animate-pulse' : 'bg-secondary animate-pulse'}`}
                style={{ width: `${(sunTimer / sunTimerDuration) * 100}%` }}
              />
            </div>

            <button
              onClick={handleCancelTimer}
              className="mt-1 text-xs text-error font-semibold hover:bg-error/5 active:bg-error/10 border border-error/10 px-4 py-2 rounded-full transition-colors"
            >
              Zrušiť pripomienku
            </button>
          </div>
        )}

        {sunTimerAlert && (
          <div className="flex flex-col items-center text-center gap-3 py-1 animate-pulse">
            <div className="p-3 bg-error/10 rounded-full text-error border border-error/20">
              {sunTimerType === 'sunscreen' ? <ShieldAlert size={24} /> : <Droplets size={24} />}
            </div>
            <div>
              <p className="font-bold text-sm text-error uppercase tracking-wider">
                {sunTimerType === 'sunscreen' ? "⚠️ Čas na ochranný krém!" : "⚠️ Napite sa vody!"}
              </p>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                {sunTimerType === 'sunscreen' 
                  ? "Vaša nahá pokožka potrebuje ďalšiu vrstvu ochranného krému SPF! Chráňte sa pred spálením." 
                  : "Nezabúdajte na pravidelné pitie tekutín. Horúce počasie na pláži dehydruje organizmus!"}
              </p>
            </div>
            <button
              onClick={handleCancelTimer}
              className="bg-error text-on-error font-bold text-xs px-6 py-2.5 rounded-full transition-opacity hover:opacity-90 active:scale-95 mt-1"
            >
              Rozumiem (Vypnúť)
            </button>
          </div>
        )}

        {/* Expandable Nude Safety Tips Accordion */}
        <div className="mt-4 pt-3.5 border-t border-outline-variant/20">
          <button
            onClick={() => {
              setShowNudeSafetyTips(!showNudeSafetyTips);
              if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                try { window.navigator.vibrate(8); } catch (e) {}
              }
            }}
            className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:text-primary-container/80 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info size={14} /> Tipy pre zdravé nudaplážovanie
            </span>
            <span className="text-[10px] bg-primary/5 px-2 py-0.5 rounded-full">
              {showNudeSafetyTips ? "Skryť" : "Ukázať"}
            </span>
          </button>
          
          {showNudeSafetyTips && (
            <div className="mt-3 text-xs text-on-surface-variant/90 leading-relaxed space-y-2 bg-surface-variant/20 rounded-2xl p-3 border border-outline-variant/10">
              <p>
                <strong>• Ochrana citlivých partií:</strong> Miesta, ktoré bežne nevidno na slnku (napr. zadok, genitálie, hruď) majú jemnejšiu pokožku a spália sa oveľa skôr. Vždy aplikuj krém s vysokým faktorom SPF 30-50+.
              </p>
              <p>
                <strong>• Zvýšená dehydratácia:</strong> Bez oblečenia sa pot z pokožky odparuje rýchlejšie, čo urýchľuje dehydratáciu. Pite aspoň 2.5 - 3 litre čistej vody denne.
              </p>
              <p>
                <strong>• Bezpečnosť v tieni:</strong> Aj v tieni lesíka preniká až 50 % UV lúčov cez koruny stromov a odráža sa od piesku aj vody. Ochrana je preto nutná aj tam!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-medium text-on-background mb-4 flex items-center gap-2">
          <MessageSquarePlus size={24} className="text-primary" />
          Live Status
        </h2>

        {authError && (
          <div className="mb-4 p-4 bg-error-container text-on-error-container rounded-[24px] text-sm">
            {authError}
          </div>
        )}

        {/* Hidden Fallback Input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Check-in Form */}
        {user ? (
          <div className="mb-6 bg-surface-container rounded-[28px] p-4 border border-outline-variant/30 shadow-sm">
            
            {/* Live Camera Feed inside Form panel */}
            {showCamera && (
              <div className="mb-4 overflow-hidden rounded-[24px] bg-black relative flex flex-col items-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-56 object-cover"
                />
                
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/80 text-center text-white text-sm">
                    <AlertCircle className="text-error mb-2" size={32} />
                    <p className="mb-3">{cameraError}</p>
                    <button 
                      onClick={triggerFileSelect}
                      className="bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-semibold"
                    >
                      Zvoliť fotku z galérie
                    </button>
                  </div>
                ) : (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4 px-4">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="bg-white text-black p-3 rounded-full hover:scale-105 transition-transform font-bold text-xs flex items-center gap-1 shadow-lg"
                    >
                      <Camera size={16} /> Odfotiť
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors font-semibold text-xs shadow-lg"
                    >
                      Zrušiť
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Selected / Captured Image Preview */}
            {photo && (
              <div className="mb-4 relative rounded-[20px] overflow-hidden bg-surface-variant max-h-48 flex justify-center items-center">
                <img 
                  src={photo} 
                  alt="Predbežný náhľad pláže" 
                  referrerPolicy="no-referrer"
                  className="max-h-48 w-full object-cover rounded-[20px]"
                />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/95 transition-colors shadow"
                  aria-label="Odstrániť fotku"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Quick Tags row */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-0.5">
                {["Veľa ľudí 👥", "Čistá voda 🌊", "Teplá voda ☀️", "Cruising 🔥", "Tieň 🌳", "Bezvetrie 🍃"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setNewCheckIn((prev) => {
                        const trimmed = prev.trim();
                        return trimmed ? `${trimmed} ${tag}` : tag;
                      });
                      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                        try { window.navigator.vibrate(5); } catch (e) {}
                      }
                    }}
                    className="text-[11px] bg-surface-variant hover:bg-outline-variant/20 active:bg-outline-variant/40 text-on-surface-variant px-2.5 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium border border-outline-variant/10 shrink-0"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newCheckIn}
                  onChange={(e) => setNewCheckIn(e.target.value)}
                  placeholder={photo ? "Pridaj popis k fotke..." : "Kde si? Aká je situácia?"}
                  className="flex-1 rounded-full px-5 py-4 focus:outline-none bg-surface-variant text-on-surface-variant placeholder:text-outline text-sm"
                  maxLength={100}
                  disabled={isSubmitting}
                />
                
                <button
                  type="button"
                  onClick={showCamera ? stopCamera : startCamera}
                  className={`p-4 rounded-full transition-colors shrink-0 ${
                    showCamera ? 'bg-error-container text-on-error-container' : 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant/30'
                  }`}
                  title="Odfotiť aktuálnu situáciu"
                  disabled={isSubmitting}
                >
                  <Camera size={20} />
                </button>

                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="p-4 rounded-full bg-surface-variant text-on-surface-variant hover:bg-outline-variant/30 transition-colors shrink-0"
                  title="Nahrať fotku z galérie"
                  disabled={isSubmitting}
                >
                  <ImageIcon size={20} />
                </button>
              </div>

              <div className="flex justify-end mt-1">
                <button
                  type="submit"
                  disabled={(!newCheckIn.trim() && !photo) || isSubmitting}
                  className="bg-primary text-on-primary px-8 py-3.5 rounded-full font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-sm w-full sm:w-auto"
                >
                  Poslať status
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <button
              onClick={handleSignIn}
              className="bg-surface-container-high text-on-surface px-8 py-4 rounded-full font-medium hover:opacity-90 transition-opacity w-full border border-outline-variant"
            >
              Prihlásiť sa cez Google pre pridanie statusu a fotiek
            </button>
          </div>
        )}

        {/* Search and Filters Bar */}
        <div className="mb-6 space-y-3 bg-surface-container/60 p-4 rounded-[28px] border border-outline-variant/20 shadow-xs">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-outline" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Vyhľadať v statusoch..."
              className="w-full bg-surface-variant/40 hover:bg-surface-variant/70 focus:bg-surface-variant rounded-full py-3.5 pl-11 pr-4 focus:outline-none text-sm text-on-surface placeholder:text-outline transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-outline hover:text-on-surface"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Tag Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none items-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-outline pr-1 shrink-0 flex items-center gap-1">
              <Filter size={11} /> Filter:
            </span>
            <button
              onClick={() => setSelectedTagFilter(null)}
              className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-semibold ${
                selectedTagFilter === null
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-variant/40 hover:bg-surface-variant/70 text-on-surface-variant'
              }`}
            >
              Všetky
            </button>
            {["Veľa ľudí 👥", "Čistá voda 🌊", "Teplá voda ☀️", "Cruising 🔥", "Tieň 🌳", "Bezvetrie 🍃"].map((tag) => {
              const cleanTag = tag.split(' ')[0]; // match word to filter
              const isActive = selectedTagFilter === cleanTag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTagFilter(isActive ? null : cleanTag)}
                  className={`text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-semibold ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-variant/40 hover:bg-surface-variant/70 text-on-surface-variant'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mock Ad Banner for Free Users */}
        {!isPremium && (
          <div className="mb-4 bg-surface-container/40 p-4 rounded-[24px] border border-outline-variant/15 flex items-center justify-between gap-3 relative overflow-hidden shadow-xs">
            <span className="absolute top-0 right-0 bg-outline-variant/40 text-[7px] font-bold text-on-surface-variant px-2 py-0.5 rounded-bl-xl uppercase tracking-wider font-mono">Sponzorované</span>
            <div className="flex items-center gap-3">
              <span className="text-2xl shrink-0">🍻</span>
              <div>
                <p className="text-xs font-bold text-on-surface">Smädný na pláži? Bufet "U Joža" chladí!</p>
                <p className="text-[10px] text-on-surface-variant leading-snug mt-0.5">Najlepšia čapovaná kofola a čerstvé teplé langoše na Zlatých Pieskoch.</p>
              </div>
            </div>
            <button 
              onClick={onUpgradeClick} 
              className="text-[9px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-1.5 rounded-full whitespace-nowrap border border-amber-500/20 active:scale-95 transition-all"
            >
              Bez reklám 👑
            </button>
          </div>
        )}

        {/* Check-ins List */}
        <div className="space-y-4">
          {(() => {
            const filteredCheckIns = checkIns.filter(item => {
              const matchesSearch = searchQuery.trim() === '' || 
                item.text.toLowerCase().includes(searchQuery.toLowerCase());
              
              const matchesTag = !selectedTagFilter || 
                item.text.toLowerCase().includes(selectedTagFilter.toLowerCase());
                
              return matchesSearch && matchesTag;
            });

            if (filteredCheckIns.length === 0) {
              return (
                <div className="text-center py-8 bg-surface-container/30 rounded-3xl border border-dashed border-outline-variant/30 px-4">
                  <p className="text-sm text-outline">Nenašli sa žiadne statusy pre vybraný filter.</p>
                  {(searchQuery || selectedTagFilter) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTagFilter(null);
                      }}
                      className="mt-3 text-xs text-primary font-bold hover:underline"
                    >
                      Zrušiť filtre
                    </button>
                  )}
                </div>
              );
            }

            return filteredCheckIns.map((checkIn) => {
              // Generate beautiful unique persistent gradients based on user id string sum
              const charSum = checkIn.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const gradients = [
                'from-rose-500 to-pink-500 text-white',
                'from-indigo-500 to-purple-500 text-white',
                'from-sky-500 to-blue-600 text-white',
                'from-emerald-500 to-teal-500 text-white',
                'from-amber-500 to-orange-500 text-white',
                'from-fuchsia-500 to-pink-600 text-white',
              ];
              const avatarGrad = gradients[charSum % gradients.length];

              return (
                <div key={checkIn.id} className="bg-surface-container-high p-5 rounded-[24px] border border-outline-variant/20 hover:border-outline-variant/50 transition-all flex flex-col gap-3 shadow-sm hover:shadow-md">
                  
                  {/* Photo attached */}
                  {checkIn.photo && (
                    <div 
                      onClick={() => {
                        if (isPremium) {
                          setFullscreenPhoto(checkIn);
                        } else {
                          onUpgradeClick();
                        }
                      }}
                      className="relative cursor-pointer rounded-[18px] overflow-hidden group bg-black/5 dark:bg-white/5 aspect-[4/3] flex items-center justify-center border border-outline-variant/10"
                    >
                      <img 
                        src={checkIn.photo} 
                        alt="Stav pláže" 
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300 ${!isPremium ? 'blur-md brightness-75' : ''}`}
                        loading="lazy"
                      />
                      {!isPremium ? (
                        <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4">
                          <Lock size={26} className="text-amber-400 mb-2 animate-bounce" />
                          <span className="text-xs font-extrabold text-white uppercase tracking-wider">Odomknúť HD Foto naživo</span>
                          <span className="text-[10px] text-white/90 mt-1">Dostupné iba pre VIP členov 💎</span>
                        </div>
                      ) : (
                        <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white p-2.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={14} />
                        </div>
                      )}
                    </div>
                  )}

                  {checkIn.text && (
                    <p className="text-on-surface text-sm font-normal leading-relaxed whitespace-pre-wrap px-1">
                      {checkIn.text}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-xs text-on-surface-variant pt-2.5 border-t border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center font-bold text-[10px] tracking-wider shadow-inner text-white`}>
                        {checkIn.userId.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-mono font-semibold">
                        Lovčí #{checkIn.userId.slice(0, 4)}
                      </span>
                    </div>
                    <span className="text-outline font-medium">
                      {checkIn.timestamp ? format(checkIn.timestamp, 'HH:mm') : 'Práve teraz'}
                    </span>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Lightbox / Fullscreen Modal */}
      {fullscreenPhoto && (
        <div 
          className="fixed inset-0 z-[2000] bg-black/95 flex flex-col justify-between p-4"
          onClick={() => setFullscreenPhoto(null)}
        >
          {/* Header */}
          <div className="flex justify-between items-center text-white/90 pt-safe px-2">
            <div>
              <p className="font-medium text-sm">
                Zdieľal Lovčí #{fullscreenPhoto.userId.slice(0, 4)}
              </p>
              <p className="text-xs text-white/60">
                {fullscreenPhoto.timestamp ? format(fullscreenPhoto.timestamp, 'HH:mm d. MMMM') : 'Práve teraz'}
              </p>
            </div>
            <button 
              onClick={() => setFullscreenPhoto(null)}
              className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              aria-label="Zatvoriť"
            >
              <X size={20} />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-2 max-h-[70vh]">
            <img 
              src={fullscreenPhoto.photo} 
              alt="Pláž zväčšená" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Footer Caption */}
          <div 
            className="bg-black/40 backdrop-blur-md p-5 rounded-[24px] mb-safe mx-2 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-sm font-light leading-relaxed">
              {fullscreenPhoto.text || "Bez popisu"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

