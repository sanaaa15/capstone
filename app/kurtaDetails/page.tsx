'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

const KurtaDetails = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = searchParams.get('prompt')
  const imageUrl = searchParams.get('imageUrl')
  const [showModal, setShowModal] = useState(false)

  const handleCustomize = () => {
    router.push(`/customization?prompt=${encodeURIComponent(prompt || '')}&imageUrl=${encodeURIComponent(imageUrl || '/kurta-1.png')}`)
  }

  const handleAddToCart = () => {
    setShowModal(true)
    setTimeout(() => setShowModal(false), 3000) // Hide modal after 3 seconds
  }

  const handleAddToWishlist = () => {
    console.log('Added to wishlist')
  }

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container py-8 flex">
        <div className="w-1/3 aspect-[3/4]">
          <div className="relative h-full">
            <Image
              src="/home-page-pattern.jpg"
              alt="Decorative Pattern"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
        <div className="w-3/4 flex px-8">
          <div className="w-1/2 pr-8">
            <div className="relative aspect-[3/4] mb-4">
              <Image
                src={imageUrl || '/kurta-1.png'}
                alt="Selected Design"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <button 
              onClick={handleCustomize}
              className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
            >
              Customize
            </button>
          </div>
          <div className="w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-navy">Prompt: "{prompt}"</h2>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Price:</h3>
              <p>Color: White, Red</p>
              <p>Fabric: Cotton</p>
              <p>Sleeves: Full Sleeves</p>
              <p>Hemline: Straight</p>
              <p>Print/Pattern: Floral</p>
              <p>Length: Calf length</p>
            </div>
            <div className="flex items-center mb-4">
              <button 
                onClick={handleAddToCart}
                className="bg-navy text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300 mr-4"
              >
                <span className="material-icons">shopping_cart</span>
              </button>
              <button 
                onClick={handleAddToWishlist}
                className="bg-navy text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
              >
                <span className="material-icons">favorite</span>
              </button>
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

export default KurtaDetails