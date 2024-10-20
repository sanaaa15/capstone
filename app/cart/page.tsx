'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import ScrollingText from '../components/ScrollingText';

const Cart = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container py-4">
        <ScrollingText text="YOUR CART" />
        <div className="flex justify-between">
          <div className="w-2/3 m-10 bg-beige border border-gray-300 p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex m-4 items-center">
                <Image
                  src="/kurta-1.png"
                  alt="Kurta"
                  width={100}
                  height={150}
                  className="rounded-lg"
                />
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">Price: ₹₹₹₹₹</h2>
                  <p>Description: Plain white kurta with Long Sleeves.</p>
                  <div className="mt-2">
                    <label htmlFor="quantity" className="mr-2">Qty:</label>
                    <select id="quantity" className="border rounded p-1">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                </div>
              </div>
              <button className="text-red-500 hover:text-red-700">
                <span className="material-icons">close</span>
              </button>
            </div>
            {isClient && (
              <Link href="/customization">
                <button className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300">
                  Customize
                </button>
              </Link>
            )}
          </div>
          <div className="w-1/3 m-10 bg-navy text-white p-4 rounded-lg shadow-lg">
            <h2 className="text-ls font-semibold mb-4">Apply Coupons</h2>
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-grow p-2 rounded-l-lg"
                placeholder="Enter coupon code"
              />
              <button className="bg-white text-navy p-2 rounded-r-lg">Apply</button>
            </div>
            <h2 className="text-ls font-semibold mb-4">Price Details</h2>
            <div className="mb-4 text-sm">
              <p>Total MRP:</p>
              <p>Discount on MRP:</p>
              <p>Coupon Discount:</p>
              <p>Platform Fee:</p>
              <p>Tailoring Fee:</p>
              <p>Shipping Fee:</p>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Total Amount:</h2>
            <button className="w-full bg-white text-navy py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300">
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart