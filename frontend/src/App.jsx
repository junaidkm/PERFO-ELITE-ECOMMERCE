import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import AdminProtected from "./admin/components/AdminProtected"
import ProtectedRoute from "./components/ProtectedRoute"
import UserProtected from "./routes/UserProtected"

// Lazy loaded page components
const HomePage = lazy(() => import("./Pages/HomePage"))
const LoginPage = lazy(() => import("./Pages/LoginPage"))
const CartPage = lazy(() => import("./Pages/CartPage"))
const WishlistPage = lazy(() => import("./Pages/WishlistPage"))
const Products = lazy(() => import("./Pages/Products"))
const Registration = lazy(() => import("./Pages/Registration"))
const ProductDetails = lazy(() => import("./Pages/ProductDetails"))
const Profile = lazy(() => import("./Pages/Profile"))
const Payment = lazy(() => import("./Pages/Payment"))
const Success = lazy(() => import("./Pages/Success"))
const Order = lazy(() => import("./Pages/Order"))
const AdminRouter = lazy(() => import("./admin/routes/AdminRouter"))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <UserProtected>
                <HomePage />
              </UserProtected>
            }
          />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Registration />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/success" element={<Success />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <AdminProtected>
                <AdminRouter />
              </AdminProtected>
            }
          />
        </Routes>
      </Suspense>

      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
  )
}

export default App