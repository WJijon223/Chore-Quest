import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db, getFriends } from './services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import BossPage from './pages/BossPage';
import Layout from './components/Layout';
import { MOCK_BOSSES } from './constants';
import { User, Friend } from './types';

type Page = 'dashboard' | 'bosses';
type AuthView = 'login' | 'signup';

const DEFAULT_USER_DATA = {
    avatar: 'https://placehold.co/128x128/EED8B7/6B4F3A/png?text=Hero',
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    bossesDefeated: 0,
    friends: [],
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setAppUser({ id: user.uid, ...userDoc.data() } as User);
            } else {
              const newUser: User = {
                id: user.uid,
                username: user.displayName || 'New Hero',
                ...DEFAULT_USER_DATA,
              };
              await setDoc(userDocRef, newUser);
              setAppUser(newUser);
            }

            const friendsData = await getFriends(user.uid);
            setFriends(friendsData);

        } catch (error) {
            console.error("Error fetching or creating user document:", error);
            setAppUser({
                id: user.uid,
                username: 'Error Hero',
                ...DEFAULT_USER_DATA,
            });
        }
      } else {
        setAppUser(null);
        setFriends([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          onSignUp={() => setAuthView('login')} 
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
        <BossPage bosses={MOCK_BOSSES} />
      )}
    </Layout>
  );
};

export default App;
