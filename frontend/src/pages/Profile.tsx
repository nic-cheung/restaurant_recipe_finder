import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApiUsageDisplay from '../components/ApiUsageDisplay';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    location: user?.location || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    console.log('Update profile:', formData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      location: user?.location || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Profile
        </h1>
        <p className="text-lg text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Account Information
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                className="input-field"
                placeholder="e.g., San Francisco, CA"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="input-field bg-gray-50"
                value={user?.email || ''}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address cannot be changed
              </p>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="btn-primary"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-gray-900">{user?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <p className="text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <p className="text-gray-900">{user?.location || 'Not specified'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member Since
              </label>
              <p className="text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* API Usage Display */}
      <div className="mt-8">
        <ApiUsageDisplay />
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Settings
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
            <button className="btn-secondary">
              Change Password
            </button>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <div>
              <h3 className="font-medium text-gray-900">Dietary Preferences</h3>
              <p className="text-sm text-gray-600">Set your dietary restrictions and preferences</p>
            </div>
            <button className="btn-secondary">
              Manage Preferences
            </button>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <div>
              <h3 className="font-medium text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 