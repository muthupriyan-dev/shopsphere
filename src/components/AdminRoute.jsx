import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <LoadingSpinner label="Checking access" />
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
