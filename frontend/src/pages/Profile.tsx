import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApiUsageDisplay from '../components/ApiUsageDisplay';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    email: user?.email || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    console.log('Update profile:', formData);
    setIsEditing(false);
    setIsUpdating(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      location: user?.location || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const handleUpdateProfile = async () => {
    // TODO: Implement profile update API call
    console.log('Update profile:', formData);
    setIsUpdating(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flambé-heading mb-2">
          profile
        </h1>
        <p className="flambé-body text-lg" style={{ color: 'var(--flambé-ash)' }}>
          manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Information */}
        <div className="preference-card">
          <h2 className="flambé-heading text-xl mb-4">
            account information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="preference-label">
                full name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                placeholder="enter your full name"
              />
            </div>
            
            <div>
              <label className="preference-label">
                email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
                placeholder="enter your email address"
              />
            </div>
            
            <button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="btn-primary w-full"
            >
              {isUpdating ? 'updating...' : 'update profile'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="preference-card">
          <h2 className="flambé-heading text-xl mb-4">
            quick actions
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--flambé-stone)' }}>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="flambé-heading font-medium">change password</h3>
              </div>
              <p className="text-xs mt-1 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
                update your account password for security
              </p>
              <button className="btn-secondary mt-3 w-full">
                update password
              </button>
            </div>
            
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--flambé-stone)' }}>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h3 className="flambé-heading font-medium">dietary preferences</h3>
              </div>
              <p className="text-xs mt-1 flambé-body" style={{ color: 'var(--flambé-smoke)' }}>
                update your dietary restrictions and preferences
              </p>
              <Link to="/preferences" className="btn-secondary mt-3 w-full block text-center">
                manage preferences
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="mt-8 preference-card">
        <h2 className="flambé-heading text-xl mb-4">
          account settings
        </h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'var(--flambé-ash)' }}>
            <div>
              <h3 className="font-medium flambé-heading">change password</h3>
              <p className="text-sm flambé-body">update your account password</p>
            </div>
            <button className="btn-secondary">
              change
            </button>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'var(--flambé-ash)' }}>
            <div>
              <h3 className="font-medium flambé-heading">dietary preferences</h3>
              <p className="text-sm flambé-body">set your dietary restrictions and preferences</p>
            </div>
            <Link to="/preferences" className="btn-secondary">
              manage
            </Link>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <div>
              <h3 className="font-medium" style={{ color: 'var(--flambé-rust)' }}>delete account</h3>
              <p className="text-sm flambé-body">permanently delete your account and all data</p>
            </div>
            <button 
              className="px-4 py-2 rounded-sm text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--flambé-rust)',
                color: 'var(--flambé-cream)'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-ember)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--flambé-rust)';
              }}
            >
              delete account
            </button>
          </div>
        </div>
      </div>

      {/* API Usage Display */}
      <div className="mt-8">
        <ApiUsageDisplay />
      </div>
    </div>
  );
};

export default Profile; 