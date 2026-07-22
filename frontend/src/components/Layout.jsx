import React from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Navbar />

      <div className="flex-grow">      
        {children}
      </div>

      <Footer />

    </div>
  )
}

export default Layout