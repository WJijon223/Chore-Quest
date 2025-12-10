import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from './services/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // In a real app, you would fetch the user's profile from a database.
        // For this version, we'll create a user object based on the Firebase user,
        // falling back to mock data.
        setAppUser({
            ...MOCK_USER,
            username: user.displayName || 'New Hero', // Use display name from Google or a default
            email: user.email || '',
        });
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
        setAuthView('login');
    });
  };

  if (loading) {
    // You can replace this with a proper splash screen component
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
        onLogin={() => {
          // No action needed here, onAuthStateChanged handles it
        }} 
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
