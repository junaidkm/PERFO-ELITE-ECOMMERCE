import React, { useContext, useEffect, useState } from "react"
import Layout from "../components/Layout"
import { AuthContext } from "../context/AuthContext"
import { CartContext } from "../context/CartContext"
import { useNavigate, useLocation } from "react-router-dom"
import { MapPin, CreditCard, Truck, ShieldCheck, Lock, Package, CheckCircle2 } from "lucide-react"
import { createOrder } from "../services/orderService"

function Payment() {
  const { userId } = useContext(AuthContext)
  const { cart, clearCart, loading: cartLoading } = useContext(CartContext)

  const navigate = useNavigate()
  const location = useLocation()

  const buyNowItem = location.state?.buyNowItem

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("cod")

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    city: "",
    pincode: "",
    addressLine: ""
  })

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: ""
  })

  useEffect(() => {
    if (!userId) return navigate("/login")

    if (buyNowItem) {
      setItems([
        {
          productId: buyNowItem.id,
          name: buyNowItem.name,
          img: buyNowItem.img,
          size: buyNowItem.selectedSize?.size || "Default",
          price: buyNowItem.selectedSize?.price || buyNowItem.price,
          quantity: buyNowItem.quantity || 1
        }
      ])
      setLoading(false)
    } else {
      const safeCart = (cart || []).map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        img: item.img,
        size: item.size || "Default",
        price: item.price,
        quantity: item.quantity || 1
      }))

      setItems(safeCart)
      setLoading(cartLoading)
    }
  }, [userId, navigate, buyNowItem, cart, cartLoading])

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  )
  const delivery = subtotal > 5000 || subtotal === 0 ? 0 : 199
  const total = subtotal + delivery

  const isAddressValid =
    address.name.trim().length >= 3 &&
    address.phone.length === 10 &&
    address.city.trim().length >= 2 &&
    address.pincode.length === 6 &&
    address.addressLine.trim().length >= 5

  const isCardValid =
    cardDetails.cardNumber.length === 16 &&
    cardDetails.cvv.length >= 3 &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry)

  const handleOrder = async () => {
    if (!isAddressValid) {
      alert("Please fill in shipping address correctly")
      return
    }

    if (paymentMethod === "card" && !isCardValid) {
      alert("Invalid card details")
      return
    }

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          img: item.img,
          size: item.size,
          price: item.price,
          quantity: item.quantity
        })),
        total,
        address,
        paymentMethod
      }

      await createOrder(orderData)

      if (!buyNowItem) {
        await clearCart()
      }
      navigate("/success")
    } catch (error) {
      console.error("Order failed:", error)
      alert("Something went wrong with processing order")
    }
  }

  const inputClass =
    "w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa]">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading checkout...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Checkout</h1>
            <p className="text-gray-500 mt-1">Complete your shipping and payment details below</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Column - Shipping & Payment Forms */}
            <div className="flex-1 space-y-6">

              {/* Shipping Address */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                    <p className="text-xs text-gray-400">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      placeholder="John Doe"
                      className={inputClass}
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      placeholder="10-digit phone number"
                      className={inputClass}
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                    <input
                      placeholder="Your city"
                      className={inputClass}
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pincode</label>
                    <input
                      placeholder="6-digit pincode"
                      className={inputClass}
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Address</label>
                  <textarea
                    placeholder="House no, street, area, landmark..."
                    rows="3"
                    className={inputClass + " resize-none"}
                    value={address.addressLine}
                    onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                    <p className="text-xs text-gray-400">Choose your preferred payment method</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 ${paymentMethod === "cod" ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="w-4 h-4 text-gray-900 accent-gray-900"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <Truck className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Cash on Delivery</p>
                        <p className="text-xs text-gray-400">Pay cash upon delivery</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 ${paymentMethod === "card" ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 text-gray-900 accent-gray-900"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">Credit / Debit Card</p>
                        <p className="text-xs text-gray-400">Instant secure online payment</p>
                      </div>
                    </div>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4 pt-6 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                      <input
                        placeholder="16-digit card number"
                        className={inputClass}
                        maxLength={16}
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value.replace(/\D/g, "") })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Card Holder Name</label>
                      <input
                        placeholder="Name on card"
                        className={inputClass}
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry</label>
                        <input
                          placeholder="MM/YY"
                          className={inputClass}
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CVV</label>
                        <input
                          placeholder="•••"
                          className={inputClass}
                          maxLength={3}
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "") })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  Order Summary
                </h2>

                {/* Items Preview */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={item.img} alt={item.name} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} · Size: {item.size}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">₹ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-600">{delivery === 0 ? "FREE" : `₹ ${delivery}`}</span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="flex justify-between text-lg font-black text-gray-900 mb-6">
                  <span>Total</span>
                  <span>₹ {total.toLocaleString()}</span>
                </div>

                <button
                  disabled={
                    !isAddressValid ||
                    (paymentMethod === "card" && !isCardValid)
                  }
                  onClick={handleOrder}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-300
                    ${isAddressValid && (paymentMethod !== "card" || isCardValid)
                      ? "bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-95"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                  <Lock className="w-4 h-4" />
                  Place Order
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Encrypted & Secure Checkout</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Payment