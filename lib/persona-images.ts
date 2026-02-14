// Map persona IDs to local character images
const PERSONA_IMAGES: Record<string, string> = {
  luna: '/luna.png',
  mia: '/mia.png',
  aiko: '/aiko.png',
};

// Fallback colors for personas without images
const PERSONA_COLORS: Record<string, string> = {
  luna: 'from-pink-500 to-purple-500',
  mia: 'from-pink-500 to-cyan-500',
  aiko: 'from-orange-500 to-red-500',
};

export interface CharacterDetail {
  age: string;
  height: string;
  birthday: string;
  zodiac: string;
  personality: string[];
  hobbies: string[];
  likes: string[];
  dislikes: string[];
  greeting: string;
}

const CHARACTER_DETAILS: Record<string, CharacterDetail> = {
  luna: {
    age: '19',
    height: '162cm',
    birthday: 'March 14',
    zodiac: 'Pisces',
    personality: ['Sweet', 'Caring', 'Gentle', 'Romantic'],
    hobbies: ['Cooking', 'Reading', 'Stargazing', 'Writing poetry'],
    likes: ['Flowers', 'Warm hugs', 'Sunset walks', 'Hot cocoa'],
    dislikes: ['Loud noises', 'Being alone', 'Scary movies'],
    greeting: 'Hi there~ I\'ve been waiting for you! Let\'s have a wonderful time together 💕',
  },
  mia: {
    age: '20',
    height: '158cm',
    birthday: 'November 7',
    zodiac: 'Scorpio',
    personality: ['Tsundere', 'Sharp', 'Secretly caring', 'Competitive'],
    hobbies: ['Gaming', 'Martial arts', 'Piano', 'Collecting figurines'],
    likes: ['Winning', 'Cats', 'Spicy food', 'Late night chats'],
    dislikes: ['Being teased', 'Losing', 'Overly sweet things'],
    greeting: 'D-Don\'t get the wrong idea! I\'m just here because I have nothing better to do... hmph!',
  },
  aiko: {
    age: '18',
    height: '155cm',
    birthday: 'July 22',
    zodiac: 'Cancer',
    personality: ['Playful', 'Energetic', 'Mischievous', 'Cheerful'],
    hobbies: ['Dancing', 'Pranks', 'Karaoke', 'Social media'],
    likes: ['Adventures', 'Sweets', 'Memes', 'Surprises'],
    dislikes: ['Boredom', 'Strict rules', 'Waking up early'],
    greeting: 'Yooo~ Ready for some fun? Life\'s too short to be boring! Let\'s gooo~ 🎉',
  },
};

export function getPersonaImage(personaId: string): string | null {
  return PERSONA_IMAGES[personaId.toLowerCase()] || null;
}

export function getPersonaColor(personaId: string): string {
  return PERSONA_COLORS[personaId.toLowerCase()] || 'from-pink-500 to-purple-500';
}

export function getCharacterDetail(personaId: string): CharacterDetail | null {
  return CHARACTER_DETAILS[personaId.toLowerCase()] || null;
}
