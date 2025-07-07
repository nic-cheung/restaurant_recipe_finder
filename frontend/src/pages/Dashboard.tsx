import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPassword(true);

    try {
      await apiService.updatePassword(passwordData);
      toast.success('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flambé-heading mb-2">
          welcome back, {user?.name}!
        </h1>
        <p className="flambé-body text-lg" style={{ color: 'var(--flambé-ash)' }}>
          manage your account and start cooking
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="preference-card">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(212, 165, 116, 0.1)' }}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--flambé-ember)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 className="flambé-heading text-lg mb-1">AI recipe generator</h3>
              <p className="flambé-body text-sm">
                create personalized recipes based on your preferences
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
          <Link to="/preferences" className="btn-secondary w-full text-center">
            manage preferences
          </Link>
        </div>
      </div>

      {/* Account Information */}
      <div className="preference-card mb-6">
        <h2 className="text-xl font-semibold flambé-heading mb-4">
          account information
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="flambé-body">name:</span>
            <span className="font-medium flambé-body">{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="flambé-body">email:</span>
            <span className="font-medium flambé-body">{user?.email}</span>
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

      {/* Security Settings */}
      <div className="preference-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flambé-heading">
            security settings
          </h2>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn-secondary text-sm px-4 py-2"
            >
              change password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="preference-label">
                current password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="input-field"
                placeholder="enter your current password"
                required
              />
            </div>
            
            <div>
              <label className="preference-label">
                new password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="input-field"
                placeholder="enter your new password"
                required
              />
              <p className="mt-1 text-xs flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
                minimum 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>
            
            <div>
              <label className="preference-label">
                confirm new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="input-field"
                placeholder="confirm your new password"
                required
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="btn-secondary"
              >
                cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="btn-primary disabled:opacity-50"
              >
                {isUpdatingPassword ? 'updating...' : 'update password'}
              </button>
            </div>
          </form>
        )}

        {!showPasswordForm && (
          <div className="flambé-body text-sm" style={{ color: 'var(--flambé-ash)' }}>
            <p>keep your account secure by using a strong password and updating it regularly.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 