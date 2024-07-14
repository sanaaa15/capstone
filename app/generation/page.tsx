'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import NavBar from '../components/NavBar';

const Generation = () => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    // Handle generation logic here
    console.log('Generating with prompt:', prompt);
  };

  return (
    <div className="bg-beige min-h-screen">
     <NavBar />
      <div className="max-w-3xl mx-auto mt-[5%]">
        <div className="flex mb-8">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your Prompt to Generate a Kurta"
            className="flex-grow p-3 rounded-l-md border-2 border-navy"
          />
          <button
            onClick={handleGenerate}
            className="bg-navy text-white px-6 py-3 rounded-r-md"
          >
            Generate
          </button>
        </div>

        <div className="bg-navy p-6 rounded-md">
        </div>
      </div>
    </div>
  );
};

export default Generation;
