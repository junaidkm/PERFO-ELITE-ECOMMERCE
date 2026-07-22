import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

function ProtectedRoute({ children }) {
  const { userId } = useContext(AuthContext)

  if (!userId) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute