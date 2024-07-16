'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import Link from 'next/link'

const images = [
  '/kurta-3.jpg',
  '/kurta-3.jpg',
  '/kurta-3.jpg',
  '/kurta-3.jpg',
  '/kurta-3.jpg'
]

const Recommendation = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 ml-[14%] mt-[2%] font-custom-2">
          <span className="text-blue">CURATED</span>{' '}
          <span className="text-white">DESIGNS FOR YOU!</span>
        </h1>
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 20}%)` }}
          >
            {images.map((src, index) => (
              <div key={index} className="w-[32%] flex-shrink-0 px-2">
                <div className="aspect-[95/100] relative">
                  <Image
                    src={src}
                    alt={`Design ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg border-2 border-navy"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-center mt-8">
          <Link href="/generation">
            <button className="bg-beige text-navy border-2 border-navy py-2 px-4 rounded-lg hover:bg-navy hover:text-white transition-colors duration-300">
              Generate Your Own Design
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Recommendation