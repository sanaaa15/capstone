'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import { useSearchParams, useRouter } from 'next/navigation'
import JSZip from 'jszip'

const KurtaDetails = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = searchParams.get('prompt')
  const imageUrl = searchParams.get('imageUrl')
  const seed = searchParams.get('seed')
  const [customPrompt, setCustomPrompt] = useState('')
  const [modifiedImageUrl, setModifiedImageUrl] = useState(imageUrl)

  const handleModify = async () => {
    try {
      const response = await fetch('/api/generateKurta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attributes: customPrompt, seed: parseInt(seed || '0', 10) }),
      });

      if (response.ok) {
        const zipBlob = await response.blob();
        const zip = new JSZip();
        const contents = await zip.loadAsync(zipBlob);
        
        for (const [filename, file] of Object.entries(contents.files)) {
          if (filename.endsWith('.png')) {
            const blob = await (file as JSZip.JSZipObject).async('blob');
            const newImageUrl = URL.createObjectURL(blob);
            setModifiedImageUrl(newImageUrl);
            break;
          }
        }
      } else {
        console.error('Failed to modify image');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="relative w-1/2 aspect-[99/100] border-4 border-navy rounded-lg overflow-hidden">
            <Image
              src={modifiedImageUrl || '/kurta-1.png'}
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
          <button 
            onClick={handleModify}
            className="bg-navy text-white py-2 px-6 rounded-lg hover:bg-blue-800 transition-colors duration-300"
          >
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