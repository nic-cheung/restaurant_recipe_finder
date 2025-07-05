import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Welcome: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Success Animation */}
        <div className="relative">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute top-4 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute top-8 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute top-2 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Recipe Finder, {user?.name?.split(' ')[0]}! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Your account is all set up and your preferences have been saved. 
            You're ready to discover amazing recipes tailored just for you!
          </p>
        </div>

        {/* Features Highlight */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">What's Next?</h2>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Generate Your First Recipe</h3>
                <p className="text-sm text-gray-600">Get personalized recommendations based on your preferences</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Save Your Favorites</h3>
                <p className="text-sm text-gray-600">Build your personal recipe collection</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Update Preferences</h3>
                <p className="text-sm text-gray-600">Refine your taste profile anytime</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/generate"
            className="w-full btn-primary text-lg py-3 px-6 flex items-center justify-center space-x-2"
          >
            <span>🍳</span>
            <span>Generate My First Recipe</span>
          </Link>
          
          <div className="flex space-x-3">
            <Link
              to="/dashboard"
              className="flex-1 btn-secondary py-2 px-4 text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/preferences"
              className="flex-1 btn-secondary py-2 px-4 text-center"
            >
              Edit Preferences
            </Link>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 rounded-lg p-4 text-left">
          <h3 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Try different cuisine types to discover new flavors</li>
            <li>• Update your preferences as your tastes evolve</li>
            <li>• Rate recipes to get better recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 