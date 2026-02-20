import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Database, 
  Activity, 
  Search, 
  Zap, 
  Github, 
  Cpu, 
  Layers,
  Clock,
  User,
  ExternalLink,
  BarChart3,
  Sparkles,
  Command,
  X,
  History,
  RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Fuse from 'fuse.js';
import gagsData from './gags.json';

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Components ---

// Counter animation
const Counter = ({ from = 0, to, duration = 2 }) => {
  const [count, setCount] = useState(from);
  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(from + (to - from) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [from, to, duration]);
  return count;
};

// Word reveal
const WordReveal = ({ text, id }) => {
  const words = text.split(' ');
  return (
    <motion.span>
      {words.map((word, i) => (
        <motion.span
          key={`${id}-${i}`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          viewport={{ once: true }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Particle background
const FloatingParticle = ({ delay, duration, size }) => (
  <motion.div
    className="absolute rounded-full blur-xl pointer-events-none"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 70%)`,
    }}
    initial={{ opacity: 0, y: 0, x: 0 }}
    animate={{
      opacity: [0, 0.3, 0],
      y: [0, -400],
      x: [0, 100, -100],
    }}
    transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
  />
);

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8, y: 30 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: 'spring', bounce: 0.4 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.05, translateY: -10 }}
    className="relative p-6 rounded-2xl glass flex flex-col items-center justify-center text-center group overflow-hidden"
  >
    <div className={cn("p-4 rounded-xl mb-4 transition-all duration-300 relative z-10 group-hover:bg-opacity-80 group-hover:scale-110 shadow-lg", color)}>
      <Icon className="w-8 h-8" />
    </div>
    <div className="text-3xl font-black mb-1 relative z-10">
      {typeof value === 'number' ? <Counter to={value} /> : value}
    </div>
    <div className="text-zinc-500 text-sm uppercase tracking-widest font-bold relative z-10">{label}</div>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </motion.div>
);

const SectionHeader = ({ title, subtitle, icon: Icon, delay = 0 }) => (
  <div className="flex flex-col items-center mb-16 text-center">
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      whileInView={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-red-500/10 p-3 rounded-full mb-6 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
    >
      <Icon className="text-red-500 w-6 h-6" />
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delay + 0.1 }}
      viewport={{ once: true }}
      className="text-4xl font-bold tracking-tight mb-4"
    >
      <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent italic uppercase tracking-tighter">
        {title}
      </span>
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, delay: delay + 0.3 }}
      viewport={{ once: true }}
      className="text-zinc-400 max-w-2xl text-lg leading-relaxed"
    >
      <WordReveal text={subtitle} id={title} />
    </motion.p>
  </div>
);

const GagCard = ({ gag, index, onCharacterClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, rotateY: -90, scale: 0.8 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      exit={{ opacity: 0, rotateY: 90, scale: 0.8 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.4), type: 'spring', bounce: 0.3 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      className="relative h-80 cursor-pointer group"
      style={{ perspective: '1200px' }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div
          className="absolute inset-0 p-6 rounded-2xl glass border-white/5 backface-hidden flex flex-col h-full hover:border-red-500/30 transition-colors shadow-2xl"
        >
          <div className="absolute top-4 right-4 ring-1 ring-white/10 bg-white/5 px-2 py-0.5 rounded text-[10px] font-black text-zinc-500 uppercase">
             S{gag.season} E{gag.episode_order}
          </div>
          
          <div className="mb-4">
             <div className="flex items-center gap-2 text-red-500 mb-1 group-hover:translate-x-1 transition-transform">
               <User className="w-4 h-4" />
               <button 
                 onClick={(e) => { e.stopPropagation(); onCharacterClick(gag.cutaway_owner); }}
                 className="text-xs font-black uppercase tracking-widest hover:underline hover:text-red-400"
               >
                 {gag.cutaway_owner}
               </button>
             </div>
             <h3 className="text-xl font-bold leading-tight line-clamp-2">{gag.title}</h3>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-3 italic">
            "{gag.description}"
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-3 h-3" /> VERIFIED_ENTITY
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-800 group-hover:text-zinc-400 transition-colors" />
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 p-6 rounded-2xl glass border-red-500/30 backface-hidden flex flex-col justify-center items-center text-center bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <Sparkles className="w-8 h-8 text-yellow-500 mb-4 animate-pulse" />
          <p className="text-zinc-300 text-sm leading-relaxed">
            Ep: <span className="text-white font-bold">{gag.episode}</span>
          </p>
          <div className="mt-4 px-4 py-2 bg-red-500 text-white rounded text-xs font-black uppercase tracking-tighter shadow-lg shadow-red-500/30">
            Archival Data Point
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const TabButton = ({ active, onClick, children, icon: Icon, index }) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={cn(
      "relative px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-black transition-all",
      active ? "text-white" : "text-zinc-500 hover:text-zinc-300 shadow-none border border-transparent"
    )}
  >
    <Icon className="w-3 h-3" />
    <span className="relative z-10">{children}</span>
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-red-500/80 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.5)]"
        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
      />
    )}
  </motion.button>
);

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 origin-left z-[100]"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

// --- APP CORE ---

export default function App() {
  const [activeSeason, setActiveSeason] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const searchInputRef = useRef(null);

  // Fuse.js setup for fuzzy search
  const fuse = useMemo(() => new Fuse(gagsData.gags, {
    keys: [
      { name: 'title', weight: 1.0 },
      { name: 'cutaway_owner', weight: 0.8 },
      { name: 'description', weight: 0.5 }
    ],
    threshold: 0.4,
    distance: 100,
    ignoreLocation: true
  }), [gagsData.gags]);

  // Enhanced search logic
  const filteredGags = useMemo(() => {
    let results = gagsData.gags;
    
    if (searchTerm.trim() !== '') {
      results = fuse.search(searchTerm).map(r => r.item);
    }
    
    if (activeSeason !== 'all') {
      results = results.filter(gag => gag.season === activeSeason);
    }
    
    return results.slice(0, 51); // Display limit for butter-smooth perf
  }, [activeSeason, searchTerm, fuse]);

  const seasons = useMemo(() => Array.from(new Set(gagsData.gags.map(g => g.season))).sort((a,b) => a-b), []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-500/30 overflow-x-hidden">
      <ScrollProgress />

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-red-600/5 blur-[150px] rounded-full"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-yellow-600/5 blur-[150px] rounded-full"
        />
        {[...Array(6)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 2} duration={15 + i * 5} size={20 + i * 10} />
        ))}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* --- HEADER --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-br from-red-500 to-yellow-600 rounded-lg shadow-lg shadow-red-500/20">
              <Database className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter italic uppercase">GAG_ARCHIVE</span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-4">
              {['DASHBOARD', 'ARCHIVES', 'STACK'].map((l) => (
                <a key={l} href={`#${l.toLowerCase()}`} className="text-[10px] font-black tracking-widest text-zinc-500 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
            <div className="w-px h-6 bg-white/10" />
            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-[10px] font-black px-4 py-2 rounded-full border border-white/10 hover:border-red-500/40 hover:text-red-500 transition-all flex items-center gap-2"
            >
              <History className="w-3 h-3" /> SYS_LOGS
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        {/* --- HERO --- */}
        <section className="pt-48 pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest mb-10 ring-1 ring-red-500/30">
                <Zap className="w-3 h-3 animate-pulse" /> Kinetic Data Scraper Online
              </div>
              <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] mb-10 selection:text-white">
                Family Guy <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 animate-gradient-x">Archives</span>
              </h1>
              <p className="text-xl text-zinc-400 mb-12 max-w-xl leading-relaxed italic">
                <WordReveal id="hero" text="Total annihilation of data silos. We've aggregated 1,400+ cutaway gags into a hyper-efficient, high-fidelity neural repository for rapid retrieval." />
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.a href="#dashboard" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-red-500 text-white font-black italic rounded-xl shadow-2xl shadow-red-500/40 hover:bg-red-600 transition-all uppercase tracking-tighter">Enter Data Stream</motion.a>
                <motion.a href="https://github.com/EricSpencer00/fg-scrape" target="_blank" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black italic rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 uppercase tracking-tighter shadow-xl"><Github /> Raw Socket</motion.a>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard icon={Database} label="Aggregated Nodes" value={gagsData.metadata.total_gags} color="bg-red-500/10 text-red-500" delay={0.2} />
              <StatCard icon={BarChart3} label="Temporal Range" value={`S01 - S${seasons[seasons.length-1]}`} color="bg-yellow-500/10 text-yellow-500" delay={0.3} />
              <StatCard icon={User} label="Unique Actors" value={gagsData.metadata.unique_characters} color="bg-blue-500/10 text-blue-500" delay={0.4} />
              <StatCard icon={Activity} label="Scrape Velocity" value="2.4ms/node" color="bg-green-500/10 text-green-500" delay={0.5} />
            </div>
          </div>
        </section>

        {/* --- SYSTEM LOGS --- */}
        <AnimatePresence>
          {showExplanation && (
            <motion.section 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-zinc-900/50 border-y border-white/5 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-6 py-20 font-mono text-sm">
                <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-zinc-600 uppercase italic">/usr/bin/scrape_verbose</span>
                </div>
                <div className="space-y-3">
                  <p className="text-zinc-600">[{new Date().toISOString()}] Initializing cluster synchronization...</p>
                  <p className="text-red-400">CONNECT SUCCESS: familyguy.fandom.com/REST/v1</p>
                  <p className="text-yellow-400">WARNING: ¡MUY IMPORTANTE! detected. Parsing with specialty locale.</p>
                  <p className="text-white">STATUS: Finalized 1,429 gag records at 17:42 GMT</p>
                  <div className="mt-8 pt-8 border-t border-white/5">
                    <h3 className="text-zinc-500 font-black mb-4 uppercase tracking-[0.2em] text-[10px]">Directives:</h3>
                    <p className="text-zinc-400 max-w-3xl leading-relaxed italic">
                      "Why? Because data is only as good as its delivery. This repository exists to prove that even a 'Stewie dressed as a pirate' cutaway deserves a sub-3ms latency presentation layer."
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* --- DASHBOARD --- */}
        <section id="dashboard" className="py-32 bg-black border-t border-white/5">
          <div id="archives" className="absolute -top-24" />
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader 
               icon={Search}
               title="Neural Search Matrix" 
               subtitle="Our proprietary fuzzy-logic engine matches queries against titles, characters, and descriptions in real-time. Full season sub-indexing active."
            />

            {/* SEARCH HUB */}
            <div className="flex flex-col gap-10 mb-20">
              <div className="grid md:grid-cols-[1fr,auto] gap-6 items-center">
                <motion.div 
                  className="relative group h-16"
                  whileFocusWithin={{ scale: 1.01 }}
                >
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Search characters, gags, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-full pl-16 pr-28 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 font-bold text-lg transition-all shadow-inner"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                     <div className="px-2 py-1 rounded bg-white/10 border border-white/10 text-[10px] text-zinc-500 font-black">
                        <Command className="w-2.5 h-2.5 inline-block mr-1" /> K
                     </div>
                  </div>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-16 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-zinc-500" />
                    </button>
                  )}
                </motion.div>

                <div className="flex items-center gap-3 h-16 w-full md:w-auto">
                   <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest hidden lg:block mr-2">Quick_Filter:</div>
                   <div className="flex flex-wrap gap-2">
                     <TabButton 
                        active={activeSeason === 'all'} 
                        onClick={() => setActiveSeason('all')} 
                        icon={BarChart3} 
                        index={0}
                      >
                       GLOBAL
                     </TabButton>
                     {seasons.map((s, i) => (
                       <TabButton 
                         key={s} 
                         active={activeSeason === s} 
                         onClick={() => setActiveSeason(s)} 
                         icon={Clock} 
                         index={i + 1}
                       >
                         S{s}
                       </TabButton>
                     ))}
                   </div>
                </div>
              </div>
              
              {/* Results Stats */}
              <div className="flex justify-between items-center px-4 border-l-2 border-red-500/50">
                <div className="text-xs font-mono text-zinc-500 italic">
                  Matched <span className="text-white font-bold tracking-tighter">{filteredGags.length}</span> nodes in 0.003s
                </div>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Reset_Stream
                  </button>
                )}
              </div>
            </div>

            {/* RESULTS GRID */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredGags.map((gag, idx) => (
                  <GagCard 
                    key={`${gag.title}-${idx}`} 
                    gag={gag} 
                    index={idx} 
                    onCharacterClick={(c) => { setActiveSeason('all'); setSearchTerm(c); window.scrollTo({ top: document.getElementById('dashboard').offsetTop - 100, behavior: 'smooth' }); }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredGags.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="py-40 text-center flex flex-col items-center"
              >
                <div className="p-10 bg-white/5 border border-white/10 border-dashed rounded-3xl max-w-lg mb-8">
                   <RotateCcw className="w-12 h-12 text-zinc-700 mb-6 mx-auto animate-spin-slow" />
                   <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">No Matrix Matches</h3>
                   <p className="text-zinc-500 leading-relaxed italic">Your query returned zero hits in our neural lake. Broaden your search parameters or reset the temporal filter.</p>
                </div>
                <button 
                  onClick={() => { setSearchTerm(''); setActiveSeason('all'); }}
                  className="px-8 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 hover:bg-red-600"
                >
                  Force_System_Reset
                </button>
              </motion.div>
            )}

            {filteredGags.length > 0 && (
              <div className="mt-20 pt-10 border-t border-white/5 text-center">
                 <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-4">
                   <span>BUFFER_LIMIT: 50_NODES</span>
                   <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                   <span>TOTAL_POOL: {activeSeason === 'all' ? gagsData.metadata.total_gags : gagsData.gags.filter(g => g.season === activeSeason).length}_ENTITIES</span>
                 </p>
              </div>
            )}
          </div>
        </section>

        {/* --- STACK --- */}
        <section id="stack" className="py-32 px-6 bg-zinc-950/30">
          <div className="max-w-7xl mx-auto">
            <SectionHeader 
               icon={Cpu}
               title="System Core" 
               subtitle="Engineered for maximum overkill. We utilize a decentralized delivery pipeline for all gag-related assets."
            />
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { n: "01", t: "Python_Harvester", d: "BeautifulSoup4 driven harvest engine with custom regex sanitization and multi-threaded DOM traversal." },
                { n: "02", t: "React_Fiber", d: "Fiber-based UI reconciliation ensuring sub-pixel layout accuracy and fluid state transitions." },
                { n: "03", t: "Framer_Physics", d: "Hardware-accelerated viewport-driven animation primitives featuring custom spring dynamics." },
                { n: "04", t: "Neural_Search", d: "Weighted fuzzy search via Fuse.js with bitwise character matching and relevance scoring." },
              ].map((s) => (
                <div key={s.n} className="p-8 rounded-2xl glass border-white/5 hover:border-red-500/30 transition-all group relative overflow-hidden">
                  <div className="text-red-500 font-mono text-[10px] mb-4 tracking-widest">{s.n} / SYSTEM_PROCESS</div>
                  <h4 className="text-xl font-black uppercase italic mb-3">{s.t}</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed italic">{s.d}</p>
                  <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 border-t border-white/5 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center gap-3 mb-4 group cursor-pointer">
               <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.8 }} className="p-2 bg-gradient-to-br from-red-500 to-yellow-600 rounded-lg">
                  <Database className="w-5 h-5 text-white" />
               </motion.div>
               <span className="text-xl font-black italic uppercase tracking-tighter">GagArch_v1</span>
             </div>
             <p className="text-zinc-600 text-[10px] uppercase font-black tracking-[0.3em]">Est. 2026 / All Data Verified</p>
          </div>
          
          <div className="flex gap-6">
            <motion.a href="https://github.com/EricSpencer00/fg-scrape" target="_blank" whileHover={{ scale: 1.2, y: -5 }} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl"><Github className="w-5 h-5" /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2, y: -5 }} className="p-3 bg-white/5 border border-white/10 rounded-full hover:bg-yellow-500 hover:text-black transition-all shadow-xl"><Sparkles className="w-5 h-5" /></motion.a>
          </div>

          <div className="text-center md:text-right">
            <div className="text-[10px] font-mono text-zinc-600 uppercase mb-2">Network_Status</div>
            <div className="flex items-center justify-center md:justify-end gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-black uppercase text-zinc-300 tracking-tighter">Nodes_Synchronized</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between text-zinc-700 text-[9px] font-black uppercase tracking-[0.4em]">
           <span>SECURE_DATA_LAYER_ACTIVE</span>
           <span>NO_REDUNDANCY_DETECTED</span>
           <span>PROTOCOL_LEVEL_7</span>
        </div>
      </footer>
    </div>
  );
}
