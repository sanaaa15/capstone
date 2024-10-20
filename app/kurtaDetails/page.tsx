'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import { useSearchParams, useRouter } from 'next/navigation'

const KurtaDetails = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = searchParams.get('prompt')
  const imageUrl = searchParams.get('imageUrl')
  const seed = searchParams.get('seed')
  const [quantity, setQuantity] = useState(1)

  const handleCustomize = () => {
    router.push(`/customization?prompt=${encodeURIComponent(prompt || '')}&imageUrl=${encodeURIComponent(imageUrl || '')}&seed=${seed}`)
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
            <p className="text-sm text-gray-600 mb-4">Seed: {seed}</p>
            <div className="bg-navy text-white p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Price:</h3>
              <div className="grid grid-cols-2 gap-2">
                <p>Color:</p><p>White, Red</p>
                <p>Fabric:</p><p>Cotton</p>
                <p>Sleeves:</p><p>Full Sleeves</p>
                <p>Hemline:</p><p>Straight</p>
                <p>Print/Pattern:</p><p>Floral</p>
                <p>Length:</p><p>Calf length</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="font-semibold mb-2">Select Fabric:</p>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-navy rounded-full"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-8 bg-beige-200 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="bg-gray-200 px-3 py-1 rounded-l-lg">-</button>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-12 text-center border-t border-b border-gray-200 py-1" />
              <button onClick={() => setQuantity(quantity + 1)} className="bg-gray-200 px-3 py-1 rounded-r-lg">+</button>
              <button className="ml-4 text-navy">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KurtaDetails
