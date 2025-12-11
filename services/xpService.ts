import { doc, updateDoc, collection, increment, runTransaction, Timestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

const BASE_XP_TO_NEXT_LEVEL = 100;
const LEVEL_SCALING_FACTOR = 1.5;

export const getXPForLevel = (level: number): number => {
  let xp = BASE_XP_TO_NEXT_LEVEL;
  for (let i = 1; i < level; i++) {
    xp = Math.floor(xp * LEVEL_SCALING_FACTOR);
  }
  return xp;
};

const getLocalDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const updateUserXP = async (user: User, xpGained: number): Promise<void> => {
  if (xpGained <= 0) return;

  const userRef = doc(db, 'users', user.id);
  const today = getLocalDateString();
  const activityRef = doc(db, 'users', user.id, 'activity', today);

  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const activityDoc = await transaction.get(activityRef);

      if (!userDoc.exists()) {
        throw new Error("User document does not exist!");
      }

      const userData = userDoc.data();

      let newCurrentXP = userData.currentXP + xpGained;
      let newLevel = userData.level;
      let newXpToNextLevel = userData.xpToNextLevel;
      const updates: { [key: string]: any } = {};

      while (newCurrentXP >= newXpToNextLevel) {
        newLevel += 1;
        newCurrentXP -= newXpToNextLevel;
        newXpToNextLevel = getXPForLevel(newLevel);
      }

      updates.level = newLevel;
      updates.currentXP = newCurrentXP;
      updates.xpToNextLevel = newXpToNextLevel;
      
      transaction.update(userRef, updates);

      if (activityDoc.exists()) {
        transaction.update(activityRef, { xp: increment(xpGained) });
      } else {
        transaction.set(activityRef, { xp: xpGained, date: Timestamp.now() });
      }
    });
  } catch (error) {
    console.error("XP update transaction failed: ", error);
  }
};
