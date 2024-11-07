'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import NavBar from '../components/NavBar'
import { useSearchParams, useRouter } from 'next/navigation'
import JSZip from 'jszip'
import { GoogleGenerativeAI } from "@google/generative-ai"
import ScrollingText from '../components/ScrollingText'
import { motion } from 'framer-motion'

export default function CustomizationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const prompt = searchParams.get('prompt')
  const imageUrl = searchParams.get('imageUrl')
  const seed = searchParams.get('seed')
  const [customPrompt, setCustomPrompt] = useState('')
  const [modifiedImageUrl, setModifiedImageUrl] = useState(imageUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [modifiedPrompt, setModifiedPrompt] = useState(prompt)

  const analyzePromptWithGemini = async (prompt: string) => {
    const genAI = new GoogleGenerativeAI("AIzaSyCCemIFkG96pJ1wqKVScS0ygADpngsrBJc")
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const result = await model.generateContent(`I will provide you with two sentences. The first sentence is the original description of an item with various attributes. The second sentence is a change request specifying a modification to one of the attributes in the original description.

    Your task is to update the original description based on the change request. Ensure that only the attribute specified in the change request is modified, while all other attributes remain unchanged.
    
    Provide the updated description in the same format as the original description.
    
    ### Example Scenarios:
    
    1. *Original Description:* "blue color, full sleeves, yellow polka dots"
       *Change Request:* "change the color to red"
       *Updated Description:* "red color, full sleeves, yellow polka dots"
    
    2. *Original Description:* "blue color, full sleeves, yellow polka dots"
       *Change Request:* "make it sleeveless"
       *Updated Description:* "blue color, sleeveless, yellow polka dots"
    
    3. *Original Description:* "green color, short sleeves, striped pattern"
       *Change Request:* "change the pattern to checkered"
       *Updated Description:* "green color, short sleeves, checkered pattern"
    
    Please update the following description based on the change request:
    
    "${prompt}"`)
    const response = await result.response
    const text = response.text()
    return text
  }

  const handleModify = async () => {
    if (!customPrompt.trim()) return
    setIsLoading(true)
    
    try {
      const originalDescription = prompt || ''
      const changeRequest = customPrompt
      const geminiPrompt = `Original Description: "${originalDescription}"
Change Request: "${changeRequest}"
Updated Description:`

      const geminiAnalysis = await analyzePromptWithGemini(geminiPrompt)
      console.log("Gemini analysis:", geminiAnalysis)
      
      const cleanedPrompt = geminiAnalysis
        .replace('Updated Description:', '')
        .replace(/"/g, '')
        .trim()
      setModifiedPrompt(cleanedPrompt)

      const seedValue = seed ? parseInt(seed, 10) : 0; // Fallback to 0 if seed is null

      const response = await fetch('/api/generateKurta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompts: [cleanedPrompt],
          seed: seedValue,
          is_customization: true
        }),
      })

      if (response.ok) {
        const zipBlob = await response.blob()
        const zip = new JSZip()
        const contents = await zip.loadAsync(zipBlob)
        
        for (const [filename, file] of Object.entries(contents.files)) {
          if (filename.endsWith('.png')) {
            const blob = await (file as JSZip.JSZipObject).async('blob')
            const newImageUrl = URL.createObjectURL(blob)
            setModifiedImageUrl(newImageUrl)
            break
          }
        }
      } else {
        console.error('Failed to modify image')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = async () => {
    try {
      const finalPrompt = modifiedPrompt || prompt
      console.log('Using prompt for kurta details:', finalPrompt)

      router.push(`/kurtaDetails?prompt=${encodeURIComponent(finalPrompt)}&imageUrl=${encodeURIComponent(modifiedImageUrl || imageUrl)}&seed=${seed}`)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="bg-beige min-h-screen relative overflow-hidden">
      {/* Left Pattern */}
      <div className="absolute left-0 top-[30%] bottom-[15%] w-[30%] rounded-xl overflow-hidden">
        <Image
          src="/pattern-cus.jpg"
          alt="Left Pattern"
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Right Pattern */}
      <div className="absolute right-0 top-[30%] bottom-[15%] w-[30%] rounded-xl overflow-hidden">
        <Image
          src="/pattern-cus.jpg"
          alt="Right Pattern"
          layout="fill"
          objectFit="cover"
        />
      </div>

      <NavBar />
      <div className="h-4"></div>
      <ScrollingText text="CUSTOMIZE KURTA" />
      
      <div className="container mx-auto py-4 px-4 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          {isLoading ? (
            <div className="relative aspect-[3/4] max-w-[35%] mx-auto flex justify-center items-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-navy"></div>
            </div>
          ) : (
            <div className="relative aspect-[3/4] max-w-[35%] mx-auto rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <Image
                src={modifiedImageUrl || '/kurta-1.png'}
                alt="Kurta Design"
                layout="fill"
                objectFit="cover"
                className="rounded-2xl transform transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
        </motion.div>

        <div className="flex items-center justify-center space-x-4 max-w-4xl mx-auto">
          <motion.button
            onClick={handleView}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-[20%] bg-navy text-white py-3 px-12 rounded-xl hover:bg-blue-800 transition-all duration-300 text-lg"
          >
            View
          </motion.button>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your prompt to modify this kurta"
            className="w-[45%] py-3 px-6 rounded-xl border-2 border-navy focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
          <motion.button 
            onClick={handleModify}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            className="w-[20%] bg-navy text-white py-3 px-12 rounded-xl hover:bg-blue-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            Modify
          </motion.button>
        </div>
      </div>
    </div>
  )
}