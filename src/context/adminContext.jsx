import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./authContext"

export const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const { decodedToken, loading: authLoading } = useAuth()

  const [adminId, setAdminId] = useState(null)
  const [adminData, setAdminData] = useState(null)
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminErr, setAdminErr] = useState(null)

  useEffect(() => {
    if (authLoading) return

    if (!decodedToken) {
      setAdminLoading(false)
      return
    }

    try {
      const id =
        decodedToken?.preferred_username ||
        decodedToken?.userId ||
        decodedToken?.sub

      if (!id) throw new Error("Admin ID missing in token")

      setAdminId(id)
      setAdminData({ adminId: id })
    } catch (err) {
      console.error("❌ Admin context error:", err)
      setAdminErr(err)
    } finally {
      setAdminLoading(false)
    }
  }, [decodedToken, authLoading])

  return (
    <AdminContext.Provider
      value={{
        adminId,
        adminData,
        adminLoading,
        adminErr,
      }}
    >
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
