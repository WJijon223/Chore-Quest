import React, { useState } from 'react';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import GoogleHeroSetup from './pages/GoogleHeroSetup';
import Dashboard from './pages/Dashboard';
import BossPage from './pages/BossPage';
import Layout from './components/Layout';
import { MOCK_USER, MOCK_FRIENDS, MOCK_BOSSES } from './constants';
import { User } from './types';

type Page = 'dashboard' | 'bosses';
type AuthMode = 'login' | 'signup' | 'google-setup';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [user, setUser] = useState<User>(MOCK_USER);

  if (!isAuthenticated) {
    if (authMode === 'signup') {
        return (
            <SignUp 
                onSignUp={() => {
                    // After sign up, we redirect to login to simulate "check your email" flow
                    setAuthMode('login');
                }}
                onGoogleSignUp={() => setAuthMode('google-setup')}
                onNavigateToLogin={() => setAuthMode('login')}
            />
        );
    }
    if (authMode === 'google-setup') {
        return (
            <GoogleHeroSetup 
                onComplete={(heroName) => {
                    setUser({ ...user, username: heroName });
                    setIsAuthenticated(true);
                }}
            />
        );
    }
    return (
        <Login 
            onLogin={() => setIsAuthenticated(true)} 
            onNavigateToSignUp={() => setAuthMode('signup')}
        />
    );
  }

  return (
    <Layout 
      activePage={currentPage} 
      onNavigate={setCurrentPage} 
      onLogout={() => {
          setIsAuthenticated(false);
          setAuthMode('login');
      }}
    >
      {currentPage === 'dashboard' && (
        <Dashboard user={user} friends={MOCK_FRIENDS} />
      )}
      {currentPage === 'bosses' && (
        <BossPage bosses={MOCK_BOSSES} />
      )}
    </Layout>
  );
};

export default App;