import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Ready to discover some delicious recipes?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">🍳</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Generate Recipe
            </h3>
            <p className="text-gray-600 mb-4">
              Create personalized recipes based on your preferences and available ingredients
            </p>
            <button className="btn-primary w-full">
              Start Cooking
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Saved Recipes
            </h3>
            <p className="text-gray-600 mb-4">
              Access your favorite recipes and cooking history
            </p>
            <button className="btn-secondary w-full">
              View Collection
            </button>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Preferences
            </h3>
            <p className="text-gray-600 mb-4">
              Update your dietary preferences and cooking style
            </p>
            <button className="btn-secondary w-full">
              Manage Settings
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Your Profile
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          {user?.location && (
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">{user.location}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Member since:</span>
            <span className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 