
import { createContext, useState, useEffect } from "react"
import { api } from "../services/api"

export const AuthContext = createContext()

// Helper functions to manage cookies in frontend JavaScript
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const setCookie = (name, value, days = 30) => {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
};

const removeCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

export const AuthProvider = ({ children }) => {

  // userId is stored in cookies so the profile can be refetched on page reload.
  const [userId, setUserId] = useState(
    () => getCookie("userId")
  )

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
    }
  }, [userId])

  // Called after a successful login/register
  const login = (id) => {
    setCookie("userId", id, 30)
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
      removeCookie("userId")
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
          removeCookie("userId")
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