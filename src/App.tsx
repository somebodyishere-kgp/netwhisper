import React, { useState, useEffect, useCallback, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { PacketFeed } from "./components/PacketFeed";
import { PacketDetail } from "./components/PacketDetail";
import { Packet, Protocol } from "./types";
import { translatePacket } from "./services/geminiService";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie
} from "recharts";
import { 
  Activity, Shield, Zap, Terminal, Search, Globe, 
  ArrowUpRight, ArrowDownRight, Wifi, Lock, AlertTriangle, CheckCircle2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Mock data generation
const generateMockPacket = (): Packet => {
  const protocols = Object.values(Protocol);
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const id = Math.random().toString(36).substring(2, 10).toUpperCase();
  const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  const sources = ["192.168.1.15", "192.168.1.1", "10.0.0.42", "172.16.0.5", "8.8.8.8"];
  const destinations = ["142.250.190.46", "31.13.71.36", "157.240.22.35", "192.168.1.1", "8.8.4.4"];
  
  const source = sources[Math.floor(Math.random() * sources.length)];
  const destination = destinations[Math.floor(Math.random() * destinations.length)];
  
  const infos: Record<Protocol, string[]> = {
    [Protocol.TCP]: ["SYN", "ACK", "PSH, ACK", "FIN, ACK", "Keep-Alive"],
    [Protocol.UDP]: ["Source port: 53421  Destination port: 443", "Source port: 123  Destination port: 123"],
    [Protocol.HTTP]: ["GET /api/v1/status HTTP/1.1", "POST /login HTTP/1.1", "GET /favicon.ico HTTP/1.1"],
    [Protocol.HTTPS]: ["TLSv1.3 Application Data", "TLSv1.2 Handshake Message", "Client Hello"],
    [Protocol.DNS]: ["Standard query 0x1234 A google.com", "Standard query response 0x1234 A 142.250.190.46"],
    [Protocol.ICMP]: ["Echo (ping) request", "Echo (ping) reply", "Destination unreachable"],
    [Protocol.ARP]: ["Who has 192.168.1.1? Tell 192.168.1.15", "192.168.1.1 is at 00:0c:29:3e:4b:5d"],
    [Protocol.QUIC]: ["Initial, DCID=12345678", "Handshake, DCID=87654321"],
  };

  const info = infos[protocol][Math.floor(Math.random() * infos[protocol].length)];
  const length = Math.floor(Math.random() * 1400) + 60;

  return { id, timestamp, source, destination, protocol, length, info };
};

export default function App() {
  const [activeTab, setActiveTab] = useState("sniffer");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedPacket, setSelectedPacket] = useState<Packet | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSniffing, setIsSniffing] = useState(true);
  
  // Stats
  const [stats, setStats] = useState({
    pps: 0,
    totalData: 0,
    threats: 0,
    uptime: "00:00:00"
  });

  const startTime = useRef(Date.now());

  // Simulation loop
  useEffect(() => {
    if (!isSniffing) return;

    const interval = setInterval(() => {
      const newPacket = generateMockPacket();
      setPackets(prev => [newPacket, ...prev].slice(0, 100));
      
      setStats(prev => ({
        ...prev,
        pps: Math.floor(Math.random() * 15) + 5,
        totalData: prev.totalData + newPacket.length,
        threats: Math.random() > 0.98 ? prev.threats + 1 : prev.threats
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [isSniffing]);

  // Uptime timer
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - startTime.current;
      const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setStats(prev => ({ ...prev, uptime: `${h}:${m}:${s}` }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTranslate = async (packet: Packet) => {
    setIsTranslating(true);
    const translation = await translatePacket(packet);
    
    setPackets(prev => prev.map(p => 
      p.id === packet.id ? { ...p, humanTranslation: translation } : p
    ));
    
    if (selectedPacket?.id === packet.id) {
      setSelectedPacket(prev => prev ? { ...prev, humanTranslation: translation } : null);
    }
    
    setIsTranslating(false);
  };

  const protocolData = [
    { name: 'TCP', value: packets.filter(p => p.protocol === Protocol.TCP).length },
    { name: 'UDP', value: packets.filter(p => p.protocol === Protocol.UDP).length },
    { name: 'HTTP', value: packets.filter(p => p.protocol === Protocol.HTTP).length },
    { name: 'DNS', value: packets.filter(p => p.protocol === Protocol.DNS).length },
    { name: 'Other', value: packets.filter(p => ![Protocol.TCP, Protocol.UDP, Protocol.HTTP, Protocol.DNS].includes(p.protocol)).length },
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-200 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Stats */}
        <header className="h-20 border-b border-[#2a2a2a] bg-[#141414] flex items-center px-8 justify-between shrink-0">
          <div className="flex gap-8">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-emerald-500" />
                Packets / Sec
              </div>
              <div className="text-xl font-mono font-bold text-slate-100">{stats.pps} <span className="text-xs font-normal text-slate-500">PPS</span></div>
            </div>
            <div className="w-px h-8 bg-[#2a2a2a] self-center"></div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3 h-3 text-blue-500" />
                Data Analyzed
              </div>
              <div className="text-xl font-mono font-bold text-slate-100">{(stats.totalData / 1024 / 1024).toFixed(2)} <span className="text-xs font-normal text-slate-500">MB</span></div>
            </div>
            <div className="w-px h-8 bg-[#2a2a2a] self-center"></div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3 text-rose-500" />
                Threats Blocked
              </div>
              <div className="text-xl font-mono font-bold text-rose-500">{stats.threats}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Session Uptime</div>
              <div className="text-sm font-mono text-emerald-500">{stats.uptime}</div>
            </div>
            <button 
              onClick={() => setIsSniffing(!isSniffing)}
              className={`
                px-4 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-widest transition-all
                ${isSniffing 
                  ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20" 
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"}
              `}
            >
              {isSniffing ? "Stop Sniffing" : "Start Sniffing"}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === "sniffer" ? (
            <>
              <div className="flex-1 min-w-0">
                <PacketFeed 
                  packets={packets} 
                  onSelectPacket={setSelectedPacket} 
                  selectedPacketId={selectedPacket?.id}
                />
              </div>
              <div className="w-[450px] shrink-0">
                <PacketDetail 
                  packet={selectedPacket} 
                  onTranslate={handleTranslate}
                  isTranslating={isTranslating}
                />
              </div>
            </>
          ) : activeTab === "dashboard" ? (
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#0f0f0f]">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 p-6 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-xl">
                  <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Traffic Volume (Last 60s)
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={packets.slice(0, 20).reverse()}>
                        <defs>
                          <linearGradient id="colorLen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                        <XAxis dataKey="timestamp" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                          itemStyle={{ color: '#10b981' }}
                        />
                        <Area type="monotone" dataKey="length" stroke="#10b981" fillOpacity={1} fill="url(#colorLen)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-xl">
                  <h3 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-500" />
                    Protocol Distribution
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={protocolData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {protocolData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {protocolData.map((d, i) => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-slate-400 font-mono">{d.name}</span>
                        </div>
                        <span className="text-slate-200 font-mono font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: "Network Health", value: "98.2%", icon: CheckCircle2, color: "text-emerald-500" },
                  { label: "Active Nodes", value: "12", icon: Globe, color: "text-blue-500" },
                  { label: "Encryption", value: "AES-256", icon: Lock, color: "text-purple-500" },
                  { label: "Latency", value: "14ms", icon: Zap, color: "text-amber-500" }
                ].map((card, i) => (
                  <div key={i} className="p-6 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors group">
                    <div className="flex items-center justify-between mb-4">
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                      <div className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400 transition-colors">REAL-TIME</div>
                    </div>
                    <div className="text-2xl font-mono font-bold text-slate-100">{card.value}</div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">{card.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "help" ? (
            <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-[#0f0f0f]">
              <div className="max-w-3xl mx-auto space-y-12">
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">NetWhisper Setup Guide</h2>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    NetWhisper is a modern network analysis tool designed to make complex packet data accessible to everyone. 
                    Follow the instructions below to publish your instance to GitHub and run it natively on your Windows machine.
                  </p>
                </section>

                <div className="grid grid-cols-2 gap-8">
                  <section className="space-y-4 p-6 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                    <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs uppercase tracking-widest mb-2">
                      <Globe className="w-4 h-4" />
                      <span>Step 1: Publish to GitHub</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-400">
                      <li className="flex gap-3">
                        <span className="text-emerald-500 font-bold">01.</span>
                        <span>Create a new repository on <a href="https://github.com" className="text-blue-400 hover:underline">GitHub</a>.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-emerald-500 font-bold">02.</span>
                        <span>Initialize git in your local project folder.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-emerald-500 font-bold">03.</span>
                        <span>Push the source code to your new repository.</span>
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4 p-6 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                    <div className="flex items-center gap-2 text-blue-500 font-mono text-xs uppercase tracking-widest mb-2">
                      <Terminal className="w-4 h-4" />
                      <span>Step 2: Windows Installation</span>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-400">
                      <li className="flex gap-3">
                        <span className="text-blue-500 font-bold">01.</span>
                        <span>Install <a href="https://nodejs.org" className="text-blue-400 hover:underline">Node.js</a> (v18+) on Windows.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-blue-500 font-bold">02.</span>
                        <span>Clone your repo: <code className="bg-black/40 px-1 rounded text-blue-300">git clone [your-repo-url]</code></span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-blue-500 font-bold">03.</span>
                        <span>Run <code className="bg-black/40 px-1 rounded text-blue-300">npm install</code> then <code className="bg-black/40 px-1 rounded text-blue-300">npm run dev</code>.</span>
                      </li>
                    </ul>
                  </section>
                </div>

                <section className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-bold text-slate-100">Native Windows App (Desktop)</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    To use NetWhisper as a standalone Windows application (.exe), you can wrap this project in <strong>Electron</strong>. 
                    This allows the app to run in its own window without a browser, providing a native experience.
                  </p>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20">
                      Download Source Bundle (.zip)
                    </button>
                    <button className="px-6 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-slate-300 rounded-xl font-bold text-sm transition-all">
                      View Electron Guide
                    </button>
                  </div>
                </section>

                <section className="space-y-4 opacity-50">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    <Info className="w-3 h-3" />
                    <span>Technical Disclaimer</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed italic">
                    NetWhisper is a web-based analysis platform. Due to browser security sandboxing, raw WiFi packet sniffing requires 
                    elevated system permissions and native drivers (like Npcap) which are not directly accessible via standard web browsers. 
                    The current version uses high-fidelity simulation and AI translation for analysis.
                  </p>
                </section>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0f0f0f]">
              <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-mono uppercase tracking-widest opacity-50">Module Under Development</p>
              <p className="text-xs mt-2 opacity-30">This feature will be available in v1.1.0</p>
            </div>
          )}
        </div>
      </main>

      {/* Global Styles for Custom Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3a3a3a;
        }
      `}</style>
    </div>
  );
}
