import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import BossPage from './pages/BossPage';
import Layout from './components/Layout';
import { MOCK_USER, MOCK_FRIENDS, MOCK_BOSSES } from './constants';
import { User } from './types';

type Page = 'dashboard' | 'bosses';
type AuthView = 'login' | 'signup';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setAppUser({ ...MOCK_USER, ...userDoc.data() } as User);
        } else {
          // Handle case where user exists in Auth but not Firestore
          setAppUser({
            ...MOCK_USER,
            username: user.displayName || 'New Hero',
            email: user.email || '',
        });
        }
      } else {
        setAppUser(null);
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
        <Dashboard user={appUser} friends={MOCK_FRIENDS} />
      )}
      {currentPage === 'bosses' && (
        <BossPage bosses={MOCK_BOSSES} />
      )}
    </Layout>
  );
};

export default App;
