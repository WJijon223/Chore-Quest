import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './services/firebase';
import { 
    doc, setDoc, onSnapshot, collection, query, 
    where, writeBatch, arrayUnion 
} from 'firebase/firestore';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import BossPage from './pages/BossPage';
import Layout from './components/Layout';
import { User, Friend, Boss } from './types';
import { getXPForLevel } from './services/xpService';
import GoogleHeroSetup from './pages/GoogleHeroSetup';

type Page = 'dashboard' | 'bosses';
type AuthView = 'login' | 'signup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;
    let bossesUnsubscribe: (() => void) | null = null;
    let friendsUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      // Clean up all listeners on auth change
      if (userUnsubscribe) userUnsubscribe();
      if (bossesUnsubscribe) bossesUnsubscribe();
      if (friendsUnsubscribe) friendsUnsubscribe();

      if (user) {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);

        // --- User Listener ---
        userUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setAppUser({ id: user.uid, ...userData });
            
            // --- Friends Listener (nested) ---
            // This re-runs whenever the user document changes (e.g., friends array updates)
            if (friendsUnsubscribe) friendsUnsubscribe(); // Clean up old friends listener
            
            const friendIds = userData.friends || [];
            if (friendIds.length > 0) {
              const friendsQuery = query(collection(db, 'users'), where('__name__', 'in', friendIds));
              friendsUnsubscribe = onSnapshot(friendsQuery, (snapshot) => {
                const friendsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Friend));
                setFriends(friendsData);
              });
            } else {
              setFriends([]); // No friends, so ensure the list is empty
            }
          }
          setLoading(false);
        });

        // --- Bosses Listener ---
        const bossesQuery = query(collection(db, 'users', user.uid, 'bosses'));
        bossesUnsubscribe = onSnapshot(bossesQuery, (snapshot) => {
          const bossesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Boss));
          setBosses(bossesData);
        });

      } else {
        // Reset all state on logout
        setAppUser(null);
        setFriends([]);
        setBosses([]);
        setLoading(false);
      }
    });

    // Main cleanup for auth listener
    return () => {
      authUnsubscribe();
      if (userUnsubscribe) userUnsubscribe();
      if (bossesUnsubscribe) bossesUnsubscribe();
      if (friendsUnsubscribe) friendsUnsubscribe();
    };
  }, []);

  // This useEffect handles accepting friend requests and updating the user's friend array.
  // The listener above will then automatically update the friends list.
  useEffect(() => {
    if (!appUser?.id) return;
    const userId = appUser.id;

    const sentRequestsQuery = query(
      collection(db, "friendRequests"),
      where("from", "==", userId),
      where("status", "==", "accepted")
    );
    const unsubscribeSent = onSnapshot(sentRequestsQuery, async (snapshot) => {
      if (snapshot.empty) return;
      const batch = writeBatch(db);
      const userDocRef = doc(db, "users", userId);
      snapshot.docs.forEach(d => {
        const request = d.data();
        batch.update(userDocRef, { friends: arrayUnion(request.to) });
        batch.delete(d.ref);
      });
      await batch.commit();
    });

    const receivedRequestsQuery = query(
      collection(db, "friendRequests"),
      where("to", "==", userId),
      where("status", "==", "accepted")
    );
    const unsubscribeReceived = onSnapshot(receivedRequestsQuery, async (snapshot) => {
      if (snapshot.empty) return;
      const userDocRef = doc(db, "users", userId);
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => {
        const request = d.data();
        batch.update(userDocRef, { friends: arrayUnion(request.from) });
      });
      await batch.commit();
    });

    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  }, [appUser?.id]);

  const handleSignUp = async (user: FirebaseUser, username?: string) => {
    const userDocRef = doc(db, 'users', user.uid);
    const newUserData: User = {
      id: user.uid,
      username: username || user.displayName || 'New Hero',
      email: user.email || '',
      avatar: user.photoURL || 'https://placehold.co/128x128/EED8B7/6B4F3A/png?text=Hero',
      level: 1,
      currentXP: 0,
      xpToNextLevel: getXPForLevel(1),
      bossesDefeated: 0,
      friends: [],
    };
    await setDoc(userDocRef, newUserData, { merge: true });
    setAppUser(newUserData);
    setAuthView('login');
  };

  const handleLogout = () => {
    auth.signOut().then(() => setAuthView('login'));
  };

  if (loading) {
    return <div className="fixed inset-0 bg-parchment-100 flex items-center justify-center"><h1 className="text-4xl font-serif text-parchment-800">Loading...</h1></div>;
  }

  if (!appUser) {
    return authView === 'signup' ? (
      <SignUp onSignUp={handleSignUp} onNavigateToLogin={() => setAuthView('login')} />
    ) : (
      <Login onNavigateToSignUp={() => setAuthView('signup')} />
    );
  }

  if (appUser.needsUsernameSetup) {
    return <GoogleHeroSetup user={appUser} />;
  }

  return (
    <Layout 
      activePage={currentPage} 
      onNavigate={setCurrentPage} 
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' && (
        <Dashboard user={appUser} friends={friends} />
      )}
      {currentPage === 'bosses' && (
        <BossPage bosses={bosses} user={appUser} />
      )}
    </Layout>
  );
};

export default App;
