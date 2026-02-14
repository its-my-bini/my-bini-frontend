// Map persona IDs to local character images
const PERSONA_IMAGES: Record<string, string> = {
  luna: '/luna-sweet.png',
  mia: '/mia.png',
  aiko: '/aiko-tsun.png',
  waguri: '/waguri.png',
  akeno: '/akeno.png',
};

// Fallback colors for personas without images
const PERSONA_COLORS: Record<string, string> = {
  luna: 'from-pink-500 to-purple-500',
  mia: 'from-pink-500 to-cyan-500',
  aiko: 'from-orange-500 to-red-500',
};

export function getPersonaImage(personaId: string): string | null {
  return PERSONA_IMAGES[personaId.toLowerCase()] || null;
}

export function getPersonaColor(personaId: string): string {
  return PERSONA_COLORS[personaId.toLowerCase()] || 'from-pink-500 to-purple-500';
}
