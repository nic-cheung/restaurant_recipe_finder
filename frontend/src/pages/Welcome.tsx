import React from 'react';
import { Link } from 'react-router-dom';

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--flambé-cream)' }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(135deg, var(--flambé-fog) 0%, var(--flambé-stone) 50%, rgba(168, 181, 160, 0.1) 100%)'
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="flex justify-center items-center mb-4">
                <img 
                  src="/logo.svg" 
                  alt="flambé" 
                  className="h-40 sm:h-48 w-auto"
                />
              </div>
            </div>

            {/* Tagline */}
            <p 
              className="flambé-body text-xl sm:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed"
              style={{ color: 'var(--flambé-ash)' }}
            >
              discover recipes that match your taste, 
              <br />
              crafted with precision and passion
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4"
              >
                start your culinary journey
              </Link>
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-4"
              >
                welcome back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="flambé-heading text-3xl sm:text-4xl mb-4">
              thoughtfully curated
            </h2>
            <p 
              className="flambé-body text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--flambé-ash)' }}
            >
              every recipe suggestion is tailored to your preferences, 
              dietary needs, and culinary aspirations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="preference-card text-center">
              <div 
                className="w-12 h-12 mx-auto mb-6 rounded-sm flex items-center justify-center"
                style={{ backgroundColor: 'rgba(168, 181, 160, 0.15)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="flambé-heading text-xl mb-3">
                chef-inspired
              </h3>
              <p className="flambé-body text-sm leading-relaxed">
                recipes from michelin-starred chefs and culinary masters, 
                adapted for your home kitchen
              </p>
            </div>

            {/* Feature 2 */}
            <div className="preference-card text-center">
              <div 
                className="w-12 h-12 mx-auto mb-6 rounded-sm flex items-center justify-center"
                style={{ backgroundColor: 'rgba(74, 93, 58, 0.1)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="flambé-heading text-xl mb-3">
                ingredient-focused
              </h3>
              <p className="flambé-body text-sm leading-relaxed">
                seasonal ingredients and sustainable choices, 
                sourced from the finest producers
              </p>
            </div>

            {/* Feature 3 */}
            <div className="preference-card text-center">
              <div 
                className="w-12 h-12 mx-auto mb-6 rounded-sm flex items-center justify-center"
                style={{ backgroundColor: 'rgba(212, 165, 116, 0.15)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="flambé-heading text-xl mb-3">
                precisely personal
              </h3>
              <p className="flambé-body text-sm leading-relaxed">
                algorithms that understand your palate, 
                dietary restrictions, and cooking style
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div 
        className="py-24"
        style={{ backgroundColor: 'var(--flambé-fog)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="flambé-body text-lg sm:text-xl leading-relaxed mb-8" style={{ color: 'var(--flambé-ash)' }}>
            "cooking is not about convenience. it's about love, 
            <br />
            craft, and the joy of creating something beautiful."
          </blockquote>
          <div className="flambé-body text-sm" style={{ color: 'var(--flambé-smoke)' }}>
            — our philosophy
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="flambé-heading text-3xl sm:text-4xl mb-6">
            ready to begin?
          </h2>
          <p 
            className="flambé-body text-lg mb-8 max-w-2xl mx-auto"
            style={{ color: 'var(--flambé-ash)' }}
          >
            join flambé and discover recipes that speak to your soul
          </p>
          <Link
            to="/register"
            className="btn-primary text-lg px-8 py-4"
          >
            create your profile
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="py-12 border-t"
        style={{ 
          backgroundColor: 'var(--flambé-fog)',
          borderColor: 'var(--flambé-stone)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="flex items-center justify-center space-x-3">
              <img 
                src="/logo.svg" 
                alt="flambé" 
                className="h-16 w-auto"
              />
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="flambé-body text-sm" style={{ color: 'var(--flambé-smoke)' }}>
              crafted with passion for culinary excellence
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome; 