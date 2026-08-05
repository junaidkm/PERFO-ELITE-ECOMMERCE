import { createContext, useState, useEffect, useCallback, useMemo } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

const getCookie = (name) => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(";").shift()
  return null
}

const setCookie = (name, value, days = 30) => {
  const d = new Date()
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`
}

const removeCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
}

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(() => getCookie("userId"))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
    }
  }, [userId])

  const login = useCallback((id, token) => {
    setCookie("userId", id, 30)
    if (token) setCookie("token", token, 30)
    setUserId(id)
  }, [])

  const logout = useCallback(async () => {
    try {
      if (userId) {
        await api.post("/auth/logout")
      }
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      removeCookie("userId")
      removeCookie("token")
      setUserId(null)
      setUser(null)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    let isMounted = true
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${userId}`)
        if (isMounted && data) {
          setUser({
            ...data,
            id: data.id || data._id?.toString()
          })
        }
      } catch (err) {
        console.error("Fetch user error:", err)
        if (err.response?.status === 401 || err.response?.status === 403) {
          removeCookie("userId")
          if (isMounted) {
            setUserId(null)
            setUser(null)
          }
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [userId])

  useEffect(() => {
    const handleUnload = async () => {
      if (userId) {
        try {
          await api.patch(`/users/${userId}`, { isOnline: false })
        } catch (err) {
          console.error("Unload error:", err)
        }
      }
    }

    window.addEventListener("beforeunload", handleUnload)

    return () => {
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [userId])

  const value = useMemo(
    () => ({
      userId,
      user,
      login,
      logout,
      loading,
      setUser
    }),
    [userId, user, login, logout, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}