'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import ScrollingText from '../components/ScrollingText'

interface CartItem {
  kurtaId: string;
  description: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/getCart')
      if (!response.ok) {
        throw new Error('Failed to fetch cart items')
      }
      const data = await response.json()
      setCartItems(data.cartItems)
    } catch (error) {
      setError('Failed to load cart items')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container py-4">
        <ScrollingText text="YOUR CART" />
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <p>Your cart is empty</p>
            <Link href="/generation">
              <button className="mt-4 bg-navy text-white py-2 px-4 rounded-lg">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex justify-between">
            <div className="w-2/3 m-10">
              {cartItems.map((item) => (
                <div key={item.kurtaId} className="bg-beige border border-gray-300 p-4 rounded-lg shadow-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex m-4 items-center">
                      <Image
                        src={item.imageUrl}
                        alt={item.description}
                        width={100}
                        height={150}
                        className="rounded-lg"
                      />
                      <div className="ml-4">
                        <p className="text-xl font-semibold">₹{item.price}</p>
                        <p>{item.description}</p>
                        <div className="mt-2">
                          <label htmlFor={`quantity-${item.kurtaId}`} className="mr-2">
                            Qty: {item.quantity}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="w-1/3 m-10 bg-navy text-white p-4 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
              <div className="mb-4">
                <p>Subtotal: ₹{calculateTotal()}</p>
                <p>Shipping: ₹0</p>
                <p>Tax: ₹{(calculateTotal() * 0.18).toFixed(2)}</p>
              </div>
              <div className="border-t pt-4">
                <p className="text-xl font-semibold">
                  Total: ₹{(calculateTotal() * 1.18).toFixed(2)}
                </p>
              </div>
              <button className="w-full bg-white text-navy py-2 px-4 rounded-lg mt-4">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart