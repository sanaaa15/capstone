'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import { useSearchParams } from 'next/navigation'

const KurtaDetails = () => {
  const searchParams = useSearchParams()
  const prompt = searchParams.get('prompt')
  const imageUrl = searchParams.get('imageUrl')
  const [customPrompt, setCustomPrompt] = useState('')

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="relative w-1/2 aspect-[99/100] border-4 border-navy rounded-lg overflow-hidden">
            <Image
              src={imageUrl || '/kurta-1.png'}
              alt="Selected Design"
              layout="fill"
              objectFit="cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your prompt to modify this kurta"
            className="flex-grow py-2 px-4 rounded-lg border-2 border-navy focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-navy text-white py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors duration-300">
            Modify
          </button>
        </div>
        <div className="flex justify-center">
          <button className="bg-navy text-white py-3 px-8 rounded-lg hover:bg-blue-800 transition-colors duration-300 text-lg font-semibold">
            I want this kurta!
          </button>
        </div>
      </div>
    </div>
  )
}

export default KurtaDetails