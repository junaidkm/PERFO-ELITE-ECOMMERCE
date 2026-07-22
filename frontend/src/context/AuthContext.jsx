
import { createContext, useState, useEffect } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

  // userId is stored in localStorage so the profile can be refetched on page reload.
  // The actual JWT token lives in a secure httpOnly cookie — never accessible to JS.
  const [userId, setUserId] = useState(
    () => localStorage.getItem("userId")
  )

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
    }
  }, [userId])

  // Called after a successful login/register — token is already in the httpOnly cookie
  const login = (id) => {
    localStorage.setItem("userId", id)
    setUserId(id)
  }

  const logout = async () => {
    try {
      if (userId) {
        await api.post("/auth/logout") // Backend clears the httpOnly cookie
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem("userId")
      setUserId(null)
      setUser(null)
    }
  }

  useEffect(() => {
    if (!userId) return

    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${userId}`)
        setUser(data)
      } catch (err) {
        console.log(err)
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("userId")
          setUserId(null)
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  useEffect(() => {
    const handleUnload = async () => {
      if (userId) {
        try {
          await api.patch(`/users/${userId}`, {
            isOnline: false
          })
        } catch (err) {
          console.log("Unload error:", err)
        }
      }
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [userId])

  return (
    <AuthContext.Provider
      value={{
        userId,
        user,
        login,
        logout,
        loading,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}