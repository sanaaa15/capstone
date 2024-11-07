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
  fabric: string;
  price: number;
}

const capitalizeFirstLetter = (string: string) => {
  if (!string) return '';
  return string.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

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
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [kurtaPrice, setKurtaPrice] = useState<string | null>(null);

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
      const attributesWithPrice: KurtaAttributes = {
        ...data.attributes,
        price: parseFloat(data.attributes.price) || Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000
      };
      setKurtaAttributes(attributesWithPrice);
      console.log('Kurta attributes:', attributesWithPrice);

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
    setIsLoading(true);
    try {
      if (!selectedFabric) {
        setNotification({
          show: true,
          message: 'Please select a fabric before adding to cart',
          type: 'error'
        });
        return;
      }

      if (!kurtaAttributes?.price) {
        setNotification({
          show: true,
          message: 'Price information is missing',
          type: 'error'
        });
        return;
      }

      // Update kurtaAttributes with selected fabric
      const updatedAttributes = {
        ...kurtaAttributes,
        fabric: selectedFabric,
        price: kurtaAttributes.price
      };

      console.log('Sending to addKurtaDetails:', updatedAttributes); // Debug log

      // First add kurta details with fabric and price
      const kurtaDetailsResponse = await fetch('/api/addKurtaDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: prompt,
          quantity: quantity,
          attributes: updatedAttributes,
          fabric: selectedFabric,
          price: kurtaAttributes.price
        }),
      });

      if (!kurtaDetailsResponse.ok) {
        throw new Error('Failed to add kurta details');
      }

      // Then add to cart with all necessary details
      const cartResponse = await fetch('/api/addToCart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: prompt,
          imageUrl: imageUrl,
          quantity: quantity,
          price: kurtaAttributes.price,
          fabric: selectedFabric,
        }),
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to add to cart');
      }

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/cart');
      }, 1500);
    } catch (error) {
      console.error('Error in handleAddToCart:', error); // Debug log
      setNotification({
        show: true,
        message: 'Failed to add to cart. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

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
        <div className="w-[75%] flex pl-12">
          <div className="w-[70%] pr-10">
            <div className="relative aspect-[2/3] mb-4">
              <Image
                src={imageUrl || '/kurta-1.png'}
                alt="Selected Design"
                layout="fill"
                objectFit="cover"
                className="rounded-lg transition-transform duration-500 transform hover:scale-105"
              />
            </div>
            <button 
              onClick={handleCustomize}
              className="w-full bg-navy text-white mt-4 py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
            >
              Customize
            </button>
          </div>
          <div className="w-[80%]">
            <h2 className="text-2xl font-semibold mb-2 text-navy">Prompt: "{prompt}"</h2>
            <p className="text-sm text-gray-600 mb-2">Seed: {seed}</p>
            <div className="bg-navy text-white p-4 rounded-2xl mb-4">
              {/* Price Display */}
              <div className="mb-4 border-b border-gray-600 pb-4">
                <p className="text-2xl font-bold text-white text-center">
                  Price: ₹{kurtaAttributes?.price ? kurtaAttributes.price.toFixed(2) : 'N/A'}
                </p>
              </div>

              {/* Attributes List */}
              {isAnalyzing ? (
                <p>Analyzing kurta details...</p>
              ) : kurtaAttributes ? (
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {/* Left Column */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-300 text-md">Color:</p>
                      <p className="font-semibold text-md text-white">{capitalizeFirstLetter(kurtaAttributes.color)}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-md">Fabric:</p>
                      <p className="font-semibold text-md text-white">{capitalizeFirstLetter(selectedFabric || 'Not selected')}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-md">Sleeves:</p>
                      <p className="font-semibold text-md text-white">{capitalizeFirstLetter(kurtaAttributes.sleeveLength)}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-md">Sleeve Style:</p>
                      <p className="font-semibold text-md text-white">{capitalizeFirstLetter(kurtaAttributes.sleeveStyle)}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-300 text-md">Hemline:</p>
                      <p className="font-semibold text-md text-white">{capitalizeFirstLetter(kurtaAttributes.hemline)}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-md">Print/Pattern:</p>
                      <p className="font-semibold text-md text-white">{capitalizeFirstLetter(kurtaAttributes.print)}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-md">Neckline:</p>
                      <p className="font-semibold text-md text-white">{capitalizeFirstLetter(kurtaAttributes.neckline)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Could not analyze kurta details</p>
              )}
            </div>
            <div className="mb-4">
              <p className="font-semibold mb-2">Select Fabric:</p>
              <div className="flex space-x-4">
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer transform transition-transform hover:scale-105 border-1 border-black shadow-lg" 
                  onClick={() => setSelectedFabric('Linen')}
                  title="Linen"
                >
                  <Image src="/linen.png" alt="Linen" width={48} height={48} className={`rounded-full ${selectedFabric === 'Linen' ? 'border-2 border-navy' : ''}`} />
                </div>
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer transform transition-transform hover:scale-105 border-1 border-black shadow-lg" 
                  onClick={() => setSelectedFabric('Silk')}
                  title="Silk"
                >
                  <Image src="/silk.png" alt="Silk" width={48} height={48} className={`rounded-full ${selectedFabric === 'Silk' ? 'border-2 border-navy' : ''}`} />
                </div>
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer transform transition-transform hover:scale-105 border-1 border-black shadow-lg" 
                  onClick={() => setSelectedFabric('Cotton')}
                  title="Cotton"
                >
                  <Image src="/cotton.png" alt="Cotton" width={48} height={48} className={`rounded-full ${selectedFabric === 'Cotton' ? 'border-2 border-navy' : ''}`} />
                </div>
              </div>
            </div>
            <div className="flex items-center mb-3">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                className="bg-white px-4 py-2 rounded-l-lg hover:bg-gray-300 transition-colors"
              >
                -
              </button>
              <div className="w-12 text-center border-t border-b border-gray-200 py-2">
                {quantity}
              </div>
              <button 
                onClick={() => setQuantity(quantity + 1)} 
                className="bg-white px-4 py-2 rounded-r-lg hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 bg-navy text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
              >
                {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
              <button 
                onClick={handleAddToWishlist}
                disabled={isWishlistLoading}
                className="flex-shrink-0 ml-4 text-navy hover:scale-110 transition-transform"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-8 w-8 ${isWishlistLoading ? 'animate-pulse' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
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
