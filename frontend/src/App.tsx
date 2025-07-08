import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import MultiStepRegistration from './components/MultiStepRegistration'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Welcome from './pages/Welcome'
import Dashboard from './pages/Dashboard'
import RecipeGenerator from './pages/RecipeGenerator'
import Profile from './pages/Profile'
import Preferences from './pages/Preferences'
import MyRecipes from './pages/MyRecipes'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<MultiStepRegistration />} />
              <Route path="register-simple" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="welcome" element={
                <ProtectedRoute>
                  <Welcome />
                </ProtectedRoute>
              } />
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="generate" element={
                <ProtectedRoute>
                  <RecipeGenerator />
                </ProtectedRoute>
              } />
              <Route path="my-recipes" element={
                <ProtectedRoute>
                  <MyRecipes />
                </ProtectedRoute>
              } />
              <Route path="profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="preferences" element={
                <ProtectedRoute>
                  <Preferences />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 