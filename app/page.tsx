'use client';
import React, { useEffect, useRef, useState } from 'react';
import NavBarHome from './components/NavBarHome';
import NavBar from './components/NavBar';
import { useCookies } from 'react-cookie';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null); // Null by default to check if username is fetched
  const [cookies] = useCookies(['token']);

  // Define refs for animated elements
  const animatedRefs = useRef<(HTMLElement | null)[]>([]);

  // Check login status based on token presence
  useEffect(() => {
    if (cookies.token) {
      setIsLoggedIn(true);
      // Fetch user data based on token
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/profile');
          const data = await response.json();
          if (data.userProfile) {
            setUsername(data.userProfile.full_name); // Set the username if fetched successfully
          } else {
            setUsername(null); // Handle the case where username cannot be fetched
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          setUsername(null); // Set username to null on error
        }
      };

      fetchUser();
    } else {
      setIsLoggedIn(false);
      setUsername(null); // Ensure username is null if the token is not present
    }
  }, [cookies.token]);

  // Function to add ref to the array
  const addToRefs = (el: HTMLElement | null): void => {
    if (el && !animatedRefs.current.includes(el)) {
      animatedRefs.current.push(el);
    }
  };

  // Intersection Observer to handle animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fadeInUp');
          }
        });
      },
      { threshold: 0.1 }
    );

    animatedRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      animatedRefs.current.forEach((ref) => {
        if (ref) {
          observer.unobserve(ref);
        }
      });
    };
  }, []);

  return (
    <div>
      <div className="min-h-screen bg-beige">
        <div className="mr-[40%] ml-[2%]">
          {/* Show the appropriate navbar based on the login status and fetched username */}
          {isLoggedIn && username ? <NavBar fontColor="text-blue" /> : <NavBarHome fontColor="text-blue" />}
        </div>
        <div
          className="absolute right-0 top-0 bg-navy p-8 h-[70%] w-[32%] bg-cover bg-center"
          style={{ backgroundImage: "url('/home-page-pattern.jpg')" }}
        ></div>
        <div className="p-8 max-w-4xl ml-[2%]">
          <p ref={addToRefs} className="text-white text-6xl font-bold leading-none font-custom-2">DISCOVER THE</p>
          <p ref={addToRefs} className="text-white text-6xl font-bold leading-none font-custom-2">PERFECT KURTA,</p>
          <p ref={addToRefs} className="text-blue text-6xl font-bold leading-none font-custom-2">TAILORED JUST FOR</p>
          <p ref={addToRefs} className="text-blue text-6xl font-bold leading-none font-custom-2">YOU!</p>
          <p className="mx-2 my-2 text-lg">
            <span className="font-bold text-navy">Welcome to Tailor Swift,</span> where tradition meets technology. We craft personalized kurtas that fit your unique style and measurements. Using advanced computer vision, we ensure each garment is perfectly tailored for unmatched comfort and elegance.
          </p>
        </div>
        <div className="ml-[34%] mt-[5%] w-[65%]">
          <p ref={addToRefs} className="text-white text-6xl font-bold leading-none font-custom-2">YOUR PERFECT KURTA</p>
          <p ref={addToRefs} className="text-blue text-6xl font-bold leading-none font-custom-2">IN FOUR SIMPLE STEPS</p>
        </div>
      </div>
      <div className="min-h-screen bg-navy relative">
        <div
          className="absolute left-0 bottom-[35%] bg-navy p-8 h-[95%] w-[32%] bg-cover bg-center"
          style={{ backgroundImage: "url('/home-page-pattern.jpg')" }}
        ></div>
        <div className="absolute left-[34%] top-[10%] space-y-10">
          <div ref={addToRefs} className="bg-white rounded-2xl p-4 shadow-lg max-w-[65%] ml-[29%] opacity-0">
            <h3 className="text-navy font-bold text-2xl mb-1">1. Upload a Picture</h3>
            <p className="text-gray-700 text-lg">
              Upload a full-length photo of yourself, and our advanced technology will extract your measurements.
            </p>
          </div>
          <div ref={addToRefs} className="bg-white rounded-2xl p-4 shadow-lg max-w-[65%] ml-[16%] opacity-0">
            <h3 className="text-navy font-bold text-2xl mb-1">2. Generate personalized designs</h3>
            <p className="text-gray-700 text-lg">
              Generate kurtas tailored to your likes and preferences using our SDXL model.
            </p>
          </div>
          <div ref={addToRefs} className="bg-white rounded-2xl p-4 shadow-lg max-w-[65%] opacity-0">
            <h3 className="text-navy font-bold text-2xl mb-1">3. Customize your Designs</h3>
            <p className="text-gray-700 text-lg">
              Customize the generated design by selecting fabrics, colors, necklines, sleeve lengths, and other details.
            </p>
          </div>
        </div>
        <div ref={addToRefs} className="absolute left-[16%] top-[71%] max-w-[48%] bg-white rounded-2xl p-4 shadow-lg opacity-0">
          <h3 className="text-navy font-bold text-2xl mb-1">4. Place Your Order</h3>
          <p className="text-gray-700 text-lg">
            Once satisfied with your design, place your order, and our skilled tailors will craft your kurta with precision.
          </p>
        </div>
        <div
          className="absolute right-0 top-[68%] bg-navy p-8 h-[110%] w-[32%] bg-cover bg-center"
          style={{ backgroundImage: "url('/home-page-pattern.jpg')" }}
        ></div>
      </div>
      <div className="min-h-screen bg-beige">
        <div className="p-8 max-w-5xl" style={{ marginLeft: '2%' }}>
          <p ref={addToRefs} className="text-white text-6xl font-bold leading-none font-custom-2">CHECK OUT SOME</p>
          <p ref={addToRefs} className="text-blue text-6xl font-bold leading-none font-custom-2">DESIGNS GENERATED BY OUR MODEL</p>
        </div>
        <div className="flex bg-beige mx-4 p-8">
          <div className="flex flex-col items-center mx-4">
            <img src="kurta-1.png" alt="Image 1" className="h-[78%] w-64 object-cover" />
            <p className="mt-4 text-center text-navy text-medium">"plain white color"</p>
          </div>
          <div className="flex flex-col items-center mx-4">
            <img src="kurta-2.png" alt="Image 2" className="h-[78%] w-64 object-cover" />
            <p className="mt-4 text-center text-navy text-medium">"white and orange, anarkali"</p>
          </div>
          <div className="flex flex-col items-center mx-4">
            <img src="kurta-3.jpg" alt="Image 3" className="h-[78%] w-64 object-cover" />
            <p className="mt-4 text-center text-navy text-medium">"beige color kurta with embroidery"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
