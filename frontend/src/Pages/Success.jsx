import React from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { CheckCircle, Home, ShoppingBag, ArrowRight } from "lucide-react"

function Success() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4 py-10">

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 text-center max-w-md w-full relative overflow-hidden">

          {/* Background decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400"></div>

          {/* Success icon */}
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Order Placed!
          </h1>

          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-xs mx-auto">
            Your order has been placed successfully. You will receive it soon! 🎉
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base bg-gray-900 text-white hover:bg-black transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-95"
            >
              <Home className="w-5 h-5" />
              Go to Home
            </button>

            <button
              onClick={() => navigate("/products")}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>

          <button
            onClick={() => navigate("/order")}
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            View My Orders <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    </Layout>
  )
}

export default Success