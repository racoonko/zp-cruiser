import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Map as MapIcon, ShieldAlert, X, HelpCircle, ChevronRight, Check } from 'lucide-react';

interface OnboardingCoachMarkProps {
  onClose?: () => void;
  forceShow?: boolean;
}

export function OnboardingCoachMark({ onClose, forceShow = false }: OnboardingCoachMarkProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      setCurrentStep(0);
      return;
    }
    const hasVisited = localStorage.getItem('zp_cruiser_onboarded_v2');
    if (!hasVisited) {
      // Small timeout for smooth entrance after the app loads
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleDismiss = () => {
    localStorage.setItem('zp_cruiser_onboarded_v2', 'true');
    setIsOpen(false);
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate([15, 10, 15]); } catch (e) {}
    }
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(10); } catch (e) {}
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  const steps = [
    {
      title: "Vitaj v ZP Cruiser!",
      subtitle: "Komunitný sprievodca pre nudapláž Zlaté Piesky",
      description: "Pripravili sme pre teba moderného sprievodcu plážou, ktorý spája komunitné statusy s dôležitými informáciami. Pozri si krátkeho sprievodcu našimi 3 hlavnými tabmi.",
      icon: <HelpCircle className="text-primary w-12 h-12" />,
      colorClass: "bg-primary/10 border-primary/20 text-primary",
    },
    {
      title: "1. Tab: Dnes",
      subtitle: "Aktuálna situácia & Fotky z pláže",
      description: "Zdieľaj a prezeraj si aktuálne statusy a reálne fotky pláže od ostatných návštevníkov. Zisti hneď ráno dôvod prečo ísť na pláž a sleduj živé informácie o počasí.",
      icon: <Calendar className="text-primary w-12 h-12" />,
      colorClass: "bg-primary/10 border-primary/20 text-primary",
      highlightTab: 'today'
    },
    {
      title: "2. Tab: Mapa",
      subtitle: "Prehľad plážových zón",
      description: "Objavuj dôležité zóny, orientačné body a nudistickú časť pláže priamo na integrovanej interaktívnej mape plnej užitočných bodov záujmu.",
      icon: <MapIcon className="text-secondary w-12 h-12" />,
      colorClass: "bg-secondary/10 border-secondary/20 text-secondary",
      highlightTab: 'map'
    },
    {
      title: "3. Tab: Bezpečnosť",
      subtitle: "SOS kontakty & Prvá pomoc",
      description: "Ak sa ocitneš v nebezpečenstve alebo si svedkom nevhodného správania, rýchlo použi SOS poplach alebo nájdi dôležité bezpečnostné kontakty pre okamžitú pomoc.",
      icon: <ShieldAlert className="text-error w-12 h-12" />,
      colorClass: "bg-error/10 border-error/20 text-error",
      highlightTab: 'safety'
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-xs">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={handleDismiss} />

        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative bg-surface w-full max-w-md rounded-[32px] overflow-hidden p-6 shadow-2xl border border-outline-variant/30 z-10 flex flex-col gap-6"
        >
          {/* Header */}
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-outline uppercase tracking-wider bg-surface-container px-3 py-1.5 rounded-full">
              Krok {currentStep + 1} z {steps.length}
            </span>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
              aria-label="Zatvoriť sprievodcu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Animated step switcher */}
          <div className="min-h-[220px] flex flex-col items-center text-center justify-center gap-4">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`p-4 rounded-[24px] border ${steps[currentStep].colorClass}`}>
                {steps[currentStep].icon}
              </div>

              <div className="space-y-1.5 px-2">
                <h2 className="text-xl font-bold tracking-tight text-on-surface">
                  {steps[currentStep].title}
                </h2>
                <h3 className="text-sm font-semibold text-primary">
                  {steps[currentStep].subtitle}
                </h3>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed font-light px-2">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </div>

          {/* Indicators & Navigation Footer */}
          <div className="flex flex-col gap-4">
            {/* Dots */}
            <div className="flex justify-center gap-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                      try { window.navigator.vibrate(5); } catch (e) {}
                    }
                    setCurrentStep(idx);
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-primary' : 'w-2.5 bg-outline-variant/50 hover:bg-outline-variant'
                  }`}
                  aria-label={`Prejsť na krok ${idx + 1}`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-1">
              {currentStep > 0 && (
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                      try { window.navigator.vibrate(8); } catch (e) {}
                    }
                    setCurrentStep(currentStep - 1);
                  }}
                  className="flex-1 py-3.5 rounded-full bg-surface-container text-on-surface hover:bg-surface-variant font-semibold text-sm transition-colors text-center"
                >
                  Späť
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 rounded-full bg-primary text-on-primary hover:opacity-90 font-semibold text-sm transition-opacity flex items-center justify-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Rozumiem! <Check size={16} />
                  </>
                ) : (
                  <>
                    Ďalej <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
