'use client'

import { useState, useRef, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Measurements() {
  const router = useRouter();
  const [isEditable, setIsEditable] = useState(false);
  const [height, setHeight] = useState('');
  const [measurements, setMeasurements] = useState({
    "Shoulder Width": '', "Arm Length": '', "Neck": '', "Wrist": '',
    "Chest (around)": '', "Waist (around)": '', "Hip (around)": '', 
    "Thigh": '', "Ankle": ''
  });
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExistingMeasurements();
  }, []);

  const fetchExistingMeasurements = async () => {
    try {
      const response = await fetch('/api/saveMeasurements', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (Object.keys(data).length > 0) {
          setMeasurements({
            "Shoulder Width": data.shoulder_width?.toString() || '',
            "Arm Length": data.arm_length?.toString() || '',
            "Neck": data.neck?.toString() || '',
            "Wrist": data.wrist?.toString() || '',
            "Chest (around)": data.chest?.toString() || '',
            "Waist (around)": data.waist?.toString() || '',
            "Hip (around)": data.hip?.toString() || '',
            "Thigh": data.thigh?.toString() || '',
            "Ankle": data.ankle?.toString() || '',
          });
          setHeight(data.height?.toString() || '');
        }
      } else {
        console.error('Failed to fetch measurements');
      }
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  };

  const handleMeasurementChange = (key: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const getMeasurements = async () => {
    if (!image || !height) {
      console.error('Image and height are required');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('height', height);

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Response from server:', result);

        const measurementLines = result.result.split('\n');
        const measurementValues: Record<string, number> = {};

        measurementLines.forEach((line: string) => {
          const [key, value] = line.split(':');
          if (key && value) {
            measurementValues[key.trim()] = parseFloat(value.trim());
          }
        });

        const newMeasurements = {
          "Shoulder Width": measurementValues['shoulder width']?.toFixed(2) || '',
          "Arm Length": measurementValues['arm length']?.toFixed(2) || '',
          "Neck": measurementValues['neck']?.toFixed(2) || '',
          "Wrist": measurementValues['wrist']?.toFixed(2) || '',
          "Chest (around)": measurementValues['chest']?.toFixed(2) || '',
          "Waist (around)": measurementValues['waist']?.toFixed(2) || '',
          "Hip (around)": measurementValues['hips']?.toFixed(2) || '',
          "Thigh": measurementValues['thigh']?.toFixed(2) || '',
          "Ankle": measurementValues['ankle']?.toFixed(2) || '',
        };

        setMeasurements(newMeasurements);
        setIsEditable(true);
        await saveMeasurements(newMeasurements);
      } else {
        console.error('Error:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const saveMeasurements = async (measurementsToSave = measurements) => {
    try {
      const response = await fetch('/api/saveMeasurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          height,
          measurements: measurementsToSave,
        }),
        credentials: 'include',
      });
  
      if (response.ok) {
        console.log('Measurements saved successfully');
        setMeasurements(measurementsToSave);
      } else {
        const errorData = await response.json();
        console.error('Failed to save measurements:', errorData.error);
      }
    } catch (error) {
      console.error('Error saving measurements:', error);
    }
  };
  
  const toggleEditable = async () => {
    if (isEditable) {
      await saveMeasurements(measurements);
      setIsEditable(false);
      router.push('/recommendation');
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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            className="px-6 py-2 bg-navy text-white rounded-full hover:bg-blue transition duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </button>
          {image && (
            <span className="text-green-600 font-medium py-2">Image uploaded!</span>
          )}
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
          <button
            className="px-6 py-2 bg-navy text-white rounded-full hover:bg-blue transition duration-300 ml-4"
            onClick={getMeasurements}
          >
            Get Measurements
          </button>
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
              <button 
                onClick={toggleEditable}
                className="px-20 py-3 bg-navy text-white rounded-full hover:bg-blue transition duration-300"
              >
                {isEditable ? 'Save and Continue' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
