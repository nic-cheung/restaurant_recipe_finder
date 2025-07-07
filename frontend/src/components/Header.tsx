import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header style={{ backgroundColor: 'var(--flambé-cream)', borderBottom: '1px solid var(--flambé-stone)' }} className="sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-0">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="flambé" 
              className="h-20 w-auto"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flambé-body transition-colors duration-200"
                  style={{ color: 'var(--flambé-ember)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-charcoal)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ember)'}
                >
                  dashboard
                </Link>
                <Link
                  to="/generate"
                  className="flambé-body transition-colors duration-200"
                  style={{ color: 'var(--flambé-ember)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-charcoal)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ember)'}
                >
                  generate recipe
                </Link>
                <Link
                  to="/my-recipes"
                  className="flambé-body transition-colors duration-200"
                  style={{ color: 'var(--flambé-ember)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-charcoal)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ember)'}
                >
                  my recipes
                </Link>
                <Link
                  to="/preferences"
                  className="flambé-body transition-colors duration-200"
                  style={{ color: 'var(--flambé-ember)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-charcoal)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ember)'}
                >
                  preferences
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="flambé-body text-sm" style={{ color: 'var(--flambé-smoke)' }}>
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="flambé-body transition-colors duration-200"
                  style={{ color: 'var(--flambé-ember)' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-charcoal)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ember)'}
                >
                  login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="p-2 rounded-sm transition-colors duration-200"
              style={{ color: 'var(--flambé-ash)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--flambé-charcoal)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--flambé-stone)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = 'var(--flambé-ash)';
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 