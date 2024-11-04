'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import NavBar from '../components/NavBar'

interface KurtaAttributes {
  sleeveLength: string;
  color: string;
  hemline: string;
  neckline: string;
  print: string;
  sleeveStyle: string;
}

const KurtaDetails = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = searchParams.get('prompt')
  const imageUrl = searchParams.get('imageUrl')
  const seed = searchParams.get('seed')
  const [quantity, setQuantity] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState({ show: false, message: '', type: '' })
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)
  const [kurtaAttributes, setKurtaAttributes] = useState<KurtaAttributes | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    analyzeKurta();
  }, [prompt, imageUrl]);

  const blobToBase64 = async (blobUrl: string) => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to base64:', error);
      throw error;
    }
  };

  const analyzeKurta = async () => {
    if (!prompt || !imageUrl) return;

    try {
      const base64Image = await blobToBase64(imageUrl);

      const response = await fetch('/api/analyzeKurta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageData: base64Image
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze kurta');
      }

      const data = await response.json();
      setKurtaAttributes(data.attributes);
    } catch (error) {
      console.error('Error analyzing kurta:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomize = () => {
    router.push(`/customization?prompt=${encodeURIComponent(prompt || '')}&imageUrl=${encodeURIComponent(imageUrl || '')}&seed=${seed}`)
  }

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      if (!kurtaAttributes) {
        await analyzeKurta();
      }

      const response = await fetch('/api/addToCart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: prompt,
          imageUrl: imageUrl,
          quantity: quantity,
          attributes: kurtaAttributes,
          seed: seed
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      setShowModal(true)
      setTimeout(() => {
        setShowModal(false)
        router.push('/cart')
      }, 1500)
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to add to cart. Please try again.',
        type: 'error'
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' })
      }, 3000)
    }
  }

  const handleAddToWishlist = async () => {
    setIsWishlistLoading(true)
    
    try {
      const response = await fetch('/api/addToWishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: prompt,
          imageUrl: imageUrl
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to wishlist')
      }

      setNotification({
        show: true,
        message: 'Added to wishlist successfully! Redirecting...',
        type: 'success'
      })
      
      setTimeout(() => {
        router.push('/wishlist')
      }, 1500)
    } catch (error) {
      setNotification({
        show: true,
        message: 'Failed to add to wishlist. Please try again.',
        type: 'error'
      })
    } finally {
      setIsWishlistLoading(false)
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' })
      }, 3000)
    }
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
              <h3 className="font-semibold mb-2">Kurta Details:</h3>
              {isAnalyzing ? (
                <p>Analyzing kurta details...</p>
              ) : kurtaAttributes ? (
                <div className="grid grid-cols-2 gap-2">
                  <p>Sleeve Length:</p><p>{kurtaAttributes.sleeveLength}</p>
                  <p>Color:</p><p>{kurtaAttributes.color}</p>
                  <p>Hemline:</p><p>{kurtaAttributes.hemline}</p>
                  <p>Neckline:</p><p>{kurtaAttributes.neckline}</p>
                  <p>Print/Pattern:</p><p>{kurtaAttributes.print}</p>
                  <p>Sleeve Style:</p><p>{kurtaAttributes.sleeveStyle}</p>
                </div>
              ) : (
                <p>Could not analyze kurta details</p>
              )}
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
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="bg-gray-200 px-3 py-1 rounded-l-lg"
              >
                -
              </button>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                className="w-12 text-center border-t border-b border-gray-200 py-1" 
              />
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="bg-gray-200 px-3 py-1 rounded-r-lg"
              >
                +
              </button>
              <button 
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full bg-navy text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
            >
              {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
              <button 
                onClick={handleAddToWishlist}
                disabled={isWishlistLoading}
                className="ml-4 text-navy hover:scale-110 transition-transform"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-6 w-6 ${isWishlistLoading ? 'animate-pulse' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
{/* Success Modal */}
{showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <span className="material-icons text-green-500 mr-2">check_circle</span>
              <h3 className="text-lg font-semibold">Added to cart</h3>
            </div>
            <p>Redirecting to cart...</p>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div 
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  )
}

export default KurtaDetails
