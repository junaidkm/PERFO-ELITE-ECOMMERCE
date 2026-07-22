import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./Pages/LoginPage"
import HomePage from "./Pages/HomePage"
import CartPage from "./Pages/CartPage"
import WishlistPage from "./Pages/WishlistPage"
import Products from "./Pages/Products"
import Registration from "./Pages/Registration"
import ProductDetails from "./Pages/ProductDetails"
import Profile from "./Pages/Profile"
import Payment from "./Pages/Payment"
import Success from "./Pages/Success"
import Order from "./Pages/Order"


import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import AdminRouter from "./admin/routes/AdminRouter"
import AdminProtected from "./admin/components/AdminProtected"
import ProtectedRoute from "./components/ProtectedRoute"
import UserProtected from "./routes/UserProtected"
function App() {
  return (
    <BrowserRouter>
      <Routes>



        <Route path="/" element={
          <UserProtected>
            <HomePage /></UserProtected>
        } />

        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Registration />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/success" element={<Success />} />

        <Route path="/cart" element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />

        <Route path="/wishlist" element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } />

        <Route path="/order" element={
          <ProtectedRoute>
            <Order />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />

        <Route
          path="/admin/*"
          element={
            <AdminProtected>
              <AdminRouter />
            </AdminProtected>
          }
        />

      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  )
}

export default App