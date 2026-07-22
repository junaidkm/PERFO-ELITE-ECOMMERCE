
import { createContext, useState, useEffect } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {

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

  const login = (id, token) => {
    localStorage.setItem("userId", id)
    localStorage.setItem("token", token)
    setUserId(id)
  }

  const logout = async () => {
    try {
      if (userId) {
        await api.post("/auth/logout")
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      localStorage.removeItem("userId")
      localStorage.removeItem("token")
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
          localStorage.removeItem("token")
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