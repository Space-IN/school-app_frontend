import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./authContext"
import { api } from "../api/api"

export const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()

  const [adminObjectId, setAdminObjectId] = useState(null) 
  const [adminUserId, setAdminUserId] = useState(null)     
  const [adminData, setAdminData] = useState(null)
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminErr, setAdminErr] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setAdminLoading(false)
      return
    }

    const loadAdminProfile = async () => {
      try {
        const res = await api.get("/api/admin/adminprofile")

        const admin = res.data?.data
        if (!admin?._id) {
          throw new Error("Admin ObjectId missing in response")
        }

        setAdminObjectId(admin._id)
        setAdminUserId(admin.adminId)
        setAdminData(admin)
      } catch (err) {
        console.error(" Failed to load admin profile:", err)
        setAdminErr(err)
      } finally {
        setAdminLoading(false)
      }
    }

    loadAdminProfile()
  }, [isAuthenticated])

  return (
    <AdminContext.Provider
      value={{
        adminObjectId, 
        adminUserId,   
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