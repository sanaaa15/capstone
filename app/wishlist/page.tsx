'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import ScrollingText from '../components/ScrollingText'

const Wishlist = () => {
    const [showModal, setShowModal] = useState(false)

    const handleAddToCart = () => {
        setShowModal(true)
        setTimeout(() => setShowModal(false), 3000) // Hide modal after 3 seconds
    }

    return (
        <div className="bg-beige min-h-screen">
            <NavBar />
            <div className="container py-4">
                <ScrollingText text="YOUR WISHLIST" className="text-4xl font-bold tracking-widest text-navy" />
                <div className="flex flex-wrap justify-between">
                    {/* Wishlist Item 1 */}
                    <div className="w-1/4 p-4">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-md">
                            <Image
                                src="/kurta-1.png"
                                alt="Kurta"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-t-lg"
                            />
                        </div>
                        <div className="flex justify-between bg-navy p-3 rounded-b-lg">
                            <button className="text-beige hover:scale-105 transition-transform">
                                <span className="material-icons">favorite</span>
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="text-beige hover:scale-105 transition-transform"
                            >
                                <span className="material-icons">shopping_cart</span>
                            </button>
                        </div>
                    </div>

                    {/* Wishlist Item 2 */}
                    <div className="w-1/4 p-4">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-md">
                            <Image
                                src="/kurta-2.png"
                                alt="Kurta"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-t-lg"
                            />
                        </div>
                        <div className="flex justify-between bg-navy p-3 rounded-b-lg">
                            <button className="text-beige hover:scale-105 transition-transform">
                                <span className="material-icons">favorite</span>
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="text-beige hover:scale-105 transition-transform"
                            >
                                <span className="material-icons">shopping_cart</span>
                            </button>
                        </div>
                    </div>

                    {/* Wishlist Item 3 */}
                    <div className="w-1/4 p-4">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 shadow-md">
                            <Image
                                src="/kurta-3.jpg"
                                alt="Kurta"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-t-lg"
                            />
                        </div>
                        <div className="flex justify-between bg-navy p-3 rounded-b-lg">
                            <button className="text-beige hover:scale-105 transition-transform">
                                <span className="material-icons">favorite</span>
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="text-beige hover:scale-105 transition-transform"
                            >
                                <span className="material-icons">shopping_cart</span>
                            </button>
                        </div>
                    </div>

                    {/* Decorative Pattern */}
                    <div className="w-1/4 p-4">
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                            <Image
                                src="/about-page-pattern.jpg"
                                alt="Decorative Pattern"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-t-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform duration-300 scale-100">
                        <div className="flex items-center mb-4">
                            <span className="material-icons text-green-500 mr-2">check_circle</span>
                            <h3 className="text-lg font-semibold">Added to cart</h3>
                        </div>
                        <Link href="/cart">
                            <button className="block bg-navy text-white py-2 px-4 rounded-lg text-center hover:bg-blue-800 transition-colors duration-300">
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
