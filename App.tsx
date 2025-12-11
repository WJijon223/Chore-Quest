import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db, getFriends } from './services/firebase';
import { 
    doc, setDoc, onSnapshot, collection, query, 
    where, writeBatch, arrayUnion 
} from 'firebase/firestore';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import BossPage from './pages/BossPage';
import Layout from './components/Layout';
import { MOCK_BOSSES } from './constants';
import { User, Friend } from './types';
import { getXPForLevel } from './services/xpService';
import GoogleHeroSetup from './pages/GoogleHeroSetup';

type Page = 'dashboard' | 'bosses';
type AuthView = 'login' | 'signup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [needsUsername, setNeedsUsername] = useState(false);

  const fetchFriends = async (userId: string) => {
    try {
      const friendsData = await getFriends(userId);
      setFriends(friendsData);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    let userSnapshotUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (userSnapshotUnsubscribe) {
        userSnapshotUnsubscribe();
      }

      if (user) {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);

        userSnapshotUnsubscribe = onSnapshot(userDocRef, async (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            if (userData.username === 'New Hero') {
              setNeedsUsername(true);
            } else {
              setAppUser({ id: user.uid, ...userData });
            }
          } else {
            // This case is now handled by the onSignUp function
          }
          fetchFriends(user.uid);
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setLoading(false);
        });
      } else {
        setAppUser(null);
        setFriends([]);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (userSnapshotUnsubscribe) {
        userSnapshotUnsubscribe();
      }
    };
  }, []);


  useEffect(() => {
    if (!appUser?.id) return;
    const userId = appUser.id;

    // Listener for when my SENT request was accepted by another user.
    // I am the 'from' user and am responsible for cleaning up the request.
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
      fetchFriends(userId);
    });

    // Listener for when I ACCEPT another user's request.
    // I am the 'to' user. I only update my own friends list.
    // The sender is responsible for deleting the request.
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
        fetchFriends(userId);
    });


    return () => {
      unsubscribeSent();
      unsubscribeReceived();
    };
  }, [appUser]);

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
    
    if (newUserData.username === 'New Hero') {
      setNeedsUsername(true);
    }
    
    setAppUser(newUserData);
    setAuthView('login');
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
        setAuthView('login');
    });
  };

  if (loading) {
    return <div className="fixed inset-0 bg-parchment-100 flex items-center justify-center"><h1 className="text-4xl font-serif text-parchment-800">Loading...</h1></div>;
  }

  if (!appUser) {
    if (authView === 'signup') {
      return (
        <SignUp 
          onSignUp={handleSignUp} 
          onNavigateToLogin={() => setAuthView('login')} 
        />
      );
    }
    return (
      <Login 
        onLogin={() => {}}
        onNavigateToSignUp={() => setAuthView('signup')} 
      />
    );
  }

  if (needsUsername) {
    return <GoogleHeroSetup onSetupComplete={() => setNeedsUsername(false)} />;
  }

  return (
    <Layout 
      activePage={currentPage} 
      onNavigate={setCurrentPage} 
      onLogout={handleLogout}
    >
      {currentPage === 'dashboard' && (
        <Dashboard 
          user={appUser} 
          friends={friends} 
          refreshFriends={() => fetchFriends(appUser.id)} 
        />
      )}
      {currentPage === 'bosses' && (
        <BossPage bosses={MOCK_BOSSES} />
      )}
    </Layout>
  );
};

export default App;
