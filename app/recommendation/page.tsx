'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import Link from 'next/link'
import JSZip from 'jszip';

const Recommendation = () => {
  const [recommendations, setRecommendations] = useState<{prompt: string, imageUrl: string}[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchRecommendations()
  }, [])

  useEffect(() => {
    if (recommendations.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % recommendations.length)
    }, 3000) // Change image every 3 seconds
    return () => clearInterval(interval)
  }, [recommendations])

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
      });

      if (response.ok) {
        const zipBlob = await response.blob();
        const [imageUrls, extractedSeeds] = await extractImagesFromZip(zipBlob);
        const newRecommendations = prompts.map((prompt, index) => ({
          prompt,
          imageUrl: imageUrls[index] || '',
        }));
        setRecommendations(newRecommendations);
        console.log('Generated images for prompts:', newRecommendations);
      } else {
        console.error('Failed to generate images for prompts');
      }
    } catch (error) {
      console.error('Error generating images:', error);
    }
  };

  const extractImagesFromZip = async (zipBlob: Blob): Promise<string[]> => {
    const zip = await JSZip.loadAsync(zipBlob);
    const imageUrls: string[] = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.endsWith('.png')) {
        const blob = await file.async('blob');
        const url = URL.createObjectURL(blob);
        imageUrls.push(url);
      }
    }

    return imageUrls;
  };

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
        {recommendations.length > 0 && (
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex *20}%)` }}
            >
              {recommendations.map(({ prompt, imageUrl }, index) => (
                <div key={index} className="w-[32%] flex-shrink-0 px-2">
                  <div className="aspect-[95/100] relative">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
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