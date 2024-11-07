'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import NavBar from '../components/NavBar';
import JSZip from 'jszip';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Generation = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [seeds, setSeeds] = useState<number[]>([]);
  const router = useRouter();

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
        body: JSON.stringify({ 
          prompts: [prompt],
          is_customization: false
        }),
      });

      if (response.ok) {
        const zipBlob = await response.blob();
        const [imageUrls, extractedSeeds] = await extractImagesFromZip(zipBlob);
        setGeneratedImages(imageUrls);
        setSeeds(extractedSeeds);
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

  const extractImagesFromZip = async (zipBlob: Blob): Promise<[string[], number[]]> => {
    const zip = await JSZip.loadAsync(zipBlob);
    const imageUrls: string[] = [];
    let seeds: number[] = [];

    for (const [filename, file] of Object.entries(zip.files)) {
      if (filename.endsWith('.png')) {
        const blob = await file.async('blob');
        const url = URL.createObjectURL(blob);
        imageUrls.push(url);
      } else if (filename === 'seeds.json') {
        const content = await file.async('text');
        seeds = JSON.parse(content);
      }
    }

    return [imageUrls, seeds];
  };

  const handleImageClick = (imageUrl: string, index: number) => {
    router.push(`/customization?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}&seed=${seeds[index]}`);
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
            className="bg-navy text-white px-6 py-3 rounded-r-md shadow-[0_4px_10px_rgba(0,0,0,0.2)]"
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="bg-navy p-6 rounded-md">
          {isLoading ? (
            <p className="text-white text-center">Generating images...</p>
          ) : generatedImages.length > 0 ? (
            <div className="grid grid-cols-3 gap-8">
              {generatedImages.map((imageUrl, index) => (
                <Link 
                  key={index}
                  href={`/kurtaDetails?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(imageUrl)}&seed=${seeds[index]}`}
                >
                  <div 
                    className="aspect-[3/4] relative cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_15px_rgba(0,0,0,0.3)]"
                  >
                    <Image 
                      src={imageUrl} 
                      alt={`Generated Kurta ${index + 1}`} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover rounded-md"
                    />
                  </div>
                </Link>
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