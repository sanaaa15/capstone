'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import NavBar from '../components/NavBar';

const Generation = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        setGeneratedImage(imageUrl);
      } else {
        const errorText = await response.text();
        console.error('Error generating image:', errorText);
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
            <p className="text-white text-center">Generating image...</p>
          ) : generatedImage ? (
            <Image src={generatedImage} alt="Generated Kurta" width={500} height={500} className="mx-auto" />
          ) : (
            <p className="text-white text-center">Generated image will appear here</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generation;