'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBarHome from '../components/NavBarHome';
import withAuth from '../components/withAuth';

const questions = [
  {
    question: "1. For which occasions do you typically shop?",
    options: ["Festive", "Office Wear", "Everyday Comfort", "Formal Events"],
  },
  {
    question: "2. Which color palette do you usually lean towards?",
    options: ["Neutral (Beige, Cream, White)", "Bright (Red, Yellow, Orange)", "Pastel (Light Blue, Mint Green, Lavender)", "Dark (Navy Blue, Maroon, Black)"],
  },
  {
    question: "3. What type of designs do you prefer?",
    options: ["Sequins", "Embroidery", "Contemporary Printed Pattern", "Minimalist Plain Style"],
  },
  {
    question: "4. How do you like your kurta to fit?",
    options: ["Fitted silhouette tailored to your body shape", "A relaxed fit for comfortable wear", "A flared design that adds movement and volume", "An oversized fit for a casual look"],
  },
  {
    question: "5. Which fabric best aligns with your style?",
    options: ["Silk for its luxurious feel", "Cotton for its comfort", "Linen for its light and airy texture", "Polyester for its durability and versatility"],
  },
];

function Preference() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[][]>(questions.map(() => []));

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleOptionToggle = (index: number, option: string) => {
    const newSelectedOptions = [...selectedOptions];
    const optionIndex = newSelectedOptions[index].indexOf(option);
    if (optionIndex === -1) {
      newSelectedOptions[index].push(option);
    } else {
      newSelectedOptions[index].splice(optionIndex, 1);
    }
    setSelectedOptions(newSelectedOptions);
  };

  const savePreferences = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  
    try {
      const response = await fetch('/api/savePreferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ preferences: selectedOptions })
      });
  
      if (response.ok) {
        router.push('/measurements');
      } else {
        console.error('Failed to save preferences');
        // Optionally, add user feedback here
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Optionally, add user feedback here
    }
  };

  const handleStartDesigning = () => {
    savePreferences();
  };
  return (
    <div className="bg-navy min-h-screen">
      <div style={{ marginLeft: '2%' }}>
        <NavBarHome fontColor="text-beige" bgColor="bg-navy" />
      </div>
      <div className="flex my-10">
      <div className="bg-beige absolute left-0 p-4 w-[45%] h-[70%]" style={{ backgroundImage: "url('/pref-pattern.jpg')", backgroundSize: 'cover' }}>
      </div>
      <div className="ml-[40%] w-[70%] flex flex-col items-center">
        <div className="text-white text-center mb-10 w-[70%]">
          <p style={{ fontSize: '120%' }}>We'd love to uncover your style: from fabric to color, design flair to fit preference, and the occasions that inspire your wardrobe. Share your preferences and let's craft a kurta that truly reflects you!</p>
        </div>
        <div
          key={currentQuestion}
          className="bg-beige text-navy p-10 rounded-lg shadow-lg transition-transform transform scale-100"
          style={{ width: '500px', animation: 'fadeIn 1s' }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {questions[currentQuestion].question}
          </h2>
          <div className="space-y-2">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`block w-full py-2 px-4 rounded-md transition-colors ${
                  selectedOptions[currentQuestion].includes(option) ? 'bg-blue text-white' : 'bg-navy text-beige'
                } hover:bg-blue`}
                onClick={() => handleOptionToggle(currentQuestion, option)}
              >
                {option}
              </button>
            ))}
          </div>
        
          <div className="mt-4 text-right">
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="py-2 px-4 bg-navy text-beige rounded-md hover:bg-blue transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleStartDesigning}
                className="py-2 px-4 bg-navy text-beige rounded-md hover:bg-blue transition-colors"
              >
                Start Designing
              </button>
            )}
              </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default withAuth(Preference);