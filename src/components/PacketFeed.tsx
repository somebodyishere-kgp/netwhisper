import React from "react";
import { Packet, Protocol } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, Activity, Shield, Globe, Terminal } from "lucide-react";

interface PacketFeedProps {
  packets: Packet[];
  onSelectPacket: (packet: Packet) => void;
  selectedPacketId?: string;
}

const ProtocolIcon = ({ protocol }: { protocol: Protocol }) => {
  switch (protocol) {
    case Protocol.TCP:
      return <Activity className="w-4 h-4 text-blue-400" />;
    case Protocol.UDP:
      return <Activity className="w-4 h-4 text-purple-400" />;
    case Protocol.HTTP:
    case Protocol.HTTPS:
      return <Globe className="w-4 h-4 text-emerald-400" />;
    case Protocol.DNS:
      return <Search className="w-4 h-4 text-amber-400" />;
    case Protocol.ICMP:
      return <Shield className="w-4 h-4 text-rose-400" />;
    default:
      return <Terminal className="w-4 h-4 text-slate-400" />;
  }
};

export const PacketFeed: React.FC<PacketFeedProps> = ({
  packets,
  onSelectPacket,
  selectedPacketId,
}) => {
  return (
    <div className="flex flex-col h-full bg-[#141414] border-r border-[#2a2a2a] overflow-hidden">
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
          <h2 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-widest">Live Traffic</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            SNIFFING
          </div>
          <button className="p-1.5 hover:bg-[#2a2a2a] rounded-md transition-colors">
            <Filter className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#1a1a1a] z-10 border-b border-[#2a2a2a]">
            <tr className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Protocol</th>
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 font-medium">Destination</th>
              <th className="px-4 py-2 font-medium">Info</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            <AnimatePresence initial={false}>
              {packets.map((packet) => (
                <motion.tr
                  key={packet.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onClick={() => onSelectPacket(packet)}
                  className={`
                    cursor-pointer transition-colors border-b border-[#1f1f1f]
                    ${selectedPacketId === packet.id ? "bg-emerald-500/10 text-emerald-400" : "hover:bg-[#1f1f1f] text-slate-400"}
                  `}
                >
                  <td className="px-4 py-3 whitespace-nowrap opacity-60">{packet.timestamp}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ProtocolIcon protocol={packet.protocol} />
                      <span className="font-bold">{packet.protocol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 truncate max-w-[120px]">{packet.source}</td>
                  <td className="px-4 py-3 truncate max-w-[120px]">{packet.destination}</td>
                  <td className="px-4 py-3 truncate max-w-[200px] italic opacity-80">{packet.info}</td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
