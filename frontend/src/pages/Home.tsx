import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="text-8xl mb-6">🍳</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Recipe Finder
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover personalized recipes based on your preferences, dietary restrictions, 
          and available ingredients. Let AI help you create delicious meals every day.
        </p>
        
        {user ? (
          <div className="space-x-4">
            <Link
              to="/generate"
              className="btn-primary text-lg px-8 py-3"
            >
              Generate Recipe
            </Link>
            <Link
              to="/dashboard"
              className="btn-secondary text-lg px-8 py-3"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-x-4">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-lg px-8 py-3"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose Recipe Finder?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              AI-Powered Recommendations
            </h3>
            <p className="text-gray-600">
              Our advanced AI analyzes your preferences and suggests recipes 
              tailored specifically to your taste and dietary needs.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">🥗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Dietary Preferences
            </h3>
            <p className="text-gray-600">
              Whether you're vegan, keto, gluten-free, or have other dietary 
              restrictions, we'll find recipes that work for you.
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Easy to Use
            </h3>
            <p className="text-gray-600">
              Simple, intuitive interface that makes finding and cooking 
              new recipes a breeze. Save favorites and track your cooking journey.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Sign Up</h3>
            <p className="text-gray-600 text-sm">
              Create your account and set up your preferences
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Set Preferences</h3>
            <p className="text-gray-600 text-sm">
              Tell us about your dietary needs and cooking style
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Generate Recipes</h3>
            <p className="text-gray-600 text-sm">
              Get personalized recipe recommendations instantly
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Start Cooking</h3>
            <p className="text-gray-600 text-sm">
              Follow step-by-step instructions and enjoy your meal
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Cooking?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of home cooks who have discovered their new favorite recipes.
          </p>
          <Link
            to="/register"
            className="btn-primary text-lg px-8 py-3"
          >
            Sign Up Free
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home; 