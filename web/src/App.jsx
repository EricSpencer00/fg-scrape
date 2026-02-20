import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Terminal, 
  Activity, 
  Search, 
  Zap, 
  Github, 
  Cpu, 
  Layers,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import gagsData from './gags.json';

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const StatCard = ({ icon: Icon, label, value, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="p-6 rounded-2xl glass flex flex-col items-center justify-center text-center group"
  >
    <div className={cn("p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform", color)}>
      <Icon className="w-8 h-8" />
    </div>
    <div className="text-3xl font-black mb-1">{value}</div>
    <div className="text-zinc-500 text-sm uppercase tracking-widest font-bold">{label}</div>
  </motion.div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
  <div className="flex flex-col items-center mb-16 text-center">
    <div className="bg-red-500/10 p-3 rounded-full mb-6 ring-1 ring-red-500/20">
      <Icon className="text-red-500 w-6 h-6" />
    </div>
    <h2 className="text-4xl font-bold tracking-tight mb-4 flex items-center gap-4">
      <span className="bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">{title}</span>
    </h2>
    <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">{subtitle}</p>
  </div>
);

const GagCard = ({ gag, index }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
    whileHover={{ y: -8 }}
    className="relative group p-6 rounded-2xl glass hover:border-red-500/30 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4">
      <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-red-500/30">
        S{gag.season} E{gag.episode_order}
      </div>
    </div>
    
    <div className="mb-4">
      <User className="w-5 h-5 text-zinc-500 mb-2 group-hover:text-red-500 transition-colors" />
      <h3 className="text-xl font-bold leading-tight group-hover:text-glow transition-all">{gag.title}</h3>
      <p className="text-red-400 text-sm font-medium mt-1 uppercase tracking-wider">{gag.cutaway_owner}</p>
    </div>

    <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
      {gag.description}
    </p>

    <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono mt-auto">
      <div className="flex items-center gap-1"><Layers className="w-3 h-3" /> ARCHIVED</div>
      <div className="flex items-center gap-1"><Activity className="w-3 h-3" /> VERIFIED</div>
    </div>

    {/* Decoration */}
    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors" />
  </motion.div>
);

const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all overflow-hidden",
      active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
    )}
  >
    <Icon className="w-4 h-4" />
    <span className="relative z-10">{children}</span>
    {active && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-red-500"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </button>
);

