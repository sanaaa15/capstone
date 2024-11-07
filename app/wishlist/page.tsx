'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import ScrollingText from '../components/ScrollingText'

interface WishlistItem {
  id: string
  prompt: string
  imageUrl: string
  seed: string
}

const Wishlist = () => {
    const [showModal, setShowModal] = useState(false)
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch('/api/getWishlist')
                if (response.ok) {
                    const data = await response.json()
                    setWishlistItems(data.items)
                }
            } catch (error) {
                console.error('Error fetching wishlist:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchWishlist()
    }, [])

    const handleAddToCart = () => {
        setShowModal(true)
        setTimeout(() => setShowModal(false), 3000)
    }

    const handleRemoveFromWishlist = async (itemId: string) => {
        try {
            const response = await fetch('/api/removeFromWishlist', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId }),
            })

            if (response.ok) {
                setWishlistItems(items => items.filter(item => item.id !== itemId))
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error)
        }
    }

    if (loading) {
        return (
            <div className="bg-beige min-h-screen">
                <NavBar />
                <div className="container py-4 flex justify-center items-center">
                    <p>Loading wishlist...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-beige min-h-screen">
            <NavBar />
            <ScrollingText text="YOUR WISHLIST" />
            <div className="container py-4">
                
                {wishlistItems.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-lg text-gray-600">Your wishlist is empty</p>
                        <Link href="/generation">
                            <button className="mt-4 bg-navy text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors">
                                Generate Some Kurtas
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="relative">
                                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-md">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.prompt}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-t-lg"
                                    />
                                </div>
                                <div className="flex justify-between bg-navy p-3 rounded-b-lg">
                                    <button 
                                        onClick={() => handleRemoveFromWishlist(item.id)}
                                        className="text-beige hover:scale-105 transition-transform"
                                    >
                                        <span className="material-icons">delete</span>
                                    </button>
                                    <button
                                        onClick={handleAddToCart}
                                        className="text-beige hover:scale-105 transition-transform"
                                    >
                                        <span className="material-icons">shopping_cart</span>
                                    </button>
                                </div>
                                <div className="mt-2 px-2">
                                    <p className="text-sm text-gray-600 truncate">{item.prompt}</p>
                                </div>
                            </div>
                        ))}
                        
                        {/* Decorative Pattern */}
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                            <Image
                                src="/about-page-pattern.jpg"
                                alt="Decorative Pattern"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center mb-4">
                            <span className="material-icons text-green-500 mr-2">check_circle</span>
                            <h3 className="text-lg font-semibold">Added to cart</h3>
                        </div>
                        <Link href="/cart">
                            <button className="block w-full bg-navy text-white py-2 px-4 rounded-lg text-center hover:bg-blue-800 transition-colors">
                                Go to Cart
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Wishlist