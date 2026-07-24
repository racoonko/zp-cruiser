import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ThumbsUp, 
  HelpCircle, 
  ShieldAlert, 
  MapPin, 
  Users, 
  CameraOff, 
  Clock, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Compass, 
  Info, 
  X, 
  Plus,
  ShieldCheck,
  Flame,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQScreenProps {
  isPremium: boolean;
  onUpgradeClick: () => void;
  onNavigateToSafety?: () => void;
  onNavigateToMap?: () => void;
  key?: string;
}

export interface FAQItem {
  id: string;
  category: 'etiketa' | 'navigacia' | 'komunita' | 'bezpecnost' | 'vip';
  question: string;
  answer: string;
  bulletPoints?: string[];
  warningNote?: string;
  isVip?: boolean;
  helpfulCount: number;
  tags: string[];
  badgeText?: string;
}

const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'etiketa',
    question: 'Pravidlá pre fotenie a smartfóny: Je povolené fotografovanie?',
    badgeText: 'NULOVÁ TOLERANCIA',
    answer: 'PRÍSNE ZÁKAZANÉ. Zákaz fotografovania, nahrávania videa a videohovorov platí bez výnimky na celej trávnatej pláži, móle, vo vode aj v zóne Lesík. Mobilné telefóny musia byť odložené v taške alebo položené displejom nadol.',
    bulletPoints: [
      'Fotoaparáty a kamery udržujte neustále zakryté alebo schované.',
      'Akékoľvek mierenie objektívom na iných návštevníkov bude považované za hrubé porušenie súkromia.',
      'Sankcia: Okamžité vykázanie z pláže, doživotný zákaz vstupu v komunitnom systéme a nahlásenie Policajnému zboru SR.'
    ],
    warningNote: 'Ochrana osobnostných práv a súkromia je na ZP Cruiser na 1. mieste.',
    helpfulCount: 248,
    tags: ['fotenie', 'kamery', 'mobil', 'pravidla', 'policia', 'sukromie']
  },
  {
    id: 'faq-2',
    category: 'etiketa',
    question: 'Aké sú explicitné pravidlá pre nahotu a nosenie plaviek?',
    badgeText: 'NATURIZMUS',
    answer: 'ZP Cruiser je naturistická (nudistická) pláž. Nahota je prirodzenou normou, ktorá stiera sociálne bariéry a zaručuje rovnocennosť všetkých návštevníkov.',
    bulletPoints: [
      'Nováčikovia: Aklimatizácia s uterákom omotaným okolo pása je akceptovaná počas prvých 10–15 minút.',
      'Trvalé nosenie plaviek: Dlhodobý pobyt v plavkách na hlavnej trávnatej pláži vytvára nerovnováhu a nepohodlie pre ostatných.',
      'Oblečené zóny: Ak si želáte zostať v oblečení alebo plavkách, prosíme využiť obvyklé pláže kempu Zlaté Piesky mimo označeného sektoru nudapláže.'
    ],
    helpfulCount: 182,
    tags: ['nahota', 'plavky', 'naturizmus', 'textil', 'novacik']
  },
  {
    id: 'faq-3',
    category: 'komunita',
    question: 'Ako funguje zóna "Lesík / Cruising" a aké sú pravidlá súhlasu?',
    badgeText: 'EXPLICITNÝ SÚHLAS',
    answer: 'Zóna Lesík za hlavnou plážou je tradičné miesto pre tiene, prechádzky a neformálne zoznamovanie. Rešpektovanie osobných hraníc je absolútnou podmienkou.',
    bulletPoints: [
      'Pravidlo SÚHLASU: Vždy sa uistite, že druhá osoba má explicitný a dobrovoľný záujem o kontakt. "NIE" znamená NIE okamžite a bez výhovoriek.',
      'Neverbálne signály: Očný kontakt alebo úsmev neznamená automatický súhlas k fyzickému dotyku.',
      'Pravidlo vzdialenosti: Neukladajte sa ani sa nepribližujte k cudzej osobe bez vyzvania.',
      'Nulová tolerancia: Akékoľvek obťažovanie, sledovanie bez súhlasu alebo agresívne správanie bude hlásené SBS a polícii.'
    ],
    warningNote: 'V zóne Lesík sa vyžaduje stopercentný vzájomný rešpekt a súhlas oboch strán.',
    helpfulCount: 210,
    tags: ['lesik', 'cruising', 'suhlas', 'zoznamka', 'granice', 'bezpecnost']
  },
  {
    id: 'faq-4',
    category: 'etiketa',
    question: 'Pravidlo použiť uterák: Aká je hygiena na lavičkách a trávniku?',
    badgeText: 'HYGIENA',
    answer: 'Sedieť alebo ležať holým telom priamo na spoločnom nábytku alebo trávniku je z hygienických dôvodov zakázané.',
    bulletPoints: [
      'Vždy použite vlastný uterák alebo rozloženú osušku pod celé telo.',
      'Platí na drevených ležadlách, lavičkách, v stoloch pri bufete aj na spoločnej trati.',
      'Po kúpaní v jazere sa odporúča uterák vymeniť alebo vysušiť.'
    ],
    helpfulCount: 134,
    tags: ['uterak', 'hygiena', 'sedadla', 'bufet', 'osuska']
  },
  {
    id: 'faq-5',
    category: 'navigacia',
    question: 'Presný návod: Ako sa dostať na pláž ZP Cruiser a kde parkovať?',
    badgeText: 'NAVIGÁCIA',
    answer: 'Pláž sa nachádza na južnom brehu jazera Zlaté Piesky v Bratislave (Ružinov).',
    bulletPoints: [
      'MHD: Električka č. 4 na konečnú stanicu "Zlaté Piesky". Prejdite cez hlavnú bránu kempu smerom k južnému brehu (cca 8 minút pešo).',
      'Autom: Parkovanie na záchytnom parkovisku pred vstupom do kempu Zlaté Piesky z Seneckej cesty.',
      'Bicyklom / Kolobežkou: Cyklochodník vedie priamo ku vstupu. Na pláži sú k dispozícii stojany na bicykle.'
    ],
    helpfulCount: 165,
    tags: ['doprava', 'pristup', 'mhd', 'parkovanie', 'mapa', 'elektricka']
  },
  {
    id: 'faq-6',
    category: 'navigacia',
    question: 'Aké sú otváracie hodiny pláže, kempu a bufetov?',
    badgeText: '24/7 PRÍSTUP',
    answer: 'Nudapláž je prírodný verejný sektor a je otvorená NON-STOP 24 hodín denne, 7 dní v týždni.',
    bulletPoints: [
      'Kemping brána: Hlavný vstup kempu zatvára recepciu o 22:00. Po 22:00 je možný obchádzkový prístup okolo jazera.',
      'Plážové bufety: Bývajú otvorené počas letnej sezóny cca od 10:00 do 20:00 v závislosti od počasia.',
      'Nočný režim: V noci po 22:00 odporúčame nosiť svietidlo a dodržiavať nočný kľud.'
    ],
    helpfulCount: 128,
    tags: ['otvaracie hodiny', 'nonstop', 'bufet', 'kemp', 'noc']
  },
  {
    id: 'faq-7',
    category: 'bezpecnost',
    question: 'Čo robiť v prípade obťažovania, ohrozenia alebo krádeže?',
    badgeText: 'BEZPEČNOSTNÝ PROTOKOL',
    answer: 'Vaša fyzická a psychická pohoda je pre nás na prvom mieste.',
    bulletPoints: [
      'Aplikácia ZP Cruiser: V záložke "Bezpečnosť" stlačte tlačidlo "SOS Siréna" pre hlasný výstražný zvuk.',
      'Časovač návratu: Aktivujte si časovač pri prechádzke lesíkom. Ak ho nepotvrdíte, aplikácia vás upozorní.',
      'Tiesňové linky: Volať 158 (Mestská / Štátna polícia) alebo 112.',
      'Priamy zásah: Nebojte sa osloviť susedov na pláži alebo správcu kempu.'
    ],
    warningNote: 'Akékoľvek nežiaduce konanie nahlasujte ihneď.',
    helpfulCount: 215,
    tags: ['bezpecnost', 'sos', 'pomoc', 'obttazovanie', 'policia', 'sirena']
  },
  {
    id: 'faq-8',
    category: 'etiketa',
    question: 'Čo ak nastane prirodzená telesná reakcia (erekcia)?',
    badgeText: 'RADA PRE ZAČIATOČNÍKOV',
    answer: 'Telo môže na slnko, teplo alebo novú situáciu zareagovať mimovoľne. Je to prirodzený biologický reflex, obzvlášť u mladších začiatočníkov.',
    bulletPoints: [
      'Zachovajte pokoj a nepanikárte.',
      'Diskrétne sa zakryte uterákom alebo si ľahnite na brucho.',
      'Môžete sa voľne prejsť do ochladzujúcej vody jazera.',
      'Nevyhľadávajte nežiaducu pozornosť a rešpektujte okolie.'
    ],
    helpfulCount: 178,
    tags: ['erekcia', 'reakcia', 'začiatočník', 'telo', 'etiketa']
  },
  {
    id: 'faq-9',
    category: 'komunita',
    question: 'Aké vekové skupiny a komunita navštevuje ZP Cruiser?',
    badgeText: 'KOMUNITA',
    answer: 'ZP Cruiser je inkluzívne miesto pre všetkých rešpektujúcich návštevníkov.',
    bulletPoints: [
      'Vekové rozpätie: Od študentov (18+) cez mladých profesionálov až po skúsených naturistov a seniorov.',
      'Centrálna zóna: Pri móle a trávniku sa zvykne stretávať najmä mladšia a aktívnejšia komunita.',
      'Východný trávnik: Pokojnejšia zóna vhodná na čítanie, odpočinok a opaľovanie bez hluku.'
    ],
    helpfulCount: 122,
    tags: ['vek', 'komunita', 'stranok', 'atmosfera', 'mladi']
  },
  {
    id: 'faq-10',
    category: 'vip',
    question: 'Čo presne odomyká VIP členstvo v aplikácii ZP Cruiser?',
    badgeText: 'VIP FUNKCIE',
    answer: 'VIP predplatné podporuje vývoj aplikácie a prináša pokročilé reálne nástroje pre komunitu:',
    bulletPoints: [
      'Živé HD kamery: Pohľad na obsadenosť a počasie v reálnom čase.',
      'Radar obsadenosti: Filtre podľa veku, intenzity slnka a komunitnej aktivity.',
      'Cruising Radar Lesík: Informácie o houstnutí a pohybe v zóne Lesík.',
      'SOS Časovač: Neobmedzená ochrana pri samotárskych prechádzkach.'
    ],
    isVip: true,
    helpfulCount: 230,
    tags: ['vip', 'premium', 'radar', 'kamery', 'funkcie']
  }
];

