'use client'

import React from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

const KurtaDetails = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = searchParams.get('prompt')
  const imageUrl = searchParams.get('imageUrl')

  const handleCustomize = () => {
    router.push(`/customization?prompt=${encodeURIComponent(prompt || '')}&imageUrl=${encodeURIComponent(imageUrl || '/kurta-1.png')}`)
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default KurtaDetails