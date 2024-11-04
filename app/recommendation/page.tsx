'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import Link from 'next/link'
import JSZip from 'jszip'

const CACHE_KEY = 'recommendations_cache'
const CACHE_EXPIRY_DAYS = 7

interface CachedRecommendations {
  data: {
    prompt: string
    imageUrl: string
    seed: number
    imageData?: string  // base64 string
  }[]
  timestamp: number
}

const Recommendation = () => {
  const [recommendations, setRecommendations] = useState<{prompt: string, imageUrl: string, seed: number, imageData?: string}[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    loadRecommendations()
  }, [])

  useEffect(() => {
    if (recommendations.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % recommendations.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [recommendations])

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const loadRecommendations = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY)
    
    if (cachedData) {
      const parsed: CachedRecommendations = JSON.parse(cachedData)
      const now = Date.now()
      const daysSinceCache = (now - parsed.timestamp) / (1000 * 60 * 60 * 24)

      if (daysSinceCache < CACHE_EXPIRY_DAYS) {
        console.log('Loading recommendations from cache')
        setRecommendations(parsed.data)
        return
      }
    }

    // If no cache or cache expired, fetch new recommendations
    await fetchRecommendations()
  }

  const saveToCache = async (recommendations: {prompt: string, imageUrl: string, seed: number, imageData?: string}[]) => {
    const cacheData: CachedRecommendations = {
      data: recommendations,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        const formattedPrompts = formatPrompts(data.prompts)
        console.log('Formatted prompts:', formattedPrompts)
        await generateImages(formattedPrompts)
      } else {
        console.error('Error fetching recommendations:', response.statusText)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const generateImages = async (prompts: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generateKurta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompts: prompts,
          is_customization: false
        }),
      })
  
      if (response.ok) {
        const zipBlob = await response.blob()
        const [imageUrls, extractedSeeds, imageDataArray] = await extractImagesFromZip(zipBlob)
        const newRecommendations = prompts.map((prompt, index) => ({
          prompt,
          imageUrl: imageUrls[index] || '',
          seed: extractedSeeds[index],
          imageData: imageDataArray[index]
        }))
        setRecommendations(newRecommendations)
        // Save the new recommendations to cache
        await saveToCache(newRecommendations)
        console.log('Generated images for prompts:', newRecommendations)
      } else {
        console.error('Failed to generate images for prompts')
      }
    } catch (error) {
      console.error('Error generating images:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const extractImagesFromZip = async (zipBlob: Blob): Promise<[string[], number[], string[]]> => {
    const zip = await JSZip.loadAsync(zipBlob)
    const imageUrls: string[] = []
    const imageDataArray: string[] = []
    const seeds: number[] = []

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.endsWith('.png')) {
        const blob = await file.async('blob')
        const url = URL.createObjectURL(blob)
        const base64Data = await blobToBase64(blob)
        imageUrls.push(url)
        imageDataArray.push(base64Data)
      } else if (filename === 'seeds.json') {
        const content = await file.async('text')
        seeds.push(...JSON.parse(content))
      }
    }

    return [imageUrls, seeds, imageDataArray]
  }

  const formatPrompts = (prompts: any[]): string[] => {
    const shuffled = [...prompts].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 5)

    return selected.map(prompt => {
      const attributes = []
      if (prompt.color) attributes.push(`${prompt.color} color`)
      if (prompt.fabric) attributes.push(`${prompt.fabric} fabric`)
      if (prompt.designStyle) attributes.push(`${prompt.designStyle} design`)
      if (prompt.sleeveStyle) attributes.push(`${prompt.sleeveStyle} sleeves`)
      if (prompt.hemlineStyle) attributes.push(`${prompt.hemlineStyle} hemline`)
      
      return attributes.join(', ')
    }).filter(prompt => prompt !== '')
  }

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 ml-[14%] mt-[2%] font-custom-2">
          <span className="text-blue">CURATED</span>{' '}
          <span className="text-white">DESIGNS FOR YOU!</span>
        </h1>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-navy"></div>
          </div>
        ) : recommendations.length > 0 && (
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 20}%)` }}
            >
              {recommendations.map(({ prompt, imageData, imageUrl, seed }, index) => (
                <div key={index} className="w-[32%] flex-shrink-0 px-2">
                  <Link href={`/kurtaDetails?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageData || imageUrl)}&seed=${seed}`}>
                    <div className="aspect-[95/100] relative cursor-pointer">
                      {(imageData || imageUrl) && imageUrl !== 'b' ? (
                        <Image
                          src={imageData || imageUrl}
                          alt={`Generated Design ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-lg border-2 border-navy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-lg border-2 border-navy flex items-center justify-center">
                          <p className="text-gray-500">Image not available</p>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
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