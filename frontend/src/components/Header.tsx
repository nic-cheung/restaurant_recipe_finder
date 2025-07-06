import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Header = () => {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🍳</span>
            <span className="text-xl font-bold text-gray-900">Recipe Finder</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/generate" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Generate Recipe
                </Link>
                <Link to="/my-recipes" className="text-gray-600 hover:text-gray-900 transition-colors">
                  My Recipes
                </Link>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Profile
                </Link>
                <Link to="/preferences" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Preferences
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header 