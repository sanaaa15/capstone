'use client'

import { useState } from 'react';
import NavBar from '../components/NavBar';
import Image from 'next/image'
import Link from 'next/link';

export default function Measurements() {
  const [isEditable, setIsEditable] = useState(false);
  const [height, setHeight] = useState('');
  const [measurements, setMeasurements] = useState({
    "Shoulder Width": '', "Arm Length": '', "Neck": '', "Wrist": '',
    "Chest (around)": '', "Waist (around)": '', "Hip (around)": '', 
    "Thigh": '', "Ankle": ''
  });

  const handleMeasurementChange = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const saveMeasurements = async () => {
    try {
      const response = await fetch('/api/saveMeasurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ height, ...measurements }),
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Measurements saved successfully');
        setIsEditable(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to save measurements:', errorData.error);
      }
    } catch (error) {
      console.error('Error saving measurements:', error);
    }
  };

  const toggleEditable = () => {
    if (isEditable) {
      saveMeasurements();
    } else {
      setIsEditable(true);
    }
  };

  return (
    <div>
    <NavBar />
    <div className="max-w-6xl mx-auto p-2 bg-beige-200">
        <h1 className="text-center mb-8 text-blue text-3xl font-bold">
          We use state-of-the-art computer vision models to extract your measurements using only an image.
        </h1>
       
        <div className="flex justify-center space-x-4 mb-8">
          <button className="px-6 py-2 bg-navy text-white rounded-full hover:bg-blue transition duration-300">
            Upload image
          </button>
          <div className="flex items-center">
            <label htmlFor="height" className="mr-2 text-navy font-medium">Height (cm):</label>
            <input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="border border-navy rounded-full px-3 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue"
              placeholder="cm"
            />
          </div>
        </div>

        <div className="flex justify-between mb-8">
          <div className='w-[39%] mt-[3%]'>
            <Image src="/measurements.png" alt="Measurement Diagram" width={500} height={600} />
          </div>
          <div className="w-[58%]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-navy">Measurements</h2>
              <button 
                className="px-6 py-2 bg-navy text-white rounded-full hover:bg-blue transition duration-300"
                onClick={toggleEditable}
              >
                {isEditable ? 'Save measurements' : 'Modify measurements'}
              </button>
            </div>
            <table className="w-full border-collapse bg-beige-100 rounded-lg overflow-hidden shadow-lg mb-6">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="p-3 text-left">Measurement</th>
                  <th className="p-3 text-left">Value (cm)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(measurements).map(([key, value], index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-beige-50' : 'bg-beige-100'}>
                    <td className="p-3 border-b border-beige-200 text-navy font-medium">{key}</td>
                    <td className="p-3 border-b border-beige-200">
                      <input
                        type="number"
                        value={value}
                        onChange={(e) => handleMeasurementChange(key, e.target.value)}
                        className={`w-full px-3 py-1 rounded-full ${isEditable ? 'bg-white border border-blue' : 'bg-transparent'} focus:outline-none focus:ring-2 focus:ring-blue`}
                        disabled={!isEditable}
                        placeholder="cm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center">
            <Link href="/recommendation">
              <button className="px-20 py-3 bg-navy text-white rounded-full hover:bg-blue transition duration-300">
                Next
              </button>
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}