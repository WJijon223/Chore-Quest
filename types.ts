import { Timestamp } from 'firebase/firestore';

export enum BossState {
  ALIVE = 'ALIVE',
  DEFEATED = 'DEFEATED'
}

export interface Chore {
  id: string;
  title: string;
  xp: number;
  damage: number;
  completed: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTime: number; // in minutes
}

export interface Boss {
  id: string;
  name: string;
  description: string;
  image: string;
  totalHealth: number;
  currentHealth: number;
  state: BossState;
  chores: Chore[];
  levelRequirement: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  bossesDefeated: number;
  friends: string[];
  needsUsernameSetup?: boolean;
}

export interface Friend {
  id: string;
  username: string;
  level: number;
  avatar: string;
  isOnline: boolean;
}

export interface FriendRequest {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any; // Firestore timestamp
  fromUser?: User; // Populated by the frontend
}

export interface DailyActivity {
    date: Timestamp;
    xp: number;
}
