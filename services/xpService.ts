import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

const LEVEL_SCALING_FACTOR = 1.5;

export const calculateNewXpToNextLevel = (currentXpToNextLevel: number): number => {
  return Math.floor(currentXpToNextLevel * LEVEL_SCALING_FACTOR);
};

export const updateUserXP = async (user: User, xpGained: number): Promise<void> => {
  const userRef = doc(db, 'users', user.id);
  let newCurrentXP = user.currentXP + xpGained;
  let newLevel = user.level;
  let newXpToNextLevel = user.xpToNextLevel;

  if (newCurrentXP >= newXpToNextLevel) {
    newLevel += 1;
    newCurrentXP -= newXpToNextLevel;
    newXpToNextLevel = calculateNewXpToNextLevel(newXpToNextLevel);

    await updateDoc(userRef, {
      level: newLevel,
      currentXP: newCurrentXP,
      xpToNextLevel: newXpToNextLevel,
    });
  } else {
    await updateDoc(userRef, {
      currentXP: newCurrentXP,
    });
  }
};
