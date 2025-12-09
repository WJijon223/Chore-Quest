import { Boss, BossState, User, Friend } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  username: 'Sir Cleanalot',
  avatar: 'https://picsum.photos/seed/knight/200/200',
  level: 5,
  currentXP: 450,
  xpToNextLevel: 1000,
  bossesDefeated: 12,
};

export const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', username: 'Lady Scrub', level: 7, avatar: 'https://picsum.photos/seed/lady/100/100', isOnline: true },
  { id: 'f2', username: 'Mage of Mops', level: 3, avatar: 'https://picsum.photos/seed/mage/100/100', isOnline: false },
  { id: 'f3', username: 'Rogue Dust', level: 6, avatar: 'https://picsum.photos/seed/rogue/100/100', isOnline: true },
];

export const MOCK_BOSSES: Boss[] = [
  {
    id: 'b1',
    name: 'The Great Grime of the Kitchen',
    description: 'A sticky beast that haunts the countertops and sinks. It grows stronger with every unwashed plate.',
    image: 'https://picsum.photos/seed/monster1/400/400',
    totalHealth: 100,
    currentHealth: 60,
    state: BossState.ALIVE,
    levelRequirement: 1,
    chores: [
      { id: 'c1', title: 'Slay the Stack of Dishes', xp: 50, damage: 20, completed: true, difficulty: 'Medium', estimatedTime: 20 },
      { id: 'c2', title: 'Scrub the Grease Pit (Stove)', xp: 100, damage: 40, completed: false, difficulty: 'Hard', estimatedTime: 30 },
      { id: 'c3', title: 'Purify the Floor', xp: 30, damage: 15, completed: false, difficulty: 'Medium', estimatedTime: 15 },
    ]
  },
  {
    id: 'b2',
    name: 'Dust Bunny Behemoth',
    description: 'An ancient entity accumulating under the sofa for eons.',
    image: 'https://picsum.photos/seed/monster2/400/400',
    totalHealth: 50,
    currentHealth: 0,
    state: BossState.DEFEATED,
    levelRequirement: 2,
    chores: [
      { id: 'c4', title: 'Vacuum the Living Realm', xp: 50, damage: 30, completed: true, difficulty: 'Easy', estimatedTime: 10 },
      { id: 'c5', title: 'Banish Cobwebs', xp: 20, damage: 20, completed: true, difficulty: 'Easy', estimatedTime: 5 },
    ]
  }
];

export const MOCK_CHART_DATA = [
  { name: 'Mon', xp: 120 },
  { name: 'Tue', xp: 200 },
  { name: 'Wed', xp: 150 },
  { name: 'Thu', xp: 300 },
  { name: 'Fri', xp: 180 },
  { name: 'Sat', xp: 500 },
  { name: 'Sun', xp: 250 },
];