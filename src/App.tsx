/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { Search, Volume2, VolumeX, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tablesPerPage = 10;

  const tables = useMemo(() => {
    const allTables = [];
    for (let i = 1; i <= 100; i++) {
      allTables.push(i);
    }
    return allTables;
  }, []);

  const filteredTables = useMemo(() => {
    if (!searchTerm) return tables;
    const num = parseInt(searchTerm);
    if (isNaN(num)) return [];
    return tables.filter(t => t === num);
  }, [searchTerm, tables]);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredTables.length / tablesPerPage);
  
  const paginatedTables = useMemo(() => {
    const startIndex = (currentPage - 1) * tablesPerPage;
    return filteredTables.slice(startIndex, startIndex + tablesPerPage);
  }, [filteredTables, currentPage]);

  const getTableLimit = (_n: number) => {
    // User explicitly asked for 1 to 20 for all tables now
    return 20;
  };

  const speakTable = (n: number) => {
    if (isSpeaking === n) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setIsLoadingAudio(n);

    const limit = getTableLimit(n);
    let text = `Multiplication table of ${n}. `;
    for (let i = 1; i <= limit; i++) {
      text += `${n} multiplied by ${i} is ${n * i}. `;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice properties for better clarity
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsLoadingAudio(null);
      setIsSpeaking(n);
    };

    utterance.onend = () => {
      setIsSpeaking(null);
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis Error:", event);
      setIsLoadingAudio(null);
      setIsSpeaking(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[#FFDAB9] p-4 md:p-8 font-sans text-black">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8"
          id="main-title"
        >
          Tables 1 to 100
        </motion.h1>

        <div className="relative max-w-md mx-auto">
          <input
            type="number"
            placeholder="Search for a table (e.g. 15)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all text-xl font-bold"
            id="search-input"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6" />
        </div>

        {/* Buy Me a Coffee Button - Custom Neo-Brutalist Version */}
        <div className="mt-8 flex justify-center">
          <a 
            href="https://www.buymeacoffee.com/anusanta" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#FFDD00] border-4 border-black px-8 py-3 font-bold shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            id="bmc-button"
          >
            <span className="text-3xl" style={{ fontFamily: "'Cookie', cursive" }}>
              Support the heart ❤️
            </span>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" id="tables-grid">
          <AnimatePresence mode="popLayout">
            {paginatedTables.map((n) => {
              const limit = getTableLimit(n);
              const half = limit / 2;
              return (
                <motion.div
                  key={n}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border-4 border-black p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full"
                  id={`table-box-${n}`}
                >
                  <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
                    <h2 className="text-3xl font-black italic">Table {n}</h2>
                    <button
                      onClick={() => speakTable(n)}
                      disabled={isLoadingAudio === n}
                      className={`p-3 border-4 border-black transition-all hover:bg-black hover:text-white active:translate-x-1 active:translate-y-1 disabled:opacity-50 relative overflow-hidden ${isSpeaking === n ? 'bg-black text-white' : 'bg-white text-black'}`}
                      title="Read Aloud"
                      id={`speech-btn-${n}`}
                    >
                      {isLoadingAudio === n ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : isSpeaking === n ? (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="relative"
                        >
                          <Volume2 size={24} />
                          {/* Animated waves effect */}
                          <motion.div
                            animate={{ 
                              scale: [1, 1.5],
                              opacity: [0.5, 0]
                            }}
                            transition={{ 
                              duration: 1, 
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                            className="absolute inset-0 border-2 border-current rounded-full"
                          />
                        </motion.div>
                      ) : (
                        <VolumeX size={24} />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 sm:gap-x-12 gap-y-2 font-mono text-sm sm:text-lg font-bold relative">
                    {/* Vertical Divider Line (4px thickness) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-black -translate-x-1/2" />

                    {Array.from({ length: half }, (_, i) => i + 1).map((i) => (
                      <div key={i} className="contents">
                        <div className="flex justify-between items-center border-b border-black/10 py-1 pr-2 sm:pr-4 whitespace-nowrap tabular-nums">
                          <span className="mr-1">{n} × {i}</span>
                          <span>= {n * i}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-black/10 py-1 pl-2 sm:pl-4 whitespace-nowrap tabular-nums">
                          <span className="mr-1">{n} × {i + half}</span>
                          <span>= {n * (i + half)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredTables.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl font-bold italic">No table found for "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 px-6 py-2 border-4 border-black bg-white font-bold hover:bg-black hover:text-white transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>

      <footer className="mt-20 text-center pb-10">
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mb-8 font-bold" id="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
              id="prev-page"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Previous Page</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first, last, current, and neighbors
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 border-4 border-black transition-all ${
                        currentPage === page ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 border-4 border-black bg-white hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black"
              id="next-page"
            >
              <span className="hidden sm:inline">Next Page</span>
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <p className="font-bold uppercase tracking-widest text-sm opacity-60">
          Interactive Multiplication Learning Tool
        </p>
      </footer>
    </div>
  );
}