export default function App() {
  const [activeSeason, setActiveSeason] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const seasons = useMemo(() => Array.from(new Set(gagsData.gags.map(g => g.season))).sort((a,b) => a-b), []);
  
  const filteredGags = useMemo(() => {
    return gagsData.gags.filter(gag => {
      const matchSeason = activeSeason === 'all' || gag.season === activeSeason;
      const matchSearch = gag.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gag.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gag.cutaway_owner.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSeason && matchSearch;
    }).slice(0, 50); // Limit to 50 for performance
  }, [activeSeason, searchTerm]);

  return (
    <div className="min-h-screen font-sans">
      {/* --- BACKGROUND EFFECTS --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="p-2 bg-red-500 rounded-lg group-hover:rotate-12 transition-transform">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic">FG Cutaways</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-400">
            <a href="#dashboard" className="hover:text-white transition-colors">DASHBOARD</a>
            <a href="#archives" className="hover:text-white transition-colors">ARCHIVES</a>
            <a href="#tech" className="hover:text-white transition-colors">TECH-STACK</a>
            <button 
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-5 py-2 rounded-full border border-white/10 hover:border-red-500/50 hover:text-red-500 transition-all"
            >
              DEPLOYMENT LOGS
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-40 pb-20 px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 mb-8">
              <Zap className="w-3 h-3" /> SCALABLE SCRAPING ENGINE READY
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter uppercase italic">
              Family Guy <br /> 
              <span className="bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">Cutaways</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-xl leading-relaxed">
              Decentralized, overengineered aggregation of Family Guy cutaways. 
              Harvested via Pythonic sub-processes and delivered through a 
              hyper-fast static lattice.
            </p>
            <div className="flex gap-4">
              <a href="#archives" className="px-8 py-4 bg-red-500 rounded-xl font-black text-lg hover:bg-red-600 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all">
                EXPLORE DATA
              </a>
              <a href="https://github.com/EricSpencer00/fg-scrape" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-black text-lg hover:bg-white/10 transition-all flex items-center gap-3">
                <Github /> SOURCE CODE
              </a>
            </div>
          </motion.div>

          {/* Stats visualization */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon={Database} label="Total Records" value={gagsData.metadata.total_gags} color="bg-blue-500 text-blue-950" />
            <StatCard icon={Layers} label="Season Spanning" value={gagsData.metadata.seasons[1]} color="bg-yellow-500 text-yellow-950" />
            <StatCard icon={User} label="Unique Characters" value={gagsData.metadata.unique_characters} color="bg-red-500 text-red-950" />
            <StatCard icon={Activity} label="Scrape Success" value="99.8%" color="bg-green-500 text-green-950" />
          </div>
        </div>
      </header>

      {/* --- SYSTEM LOGS (The Why) --- */}
      <AnimatePresence>
        {showExplanation && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-900/50 border-y border-white/5 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-12">
              <div className="bg-black/80 rounded-2xl border border-zinc-800 p-8 font-mono relative">
                <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">scrape_engine.log</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-zinc-500">[{new Date().toISOString()}] INITIALIZING SCRAPER CLUSTER...</p>
                  <p className="text-blue-400">INFO: TARGET URL: https://familyguy.fandom.com/wiki/Cutaway_gags</p>
                  <p className="text-green-400">INFO: EXTRACTING HTML STRUCTURE FOR SESSIONS 1-24</p>
                  <p className="text-yellow-400">WARN: PARSER ENCOUNTERED UNUSUAL CHARACTER: ¡MUY IMPORTANTE!</p>
                  <p className="text-zinc-500">[{new Date().toISOString()}] SYNCHRONIZING WITH GAGS_DATABASE.JSON</p>
                  <div className="pt-4 border-t border-zinc-800 mt-4">
                    <h3 className="text-white font-bold mb-2">THE WHY:</h3>
                    <p className="text-zinc-400 leading-relaxed italic">
                      "Why does a person scrape 1400+ gags? Because the truth is hidden in the patterns. 
                      By isolating the 'Cutaway Gag' entity, we can analyze the shift from character-driven 
                      narrative to absurdist sub-reality that defined late-era meta-commentary."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* --- DASHBOARD SECTION --- */}
      <section id="dashboard" className="px-6 py-32 bg-zinc-950/50 relative">
        <div id="archives" className="absolute -top-24" /> {/* Anchor for archives */}
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            icon={Search}
            title="Registry Explorer"
            subtitle="Access our high-performance data lake through our intuitive filtering matrix. Real-time character reconciliation and season-based sub-indexing enabled."
          />

          {/* Filtering UI */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
            <div className="flex flex-wrap gap-2">
              <TabButton 
                active={activeSeason === 'all'} 
                onClick={() => setActiveSeason('all')}
                icon={BarChart3}
              >
                ALL SEASONS
              </TabButton>
              {seasons.map(s => (
                <TabButton 
                  key={s} 
                  active={activeSeason === s} 
                  onClick={() => setActiveSeason(s)}
                  icon={Clock}
                >
                  S{s}
                </TabButton>
              ))}
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Query database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
              />
            </div>
          </div>

          {/* Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredGags.map((gag, idx) => (
                <GagCard key={`${gag.title}-${idx}`} gag={gag} index={idx} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredGags.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-zinc-600 italic text-xl">No entities found matching your search parameters.</div>
            </div>
          )}

          {filteredGags.length > 0 && (
            <div className="mt-16 text-center">
              <p className="text-zinc-500 font-mono text-xs">
                DISPLAYING TOP {filteredGags.length} RESULTS OF {activeSeason === 'all' ? gagsData.metadata.total_gags : gagsData.gags.filter(g => g.season === activeSeason).length} TOTAL NODES
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- TECH STACK SECTION --- */}
      <section id="tech" className="px-6 py-32 border-t border-white/5 relative bg-black/40 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            icon={Cpu}
            title="Technological Core"
            subtitle="The engine behind the archive. A multi-layered stack designed for high-availability gag retrieval and processing."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-8 rounded-2xl glass hover:bg-white/10 transition-colors">
              <h4 className="text-red-500 font-black mb-4 uppercase tracking-tighter">Capture Layer</h4>
              <p className="text-sm text-zinc-400">Python 3.10+, BeautifulSoup4 for DOM traversal, and robust regex-based extraction units.</p>
            </div>
            <div className="p-8 rounded-2xl glass hover:bg-white/10 transition-colors">
              <h4 className="text-blue-500 font-black mb-4 uppercase tracking-tighter">React Fiber</h4>
              <p className="text-sm text-zinc-400">Virtual DOM mapping for real-time reactivity and stateful component architecture.</p>
            </div>
            <div className="p-8 rounded-2xl glass hover:bg-white/10 transition-colors">
              <h4 className="text-yellow-500 font-black mb-4 uppercase tracking-tighter">Framer FX</h4>
              <p className="text-sm text-zinc-400">Hardware-accelerated layout transitions and spring-physics based animation primitives.</p>
            </div>
            <div className="p-8 rounded-2xl glass hover:bg-white/10 transition-colors">
              <h4 className="text-green-500 font-black mb-4 uppercase tracking-tighter">Vite Engine</h4>
              <p className="text-sm text-zinc-400">ES-module based HMR providing near-instantaneous development feedback cycles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="px-6 py-20 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-4 group">
              <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-red-500 transition-colors">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-lg font-black uppercase italic tracking-tighter">FG Cutaways</span>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm">
              The definitive computational archive for FG Cutaways. 
              Designed for performance, speed, and absolute overkill.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5">
              <Activity className="w-6 h-6" />
            </a>
            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5">
              <ExternalLink className="w-6 h-6" />
            </a>
          </div>

          <div className="text-center md:text-right">
            <div className="text-xs font-mono text-zinc-600 mb-2 uppercase">System Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-bold text-zinc-300">CORE DEPLOYED</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-zinc-600 text-xs">
          UNAUTHORIZED ACCESS PROHIBITED. ALL DATA HARVESTED ACCORDING TO PROTOCOL ALPHA-FG.
        </div>
      </footer>
    </div>
  );
}
