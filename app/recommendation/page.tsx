// /recommendation/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import Link from 'next/link'
import JSZip from 'jszip';

const Recommendation = () => {
  const [recommendations, setRecommendations] = useState<{prompt: string, imageUrl: string, seed: number}[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
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
    }, 3000)
    return () => clearInterval(interval)
  }, [recommendations])

  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.prompts[0]?.imageUrl) {
          // If we received recommendations with images, use them directly
          setRecommendations(data.prompts)
        } else {
          // Otherwise, generate new images
          const formattedPrompts = formatPrompts(data.prompts)
          console.log('Formatted prompts:', formattedPrompts)
          await generateImages(formattedPrompts)
        }
      } else {
        console.error('Error fetching recommendations:', response.statusText)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const generateImages = async (prompts: string[]) => {
    setIsLoading(true);
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
          seed: extractedSeeds[index]
        }));
        
        // Save the recommendations to MySQL
        await saveRecommendations(newRecommendations);
        
        setRecommendations(newRecommendations);
        console.log('Generated images for prompts:', newRecommendations);
      } else {
        console.error('Failed to generate images for prompts');
      }
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecommendations = async (recommendations: {prompt: string, imageUrl: string, seed: number}[]) => {
    try {
      const response = await fetch('/api/saveRecommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recommendations }),
      });

      if (!response.ok) {
        throw new Error('Failed to save recommendations');
      }
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  };

  const extractImagesFromZip = async (zipBlob: Blob): Promise<[string[], number[]]> => {
    const zip = await JSZip.loadAsync(zipBlob);
    const imageUrls: string[] = [];
    const seeds: number[] = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.endsWith('.png')) {
        const blob = await file.async('blob');
        const url = URL.createObjectURL(blob);
        imageUrls.push(url);
      } else if (filename === 'seeds.json') {
        const content = await file.async('text');
        seeds.push(...JSON.parse(content));
      }
    }

    return [imageUrls, seeds];
  };

  const formatPrompts = (prompts: any[]): string[] => {
    const shuffled = [...prompts].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 5)

    return selected.map(prompt => {
      const allAttributes = [
        { value: prompt.color, type: 'color' },
        { value: prompt.sleeveStyle, type: 'sleeves' },
        { value: prompt.hemlineStyle, type: 'hemline' },
        { value: prompt.necklineStyle, type: 'neckline' }
      ].filter(attr => attr.value);

      const colorAttribute = allAttributes.find(attr => attr.type === 'color');
      const otherAttributes = allAttributes.filter(attr => attr.type !== 'color');
      const numAdditionalAttrs = Math.floor(Math.random() * 3);
      const selectedOtherAttrs = otherAttributes
        .sort(() => 0.5 - Math.random())
        .slice(0, numAdditionalAttrs);

      const selectedAttributes = [colorAttribute, ...selectedOtherAttrs].filter((attr): attr is { value: string, type: string } => attr !== undefined);

      return selectedAttributes
        .map(attr => {
          switch (attr.type) {
            case 'color': return `${attr.value} color`;
            case 'sleeves': return `${attr.value}`;
            case 'hemline': return `${attr.value} hemline`;
            case 'neckline': return `${attr.value}`;
            default: return attr.value;
          }
        })
        .join(', ');
    }).filter(prompt => prompt !== '');
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
              {recommendations.map(({ prompt, imageUrl, seed }, index) => (
                <div key={index} className="w-[32%] flex-shrink-0 px-2">
                  <Link href={`/kurtaDetails?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}&seed=${seed}`}>
                    <div className="aspect-[95/100] relative cursor-pointer">
                      {imageUrl && imageUrl !== 'b' ? (
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