export function FAQScreen({ isPremium, onUpgradeClick, onNavigateToSafety, onNavigateToMap }: FAQScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'faq-1': true, // Keep first default open
    'faq-4': true
  });
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  // Ask Question Modal State
  const [showAskModal, setShowAskModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState<'etiketa' | 'navigacia' | 'komunita' | 'bezpecnost' | 'vip'>('etiketa');
  const [userSubmittedSuccess, setUserSubmittedSuccess] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isLiked = likedIds[id];
    setLikedIds(prev => ({ ...prev, [id]: !isLiked }));
    setFaqs(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          helpfulCount: isLiked ? item.helpfulCount - 1 : item.helpfulCount + 1
        };
      }
      return item;
    }));
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newFaq: FAQItem = {
      id: `user-faq-${Date.now()}`,
      category: newQuestionCategory,
      question: newQuestionText.trim(),
      answer: 'Ďakujeme za vašu otázku! Otázka bola odoslaná moderátorom komunity. Po overení sa tu zobrazí s odpoveďou.',
      helpfulCount: 1,
      tags: ['komunita', 'otazka']
    };

    setFaqs([newFaq, ...faqs]);
    setExpandedIds(prev => ({ ...prev, [newFaq.id]: true }));
    setNewQuestionText('');
    setUserSubmittedSuccess(true);
    setTimeout(() => {
      setUserSubmittedSuccess(false);
      setShowAskModal(false);
    }, 1800);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesQuery;
  });

  const categoryLabels: Array<{ key: string; label: string; icon: React.ReactNode }> = [
    { key: 'all', label: 'Všetko', icon: <Compass size={14} /> },
    { key: 'etiketa', label: 'Etiketa', icon: <CameraOff size={14} /> },
    { key: 'navigacia', label: 'Navigácia', icon: <MapPin size={14} /> },
    { key: 'komunita', label: 'Komunita', icon: <Users size={14} /> },
    { key: 'bezpecnost', label: 'Bezpečnosť', icon: <ShieldAlert size={14} /> },
    { key: 'vip', label: 'VIP App', icon: <Sparkles size={14} /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 pb-24 max-w-3xl mx-auto w-full">
      {/* Title & Introduction Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <HelpCircle size={14} />
            <span>Sprievodca & Poradňa</span>
          </div>
          {!isPremium && (
            <button
              onClick={onUpgradeClick}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full hover:bg-amber-500/20 transition-colors"
            >
              <Sparkles size={12} />
              <span>VIP Zóna</span>
            </button>
          )}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          Často kladené otázky
        </h2>
        <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
          Všetko, čo potrebujete vedieť o etikete, navigácii, bezpečnosti a komunite na nudapláži Zlaté Piesky (ZP Cruiser).
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Hľadať otázku, napr. 'fotenie', 'doprava', 'lesík'..."
          className="w-full pl-10 pr-10 py-3 bg-surface-container border border-outline-variant/30 rounded-2xl text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-on-surface"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Filter Chips Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none no-scrollbar">
        {categoryLabels.map((cat: any) => {
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Banner / Quick Link Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-surface-container p-4 rounded-2xl border border-rose-500/20 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Máte obavy o bezpečnosť?</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Využite SOS Sirénu, Časovač ochrany a kontakty na pohotovosť.
              </p>
            </div>
          </div>
          {onNavigateToSafety && (
            <button
              onClick={onNavigateToSafety}
              className="mt-3 w-full py-1.5 px-3 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Zobraziť Bezpečnosť</span>
            </button>
          )}
        </div>

        <div className="bg-gradient-to-br from-primary/10 via-blue-500/5 to-surface-container p-4 rounded-2xl border border-primary/20 flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Kde sa nachádza pláž?</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-snug">
                Pozrite si interaktívnu mapu zón, mól a bufetov.
              </p>
            </div>
          </div>
          {onNavigateToMap && (
            <button
              onClick={onNavigateToMap}
              className="mt-3 w-full py-1.5 px-3 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <span>Otvoriť Mapu Zón</span>
            </button>
          )}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-8 text-center border border-outline-variant/30 my-4">
            <Info size={32} className="mx-auto text-on-surface-variant/60 mb-2" />
            <h3 className="text-base font-bold text-on-surface">Nenašli sa žiadne výsledky</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Skúste zmeniť vyhľadávací výraz alebo kategóriu filterov.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold"
            >
              Resetovať filtre
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = !!expandedIds[faq.id];
            const isLiked = !!likedIds[faq.id];

            return (
              <div
                key={faq.id}
                className={`bg-surface-container rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded 
                    ? 'border-primary/40 shadow-sm ring-1 ring-primary/20' 
                    : 'border-outline-variant/20 hover:border-outline-variant/50'
                }`}
              >
                {/* Header Question Row */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-4 sm:p-4.5 flex items-start justify-between gap-3 focus:outline-none"
                >
                  <div className="flex-1 pr-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-surface-variant text-on-surface-variant">
                        {faq.category === 'etiketa' && 'Etiketa'}
                        {faq.category === 'navigacia' && 'Navigácia'}
                        {faq.category === 'komunita' && 'Komunita'}
                        {faq.category === 'bezpecnost' && 'Bezpečnosť'}
                        {faq.category === 'vip' && 'VIP Feature'}
                      </span>
                      {faq.badgeText && (
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          faq.badgeText.includes('NULOVÁ') || faq.badgeText.includes('PROTOKOL')
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                            : faq.badgeText.includes('EXPLICITNÝ') || faq.badgeText.includes('HYGIENA')
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {faq.badgeText}
                        </span>
                      )}
                      {faq.isVip && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          <Sparkles size={10} />
                          <span>VIP</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-on-surface leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="p-1 text-on-surface-variant hover:text-on-surface shrink-0 mt-0.5">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Animated Answer Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-outline-variant/10"
                    >
                      <div className="p-4 sm:p-4.5 bg-surface-variant/15 text-sm text-on-surface-variant leading-relaxed space-y-3">
                        <p className="font-medium text-on-surface">{faq.answer}</p>

                        {/* Explicit Bullet Points */}
                        {faq.bulletPoints && faq.bulletPoints.length > 0 && (
                          <ul className="space-y-1.5 pt-1">
                            {faq.bulletPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-on-surface-variant/90 leading-normal">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Explicit Warning Note Callout */}
                        {faq.warningNote && (
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold mt-2">
                            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
                            <span>{faq.warningNote}</span>
                          </div>
                        )}

                        {/* Clickable Tag Chips */}
                        {faq.tags && faq.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                            <span className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider font-bold">Kľúčové slová:</span>
                            {faq.tags.map(tag => (
                              <button
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSearchQuery(tag);
                                }}
                                className="text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Interactive Footer inside answer */}
                        <div className="mt-3 pt-3 border-t border-outline-variant/10 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-on-surface-variant/70 font-medium">
                            Pomohla vám táto odpoveď?
                          </span>
                          <button
                            onClick={(e) => handleToggleLike(faq.id, e)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                              isLiked 
                                ? 'bg-primary text-on-primary' 
                                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                            }`}
                          >
                            <ThumbsUp size={13} className={isLiked ? 'fill-current' : ''} />
                            <span>{faq.helpfulCount}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Ask Question Floating / Bottom Bar */}
      <div className="mt-8 bg-surface-container rounded-2xl p-5 border border-outline-variant/30 text-center shadow-xs">
        <MessageSquare size={24} className="mx-auto text-primary mb-2" />
        <h3 className="text-sm font-bold text-on-surface">Máte ďalšiu otázku?</h3>
        <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
          Nenašli ste odpoveď na to, čo vás zaujíma? Pošlite otázku našim moderátorom pláže.
        </p>
        <button
          onClick={() => setShowAskModal(true)}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-bold hover:opacity-95 transition-opacity active:scale-95"
        >
          <Plus size={16} />
          <span>Položiť novú otázku</span>
        </button>
      </div>

      {/* Ask Question Modal */}
      <AnimatePresence>
        {showAskModal && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAskModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface border border-outline-variant/30 rounded-3xl p-6 shadow-2xl z-10"
            >
              <button
                onClick={() => setShowAskModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">Položiť otázku komunitám</h3>
                  <p className="text-xs text-on-surface-variant">ZP Cruiser Poradňa</p>
                </div>
              </div>

              {userSubmittedSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 size={44} className="mx-auto text-emerald-500 animate-bounce" />
                  <h4 className="text-sm font-bold text-on-surface">Otázka bola úspešne odoslaná!</h4>
                  <p className="text-xs text-on-surface-variant">Ďakujeme. Moderátori ju čoskoro spracujú a pridajú do FAQ.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuestion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                      Kategória
                    </label>
                    <select
                      value={newQuestionCategory}
                      onChange={(e) => setNewQuestionCategory(e.target.value as any)}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-2.5 text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="etiketa">Etiketa & Pravidlá</option>
                      <option value="navigacia">Navigácia & Prístup</option>
                      <option value="komunita">Komunita & Zóny</option>
                      <option value="bezpecnost">Bezpečnosť & Súkromie</option>
                      <option value="vip">VIP Aplikácia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                      Vaša otázka
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="Napríklad: Aké je najlepšie miesto na pláži pre nováčikov v tieni?"
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-xl p-3 text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAskModal(false)}
                      className="px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-xl text-xs font-bold"
                    >
                      Zrušiť
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <Send size={14} />
                      <span>Odoslať otázku</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
