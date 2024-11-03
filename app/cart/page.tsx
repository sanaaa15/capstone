'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import ScrollingText from '../components/ScrollingText'
import { useRouter } from 'next/navigation';

interface CartItem {
  kurtaId: string;
  description: string;
  imageUrl: string;
  quantity: number;
  price: number;
  comment: string; // New property for comments
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter();

  useEffect(() => {
    fetchCartItems()
  }, [])

  // Fetch cart items from the backend
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

  // Delete a cart item
  const deleteCartItem = async (kurtaId: string) => {
    try {
      const response = await fetch(`/api/deleteCartItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kurtaId }),
      })
      if (!response.ok) {
        throw new Error('Failed to delete item')
      }
      setCartItems((prevItems) => prevItems.filter((item) => item.kurtaId !== kurtaId))
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  // Update the comment for a cart item
  const updateComment = async (kurtaId: string, comment: string) => {
    try {
      const response = await fetch(`/api/updateComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kurtaId, comment }),
      })
      if (!response.ok) {
        throw new Error('Failed to update comment')
      }
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.kurtaId === kurtaId ? { ...item, comment } : item
        )
      )
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  // Calculate total price
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    // Save cart items with comments to localStorage for the confirmation page
    const orderDetails = cartItems.map(item => ({
      ...item,
      comment: item.comment || '',
      total: (item.price * item.quantity)
    }));
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
    router.push('/checkout');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>
  }

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container py-6">
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
                        {/* Comment input */}
                        <div className="mt-2">
                          <label htmlFor={`comment-${item.kurtaId}`} className="block">Comment:</label>
                          <input
                            type="text"
                            id={`comment-${item.kurtaId}`}
                            value={item.comment || ''}
                            onChange={(e) => updateComment(item.kurtaId, e.target.value)}
                            placeholder="Add a comment"
                            className="border border-gray-300 rounded-lg p-2 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={() => deleteCartItem(item.kurtaId)}
                      className="bg-red-500 text-white py-1 px-2 rounded-lg"
                    >
                      Delete
                    </button>
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
              <button 
                onClick={handleCheckout}
                className="w-full bg-white text-navy py-2 px-4 rounded-lg mt-4 hover:bg-gray-100 transition-colors duration-300"
              >
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