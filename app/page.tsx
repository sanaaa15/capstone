import React from 'react';
import Layout from './layout';
import './globals.css';

const HomePage = () => {
  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-screen">
        <main className="p-8 bg-beige-200 w-full lg:w-2/3 overflow-y-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-12">
            <div className="text-blue-800 font-bold text-6xl md:text-8xl font-custom-1 mb-4 lg:mb-0">
              TS
            </div>
            <nav>
              <ul className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-10 text-blue-800">
                <li>Home</li>
                <li>Profile</li>
                <li>About Us</li>
              </ul>
            </nav>
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-blue-800 font-custom-2">
              <span className="text-white">DISCOVER THE PERFECT KURTA</span> TAILORED JUST FOR YOU!
            </h1>
            <p className="mt-4 text-blue-800 text-lg md:text-xl">
              <span className="font-bold">Welcome to Tailor Swift</span>, where tradition meets technology. We
              craft personalized kurtas that fit your unique style and
              measurements. Using advanced computer vision, we ensure each
              garment is perfectly tailored for unmatched comfort and elegance.
              For any occasion, Tailor Swift blends sophistication and
              individuality in every stitch.
            </p>
          </div>
        </main>
        <div className="relative w-full lg:w-1/3 overflow-hidden">
          <div className="relative h-64 lg:h-full">
            <img
              src="/home-page-pattern.jpg"
              alt="Background Design"
              className="absolute top-0 right-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full h-1/2 bg-beige-200 lg:bg-transparent"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
