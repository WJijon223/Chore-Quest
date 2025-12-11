import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
  serverTimestamp
} from 'firebase/firestore';
import { User, FriendRequest, Friend } from '../types';

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

export const acceptFriendRequest = async (requestId: string, fromId: string, toId: string) => {
    const fromUserRef = doc(db, 'users', fromId);
    const toUserRef = doc(db, 'users', toId);

    await updateDoc(fromUserRef, { friends: arrayUnion(toId) });
    await updateDoc(toUserRef, { friends: arrayUnion(fromId) });

    const requestRef = doc(db, 'friendRequests', requestId);
    await deleteDoc(requestRef);
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

export { app, auth, db };
