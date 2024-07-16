'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import NavBar from '../components/NavBar';
import JSZip from 'jszip';

const Generation = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      console.error('Error: No prompt provided');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generateKurta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attributes: prompt }),
      });

      if (response.ok) {
        const zipBlob = await response.blob();
        const zip = new JSZip();
        const contents = await zip.loadAsync(zipBlob);
        const imageUrls: string[] = [];

        for (const [filename, file] of Object.entries(contents.files)) {
          if (filename.endsWith('.png')) {
            const blob = await file.async('blob');
            const imageUrl = URL.createObjectURL(blob);
            imageUrls.push(imageUrl);
          }
        }

        setGeneratedImages(imageUrls);
      } else {
        const errorText = await response.text();
        console.error('Error generating images:', errorText);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="max-w-3xl mx-auto mt-[5%]">
        <div className="flex mb-8">
          <input
            type="text"
            value={prompt}
            onChange={(e) => {
              const newPrompt = e.target.value;
              setPrompt(newPrompt);
              console.log('Current prompt:', newPrompt);
            }}
            placeholder="Enter your Prompt to Generate a Kurta"
            className="flex-grow p-3 rounded-l-md border-2 border-navy"
          />
          <button
            onClick={handleGenerate}
            className="bg-navy text-white px-6 py-3 rounded-r-md"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="bg-navy p-6 rounded-md">
          {isLoading ? (
            <p className="text-white text-center">Generating images...</p>
          ) : generatedImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="aspect-[3/4] relative">
                  <Image 
                    src={imageUrl} 
                    alt={`Generated Kurta ${index + 1}`} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white text-center">Generated images will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generation;