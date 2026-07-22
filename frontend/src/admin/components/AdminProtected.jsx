import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

function AdminProtected({ children }) {
  const { user, loading, userId } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking admin access...</p>
      </div>
    )
  }

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminProtected