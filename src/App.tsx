/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TodayScreen } from './components/TodayScreen';
import { MapScreen } from './components/MapScreen';
import { SafetyScreen } from './components/SafetyScreen';
import { PullToRefresh } from './components/PullToRefresh';
import { OnboardingCoachMark } from './components/OnboardingCoachMark';
import { 
  Calendar, 
  Map as MapIcon, 
  ShieldAlert, 
  Moon, 
  Sun, 
  HelpCircle, 
  Crown, 
  Gem, 
  Check, 
  X, 
  Sparkles, 
  Lock, 
  ShieldCheck,
  Flame,
  Camera,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'map' | 'safety'>('today');
  const [isDark, setIsDark] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Freemium states
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem('zp_cruiser_is_premium') === 'true';
  });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'season' | 'lifetime'>('season');
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    triggerHaptic();
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(15); // short 15ms pulse for tactile button press
      } catch (e) {
        // Safe catch-all for vibration permissions or compatibility blocks
      }
    }
  };

  const handleTabChange = (tab: 'today' | 'map' | 'safety') => {
    setActiveTab(tab);
    triggerHaptic();
  };

  const handleRefresh = async () => {
    // Elegant network/API reload simulation delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setRefreshKey((prev) => prev + 1);
  };

  const handleTogglePremium = (val: boolean) => {
    setIsPremium(val);
    localStorage.setItem('zp_cruiser_is_premium', val ? 'true' : 'false');
    triggerHaptic();
  };

  const handlePurchaseVIP = () => {
    triggerHaptic();
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      setPaymentSuccess(true);
      handleTogglePremium(true);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try {
          window.navigator.vibrate([100, 50, 100]);
        } catch (e) {}
      }
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPaywall(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-on-background font-sans transition-colors duration-300">
      {/* Top App Bar (M3 Small) */}
      <header className="bg-surface px-4 py-4 flex items-center justify-between shrink-0 border-b border-outline-variant/10 shadow-xs z-10">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2.5">
          <img src="/icon.svg" alt="ZP Cruiser Logo" title="ZP Cruiser Home" referrerPolicy="no-referrer" className="w-8 h-8 rounded-lg object-cover" />
          <span>ZP Cruiser</span>
        </h1>
        <div className="flex items-center gap-1.5">
          {/* Freemium Status Indicator Button */}
          <button
            onClick={() => { setShowPaywall(true); triggerHaptic(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              isPremium 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs hover:shadow-md animate-pulse'
                : 'bg-primary text-on-primary hover:opacity-95'
            }`}
          >
            {isPremium ? (
              <>
                <Gem size={14} className="animate-spin-slow" />
                <span>VIP Aktívne</span>
              </>
            ) : (
              <>
                <Crown size={14} />
                <span>Získať VIP</span>
              </>
            )}
          </button>

          <button 
            onClick={() => { setShowOnboarding(true); triggerHaptic(); }}
            className="p-2 rounded-full hover:bg-surface-variant transition-colors"
            title="Sprievodca aplikáciou"
            aria-label="Sprievodca aplikáciou"
          >
            <HelpCircle className="text-on-surface" size={24} />
          </button>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-variant transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="text-on-surface" size={24} /> : <Moon className="text-on-surface" size={24} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <PullToRefresh onRefresh={handleRefresh}>
          {activeTab === 'today' && (
            <TodayScreen 
              key={`today-${refreshKey}`} 
              isPremium={isPremium} 
              onUpgradeClick={() => setShowPaywall(true)} 
            />
          )}
          {activeTab === 'map' && (
            <MapScreen 
              key={`map-${refreshKey}`} 
              isPremium={isPremium} 
              onUpgradeClick={() => setShowPaywall(true)} 
            />
          )}
          {activeTab === 'safety' && (
            <SafetyScreen 
              key={`safety-${refreshKey}`} 
              isPremium={isPremium} 
              onUpgradeClick={() => setShowPaywall(true)} 
            />
          )}
        </PullToRefresh>
      </main>

      {/* Bottom Navigation (M3) */}
      <nav className="bg-surface-container flex items-center justify-around shrink-0 h-[80px] pb-safe px-2 border-t border-outline-variant/10">
        <button
          onClick={() => handleTabChange('today')}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
        >
          <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-colors ${
            activeTab === 'today' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
          }`}>
            <Calendar size={24} className={activeTab === 'today' ? 'fill-primary-container' : ''} />
          </div>
          <span className={`text-xs font-semibold ${activeTab === 'today' ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
            Dnes
          </span>
        </button>

        <button
          onClick={() => handleTabChange('map')}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
        >
          <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-colors ${
            activeTab === 'map' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
          }`}>
            <MapIcon size={24} className={activeTab === 'map' ? 'fill-primary-container' : ''} />
          </div>
          <span className={`text-xs font-semibold ${activeTab === 'map' ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
            Mapa
          </span>
        </button>

        <button
          onClick={() => handleTabChange('safety')}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-full"
        >
          <div className={`flex items-center justify-center w-16 h-8 rounded-full transition-colors ${
            activeTab === 'safety' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
          }`}>
            <ShieldAlert size={24} className={activeTab === 'safety' ? 'fill-primary-container' : ''} />
          </div>
          <span className={`text-xs font-semibold ${activeTab === 'safety' ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
            Bezpečnosť
          </span>
        </button>
      </nav>

      <OnboardingCoachMark forceShow={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* Spectacular VIP Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isSimulatingPayment) setShowPaywall(false); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-surface border border-outline-variant/30 rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col"
            >
              {/* Header block with elegant gradient background */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white text-center relative shrink-0">
                <button
                  onClick={() => setShowPaywall(false)}
                  disabled={isSimulatingPayment}
                  className="absolute top-4 right-4 bg-black/20 hover:bg-black/35 text-white p-1.5 rounded-full transition-colors active:scale-90"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
                
                <div className="mx-auto w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-3.5 shadow-inner">
                  <Crown size={28} className="text-white animate-pulse" />
                </div>
                <h2 className="text-xl font-extrabold tracking-tight uppercase">ZP Cruiser Premium</h2>
                <p className="text-xs text-white/95 mt-1 font-medium">Uži si leto na Zlatých Pieskoch naplno a bez limitov</p>
              </div>

              {/* Scrollable Content inside Paywall */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[380px] space-y-4">
                
                {/* Premium features checklist */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-outline uppercase tracking-wider">Aké VIP výhody získaš?</h3>
                  
                  <div className="space-y-2.5">
                    <div className="flex gap-3 bg-surface-variant/20 p-3 rounded-2xl border border-outline-variant/10">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Camera size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">HD Fotky & Stav Pláže naživo</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                          Zobrazuj si reálne, čisté fotografie stavu pláže a osadenstva nahrané inými používateľmi v plnom rozlíšení bez rozmazania.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-surface-variant/20 p-3 rounded-2xl border border-outline-variant/10">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <Flame size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Exkluzívny "Cruising & Flirt" Radar</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                          Pokročilé informácie o tom, ktoré zóny pláže a lesíka sú najaktívnejšie, vrátane percentuálneho vyjadrenia oddychu, flirtu a akcie.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-surface-variant/20 p-3 rounded-2xl border border-outline-variant/10">
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                        <EyeOff size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Anonymný Inkognito Režim</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                          Hlasuj za situáciu a pridávaj check-iny úplne anonymne bez zaznamenávania akéhokoľvek identifikátora alebo účtu Google.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 bg-surface-variant/20 p-3 rounded-2xl border border-outline-variant/10">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Smart Nude Guard Pro bez reklám</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                          Hodinové hlásenia UV indexu, pokročilé pripomienky na opaľovací krém a aplikácia bez akýchkoľvek otravných bannerov a sponzorstiev.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plans Selection Widget */}
                <div className="space-y-2.5 pt-1">
                  <h3 className="text-xs font-bold text-outline uppercase tracking-wider">Vyber si svoje predplatné:</h3>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Monthly plan */}
                    <button
                      onClick={() => { setBillingCycle('monthly'); triggerHaptic(); }}
                      disabled={isSimulatingPayment}
                      className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center relative ${
                        billingCycle === 'monthly'
                          ? 'bg-primary-container/20 border-primary shadow-xs'
                          : 'bg-surface-variant/30 border-outline-variant/20 hover:bg-surface-variant/60'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-outline">1 Mesiac</span>
                      <span className="text-base font-extrabold text-on-surface mt-1.5">3.99 €</span>
                      <span className="text-[9px] text-on-surface-variant mt-0.5">3.99€ / mes.</span>
                    </button>

                    {/* Season Pass */}
                    <button
                      onClick={() => { setBillingCycle('season'); triggerHaptic(); }}
                      disabled={isSimulatingPayment}
                      className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center relative overflow-hidden ${
                        billingCycle === 'season'
                          ? 'bg-primary-container/20 border-primary shadow-xs'
                          : 'bg-surface-variant/30 border-outline-variant/20 hover:bg-surface-variant/60'
                      }`}
                    >
                      {/* Popular Badge */}
                      <div className="absolute top-0 right-0 bg-amber-500 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-bl-lg tracking-tighter scale-90 uppercase">
                        POPULÁR
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Celé Leto</span>
                      <span className="text-base font-extrabold text-on-surface mt-1.5">9.99 €</span>
                      <span className="text-[9px] text-on-surface-variant mt-0.5">Len 2.49€ / mes.</span>
                    </button>

                    {/* Lifetime pass */}
                    <button
                      onClick={() => { setBillingCycle('lifetime'); triggerHaptic(); }}
                      disabled={isSimulatingPayment}
                      className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center relative ${
                        billingCycle === 'lifetime'
                          ? 'bg-primary-container/20 border-primary shadow-xs'
                          : 'bg-surface-variant/30 border-outline-variant/20 hover:bg-surface-variant/60'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Doživotne</span>
                      <span className="text-base font-extrabold text-on-surface mt-1.5">19.99 €</span>
                      <span className="text-[9px] text-on-surface-variant mt-0.5">Jednorazovo</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Purchase Footer Panel */}
              <div className="p-5 border-t border-outline-variant/10 bg-surface-container/30 flex flex-col gap-3 shrink-0">
                {paymentSuccess ? (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="w-full bg-emerald-500 text-white font-bold py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2"
                  >
                    <Check size={20} className="animate-bounce" />
                    <span>VIP Úspešne Aktivované! 💎</span>
                  </motion.div>
                ) : (
                  <button
                    onClick={handlePurchaseVIP}
                    disabled={isSimulatingPayment}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold py-3.5 px-4 rounded-2xl text-center flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isSimulatingPayment ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Aktivovať VIP za {billingCycle === 'monthly' ? '3.99 €' : billingCycle === 'season' ? '9.99 €' : '19.99 €'}</span>
                      </>
                    )}
                  </button>
                )}
                
                <p className="text-[10px] text-outline text-center leading-normal">
                  Bezpečný nákup prostredníctvom Apple Pay, Google Pay alebo platobnej karty. Zrušiť predplatné môžete kedykoľvek jedným kliknutím.
                </p>

                {/* Developer Switch for easy UI toggling in AI Studio Applet Preview */}
                <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-outline font-bold uppercase tracking-wider flex items-center gap-1">
                    🔧 Dev-prepínač (Testovanie):
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePremium(false)}
                      className={`text-[9px] font-mono px-2 py-1 rounded-md border font-semibold ${
                        !isPremium ? 'bg-outline text-surface border-outline' : 'bg-transparent border-outline-variant/30 text-outline'
                      }`}
                    >
                      FREE-Mód
                    </button>
                    <button
                      onClick={() => handleTogglePremium(true)}
                      className={`text-[9px] font-mono px-2 py-1 rounded-md border font-semibold ${
                        isPremium ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent' : 'bg-transparent border-outline-variant/30 text-outline'
                      }`}
                    >
                      VIP-Mód
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

