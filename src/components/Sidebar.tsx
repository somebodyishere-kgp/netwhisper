import React from "react";
import { Activity, Shield, Terminal, Settings, Info, Zap, LayoutDashboard, Database, Wifi, Lock } from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
      ${active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-slate-500 hover:bg-[#1f1f1f] hover:text-slate-300"}
    `}
  >
    <Icon className={`w-5 h-5 ${active ? "text-emerald-500" : "text-slate-500"}`} />
    <span className="text-sm font-medium">{label}</span>
    {active && (
      <motion.div
        layoutId="active-nav"
        className="ml-auto w-1 h-4 bg-emerald-500 rounded-full"
      />
    )}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-64 h-full bg-[#141414] border-r border-[#2a2a2a] flex flex-col p-4 space-y-8">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-none">NetWhisper</h1>
          <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">v1.0.4 AI-CORE</span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 space-y-1">
        <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest px-4 mb-4">Main Menu</div>
        <NavItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={activeTab === "dashboard"} 
          onClick={() => setActiveTab("dashboard")} 
        />
        <NavItem 
          icon={Activity} 
          label="Live Sniffer" 
          active={activeTab === "sniffer"} 
          onClick={() => setActiveTab("sniffer")} 
        />
        <NavItem 
          icon={Database} 
          label="Packet History" 
          active={activeTab === "history"} 
          onClick={() => setActiveTab("history")} 
        />
        <NavItem 
          icon={Shield} 
          label="Security Audit" 
          active={activeTab === "security"} 
          onClick={() => setActiveTab("security")} 
        />
      </nav>

      {/* Network Status Section */}
      <div className="p-4 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span>WiFi Status</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">SSID:</span>
            <span className="text-slate-300 font-mono">Quantum_Net_5G</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Signal:</span>
            <span className="text-slate-300 font-mono">-42 dBm</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-500">Security:</span>
            <div className="flex items-center gap-1 text-emerald-500 font-mono">
              <Lock className="w-2 h-2" />
              WPA3
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-1 pt-4 border-t border-[#2a2a2a]">
        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={activeTab === "settings"} 
          onClick={() => setActiveTab("settings")} 
        />
        <NavItem 
          icon={Info} 
          label="Help & Docs" 
          active={activeTab === "help"} 
          onClick={() => setActiveTab("help")} 
        />
      </div>
    </div>
  );
};
