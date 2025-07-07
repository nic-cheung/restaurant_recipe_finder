import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flambé-heading mb-2">
          welcome back, {user?.name}! 👋
        </h1>
        <p className="flambé-body text-lg" style={{ color: 'var(--flambé-ash)' }}>
          ready to create something delicious?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="preference-card">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-ember)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 className="flambé-heading text-lg mb-1">recipe generator</h3>
              <p className="flambé-body text-sm">
                create personalized recipes based on your preferences and available ingredients
              </p>
            </div>
          </div>
          <Link to="/generate" className="btn-primary w-full text-center">
            start cooking
          </Link>
        </div>

        <div className="preference-card">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(185, 136, 109, 0.1)' }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-rust)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 className="flambé-heading text-lg mb-1">my recipes</h3>
              <p className="flambé-body text-sm">
                access your favorite recipes and cooking history
              </p>
            </div>
          </div>
          <Link to="/my-recipes" className="btn-secondary w-full text-center">
            view collection
          </Link>
        </div>

        <div className="preference-card">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(74, 93, 58, 0.1)' }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-forest)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="flambé-heading text-lg mb-1">preferences</h3>
              <p className="flambé-body text-sm">
                update your dietary preferences and cooking style
              </p>
            </div>
          </div>
          <Link to="/profile" className="btn-secondary w-full text-center">
            your profile
          </Link>
        </div>
      </div>

      <div className="mt-8 preference-card">
        <h2 className="text-xl font-semibold flambé-heading mb-4">
          your profile
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="flambé-body">email:</span>
            <span className="font-medium flambé-body">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="flambé-body">name:</span>
            <span className="font-medium flambé-body">{user?.name}</span>
          </div>
          {user?.location && (
            <div className="flex justify-between">
              <span className="flambé-body">location:</span>
              <span className="font-medium flambé-body">{user.location}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="flambé-body">member since:</span>
            <span className="font-medium flambé-body">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'n/a'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 