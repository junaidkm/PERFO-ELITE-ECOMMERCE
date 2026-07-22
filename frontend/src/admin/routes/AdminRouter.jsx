import { Routes, Route } from "react-router-dom"
import AdminLayout from "../components/AdminLayout"

import Dashboard from "../pages/Dashboard"
import Products from "../pages/Products"
import Users from "../pages/Users"
import Orders from "../pages/Orders"
import Profile from "../pages/Profile"

function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>

        <Route index element={<Dashboard />} />

        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />
        <Route path="orders" element={<Orders />} />

        <Route path="profile/:id" element={<Profile />} />

      </Route>
    </Routes>
  )
}

export default AdminRouter