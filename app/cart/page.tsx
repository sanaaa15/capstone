'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import ScrollingText from '../components/ScrollingText'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface CartItem {
  kurtaId: string
  description: string
  imageUrl: string
  quantity: number
  price: number
  comment: string
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchCartItems()
  }, [])

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/getCart')
      if (!response.ok) throw new Error('Failed to fetch cart items')
      const data = await response.json()
      setCartItems(data.cartItems)
    } catch (error) {
      setError('Failed to load cart items')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteCartItem = async (kurtaId: string) => {
    try {
      const response = await fetch(`/api/deleteCartItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kurtaId }),
      })
      if (!response.ok) throw new Error('Failed to delete item')
      setCartItems((prevItems) => prevItems.filter((item) => item.kurtaId !== kurtaId))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const updateComment = async (kurtaId: string, comment: string) => {
    try {
      const response = await fetch(`/api/updateComment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kurtaId, comment }),
      })
      if (!response.ok) throw new Error('Failed to update comment')
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.kurtaId === kurtaId ? { ...item, comment } : item
        )
      )
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    const orderDetails = cartItems.map(item => ({
      ...item,
      comment: item.comment || '',
      total: (item.price * item.quantity)
    }))
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails))
    router.push('/checkout')
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-beige">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-beige text-red-500">{error}</div>
  }

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="w-screen overflow-hidden">
        <div className="relative w-full py-6">
          <div className="animate-scroll whitespace-nowrap">
          <ScrollingText text="YOUR CART" />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-navy mb-6">Your cart is empty</p>
            <Link href="/generation">
              <button className="bg-navy text-white py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-6">
              {cartItems.map((item) => (
                <div 
                  key={item.kurtaId} 
                  className="bg-beige border border-gray-300 rounded-xl shadow-md p-6"
                  style={{
                    boxShadow: '2px 2px 10px rgba(0,0,0,0.1)',
                    transform: 'translateZ(0)'
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-6">
                      <div className="relative w-32 h-48">
                        <Image
                          src={item.imageUrl}
                          alt={item.description}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="space-y-3">
                        <p className="text-2xl font-semibold text-navy">₹{item.price}</p>
                        <p className="text-gray-600">{item.description}</p>
                        <div>
                          <label className="text-navy font-medium">
                            Qty: {item.quantity}
                          </label>
                        </div>
                        <div>
                          <label className="block text-navy font-medium mb-1">
                            Comment:
                          </label>
                          <input
                            type="text"
                            value={item.comment || ''}
                            onChange={(e) => updateComment(item.kurtaId, e.target.value)}
                            placeholder="Add a comment"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-navy bg-white"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCartItem(item.kurtaId)}
                      className="text-gray-400 hover:text-navy transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-navy text-white rounded-xl shadow-md p-6 sticky top-4">
                <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{(calculateTotal() * 0.18).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between text-xl font-semibold">
                      <span>Total</span>
                      <span>₹{(calculateTotal() * 1.18).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-white text-navy font-semibold py-3 px-4 rounded-lg mt-6 hover:bg-gray-50 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart