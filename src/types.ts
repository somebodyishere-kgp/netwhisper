export enum Protocol {
  TCP = "TCP",
  UDP = "UDP",
  HTTP = "HTTP",
  HTTPS = "HTTPS",
  DNS = "DNS",
  ICMP = "ICMP",
  ARP = "ARP",
  QUIC = "QUIC",
}

export interface Packet {
  id: string;
  timestamp: string;
  source: string;
  destination: string;
  protocol: Protocol;
  length: number;
  info: string;
  payload?: string;
  humanTranslation?: string;
  isAnalyzing?: boolean;
}

export interface NetworkStats {
  packetsPerSecond: number;
  totalData: number;
  protocolDistribution: Record<Protocol, number>;
}
