import React from "react";
import { Packet } from "../types";
import { motion } from "motion/react";
import { Terminal, Info, Globe, Shield, Cpu, Zap, MessageSquare } from "lucide-react";

interface PacketDetailProps {
  packet: Packet | null;
  onTranslate: (packet: Packet) => void;
  isTranslating: boolean;
}

export const PacketDetail: React.FC<PacketDetailProps> = ({
  packet,
  onTranslate,
  isTranslating,
}) => {
  if (!packet) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[#1a1a1a] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4">
          <Terminal className="w-8 h-8 opacity-20" />
        </div>
        <p className="text-sm font-mono uppercase tracking-widest opacity-50">Select a packet to begin analysis</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] overflow-hidden">
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-500" />
          <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-widest">Packet Analysis</h2>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-[#2a2a2a] px-2 py-1 rounded">
          ID: {packet.id}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Technical Data Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-[#2a2a2a] pb-2">
            <Cpu className="w-3 h-3" />
            <span>Technical Data</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Protocol</div>
              <div className="text-sm font-mono font-bold text-emerald-400">{packet.protocol}</div>
            </div>
            <div className="p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Length</div>
              <div className="text-sm font-mono font-bold text-blue-400">{packet.length} Bytes</div>
            </div>
            <div className="p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Source IP</div>
              <div className="text-sm font-mono font-bold text-slate-200">{packet.source}</div>
            </div>
            <div className="p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]">
              <div className="text-[10px] text-slate-500 uppercase mb-1">Destination IP</div>
              <div className="text-sm font-mono font-bold text-slate-200">{packet.destination}</div>
            </div>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] font-mono text-xs text-emerald-500/80 break-all">
            <div className="text-[10px] text-slate-600 uppercase mb-2">Info String</div>
            {packet.info}
          </div>
        </section>

        {/* AI Translation Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Human Translation (AI)</span>
            </div>
            {!packet.humanTranslation && !isTranslating && (
              <button
                onClick={() => onTranslate(packet)}
                className="text-[10px] font-mono bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded transition-colors flex items-center gap-2"
              >
                <Zap className="w-3 h-3" />
                Translate
              </button>
            )}
          </div>

          <div className="relative min-h-[120px] p-6 bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] shadow-inner">
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest animate-pulse">
                  AI is analyzing packet headers...
                </p>
              </div>
            ) : packet.humanTranslation ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert prose-sm max-w-none font-sans text-slate-300 leading-relaxed"
              >
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                  <p>{packet.humanTranslation}</p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-30">
                <Zap className="w-8 h-8 mb-2" />
                <p className="text-[10px] font-mono uppercase tracking-widest">Click translate to see human-readable explanation</p>
              </div>
            )}
          </div>
        </section>

        {/* Payload Preview Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-[#2a2a2a] pb-2">
            <Terminal className="w-3 h-3" />
            <span>Raw Payload Preview (Hex/ASCII)</span>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#2a2a2a] font-mono text-[10px] text-slate-500 overflow-x-auto whitespace-pre">
            {`0000  00 0c 29 3e 4b 5d 00 50 56 c0 00 08 08 00 45 00  ..)>K].PV.....E.
0010  00 3c 1c 46 40 00 40 06 b1 e6 c0 a8 00 68 c0 a8  .<.F@.@......h..
0020  00 01 00 14 00 50 00 00 00 00 00 00 00 00 a0 02  .....P..........
0030  39 08 73 74 00 00 02 04 05 b4 04 02 08 0a 00 0c  9.st............`}
          </div>
        </section>
      </div>
    </div>
  );
};
