/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;

      match /activity/{activityId} {
        allow read, write: if request.auth.uid == userId;
      }
      match /bosses/{bossId} {
        allow read, write: if request.auth.uid == userId;
      }
      match /geminiHistory/{historyId} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    match /friendRequests/{requestId} {
      allow create: if request.auth.uid == request.resource.data.from;
      allow update: if request.auth.uid == resource.data.to;
      allow read, delete: if request.auth.uid == resource.data.to || request.auth.uid == resource.data.from;
    }
  }
}
*/
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseAuthUser } from 'firebase/auth';
import { 
  getFirestore, 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit,
  setDoc
} from 'firebase/firestore';
import { User, FriendRequest, Friend, DailyActivity, Boss, GeminiAPICall } from '../types';
import { getXPForLevel } from './xpService';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
  
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        const newUser: User = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || `Hero${Math.floor(Math.random() * 1000)}`,
          email: firebaseUser.email!,
          avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${firebaseUser.uid}`,
          level: 1,
          currentXP: 0,
          xpToNextLevel: getXPForLevel(1),
          bossesDefeated: 0,
          friends: [],
          needsUsernameSetup: true,
        };
        await setDoc(userDocRef, newUser);
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

export const updateUsernameAndFinalize = async (userId: string, username: string): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { 
        username, 
        needsUsernameSetup: false 
    });
};

export const searchUsersByUsername = async (username: string): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  const users: User[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() } as User);
  });
  return users;
};

export const sendFriendRequest = async (fromId: string, toId: string) => {
  if (fromId === toId) throw new Error("You cannot send a friend request to yourself.");
  const requestsRef = collection(db, 'friendRequests');
  const q = query(requestsRef, where('from', '==', fromId), where('to', '==', toId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) throw new Error("Friend request already sent.");
  await addDoc(requestsRef, {
    from: fromId,
    to: toId,
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

export const getFriendRequests = async (userId: string): Promise<FriendRequest[]> => {
  const requestsRef = collection(db, 'friendRequests');
  const q = query(requestsRef, where('to', '==', userId), where('status', '==', 'pending'));
  const querySnapshot = await getDocs(q);
  const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));

  const populatedRequests = await Promise.all(
    requests.map(async (request) => {
      if (!request.from) {
        console.error("Friend request with id " + request.id + " is missing 'from' field.");
        return null;
      }
      
      try {
        const userDoc = await getDoc(doc(db, 'users', request.from));
        if (userDoc.exists()) {
          return {
            ...request,
            fromUser: { id: userDoc.id, ...userDoc.data() } as User,
          };
        } else {
          console.error("User not found for friend request: " + request.from);
          return null;
        }
      } catch (error) {
        console.error(`Failed to fetch user for request ${request.id}:`, error);
        return null; 
      }
    })
  );
  
  return populatedRequests.filter(Boolean) as FriendRequest[];
};

export const acceptFriendRequest = async (requestId: string) => {
    const requestRef = doc(db, 'friendRequests', requestId);
    await updateDoc(requestRef, { status: 'accepted' });
};

export const declineFriendRequest = async (requestId: string) => {
    const requestRef = doc(db, 'friendRequests', requestId);
    await deleteDoc(requestRef);
};

export const getFriends = async (userId: string): Promise<Friend[]> => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    console.error("User not found");
    return [];
  }

  const userData = userDoc.data() as User;
  const friendIds = userData.friends || [];

  if (friendIds.length === 0) {
    return [];
  }

  const friends: Friend[] = await Promise.all(
    friendIds.map(async (friendId: string) => {
      const friendDocRef = doc(db, 'users', friendId);
      const friendDoc = await getDoc(friendDocRef);
      if (friendDoc.exists()) {
        return { id: friendDoc.id, ...friendDoc.data() } as Friend;
      }
      return null;
    })
  );

  return friends.filter((friend): friend is Friend => friend !== null);
};

export const getWeeklyXPActivity = async (userId: string): Promise<DailyActivity[]> => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(today.getUTCDate() - 6);
  
  const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);

  const activityRef = collection(db, 'users', userId, 'activity');
  const q = query(
      activityRef, 
      where('date', '>=', sevenDaysAgoTimestamp),
      orderBy('date', 'desc'),
      limit(7)
  );

  const querySnapshot = await getDocs(q);
  const activityData: DailyActivity[] = [];
  querySnapshot.forEach((doc) => {
      activityData.push(doc.data() as DailyActivity);
  });

  return activityData;
};

export const getBosses = async (userId: string): Promise<Boss[]> => {
    const bossesRef = collection(db, 'users', userId, 'bosses');
    const q = query(bossesRef);
    const querySnapshot = await getDocs(q);
    const bosses: Boss[] = [];
    querySnapshot.forEach((doc) => {
        bosses.push({ id: doc.id, ...doc.data() } as Boss);
    });
    return bosses;
}

export const addBoss = async (userId: string, boss: Omit<Boss, 'id'>): Promise<string> => {
    const bossesRef = collection(db, 'users', userId, 'bosses');
    const docRef = await addDoc(bossesRef, boss);
    return docRef.id;
}

export const updateBoss = async (userId: string, bossId: string, updates: Partial<Boss>): Promise<void> => {
    const bossRef = doc(db, 'users', userId, 'bosses', bossId);
    await updateDoc(bossRef, updates);
}

export const getGeminiAPICalls = async (userId: string): Promise<GeminiAPICall[]> => {
  const historyRef = collection(db, 'users', userId, 'geminiHistory');
  const q = query(historyRef, orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  const history: GeminiAPICall[] = [];
  querySnapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() } as GeminiAPICall);
  });
  return history;
}

export const addGeminiAPICall = async (userId: string, call: Omit<GeminiAPICall, 'id' | 'timestamp'>): Promise<string> => {
  const historyRef = collection(db, 'users', userId, 'geminiHistory');
  const docRef = await addDoc(historyRef, {
      ...call,
      timestamp: serverTimestamp()
  });
  return docRef.id;
}

export { app, auth, db };
''