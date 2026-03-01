import { GoogleGenAI, Type } from "@google/genai";
import { Packet } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function translatePacket(packet: Packet): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following network packet into simple, human-readable language. 
      Explain what is happening, who is talking to whom, and what the purpose of this communication likely is.
      
      Packet Details:
      - Protocol: ${packet.protocol}
      - Source: ${packet.source}
      - Destination: ${packet.destination}
      - Info: ${packet.info}
      - Payload: ${packet.payload || "No payload data available"}
      
      Keep the explanation concise, professional, and easy for a non-technical person to understand.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    return response.text || "Could not translate packet data.";
  } catch (error) {
    console.error("Gemini translation error:", error);
    return "Error translating packet data. Please check your connection.";
  }
}

export async function getNetworkSummary(packets: Packet[]): Promise<string> {
  try {
    const packetSummary = packets.map(p => `[${p.protocol}] ${p.source} -> ${p.destination}: ${p.info}`).join("\n");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this sequence of network packets and provide a high-level summary of the network activity in plain English.
      Identify any patterns, potential security concerns, or common services being used.
      
      Packet Sequence:
      ${packetSummary}
      
      Format the summary with clear headings and bullet points.`,
      config: {
        temperature: 0.5,
      },
    });

    return response.text || "No summary available.";
  } catch (error) {
    console.error("Gemini summary error:", error);
    return "Error generating network summary.";
  }
}
