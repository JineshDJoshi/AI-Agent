import { AccessToken } from 'livekit-server-sdk';
import dotenv from 'dotenv';

dotenv.config();

export const livekitConfig = {
  url: process.env.LIVEKIT_URL,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
};

// Business context for the AI agent
export const salonContext = {
  businessName: "Bella's Beauty Salon",
  services: [
    { name: "Haircut", price: "$45", duration: "45 minutes" },
    { name: "Hair Coloring", price: "$120", duration: "2 hours" },
    { name: "Manicure", price: "$35", duration: "30 minutes" },
    { name: "Pedicure", price: "$50", duration: "45 minutes" },
    { name: "Facial", price: "$80", duration: "60 minutes" },
  ],
  hours: "Monday-Saturday: 9 AM - 7 PM, Sunday: 10 AM - 5 PM",
  location: "123 Beauty Lane, New York, NY 10001",
  phone: "+1-555-BEAUTY-1",
};

// System prompt for the AI agent
export const agentPrompt = `You are a friendly receptionist for ${salonContext.businessName}, a professional beauty salon.

SERVICES OFFERED:
${salonContext.services.map(s => `- ${s.name}: ${s.price} (${s.duration})`).join('\n')}

BUSINESS HOURS: ${salonContext.hours}
LOCATION: ${salonContext.location}
PHONE: ${salonContext.phone}

INSTRUCTIONS:
1. Be warm, professional, and helpful
2. Answer questions about services, pricing, hours, and location
3. If asked about appointments, staff availability, or anything not in your knowledge, say: "Let me check with my supervisor and get back to you shortly."
4. When you need help, trigger the REQUEST_HELP function with the customer's question and phone number
5. Keep responses concise and natural

Remember: You're the first point of contact. Make customers feel welcome!`;

// Generate access token for LiveKit
export function generateToken(identity, roomName) {
  const token = new AccessToken(
    livekitConfig.apiKey,
    livekitConfig.apiSecret,
    {
      identity,
      ttl: '1h',
    }
  );

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
  });

  return token.toJwt();
}