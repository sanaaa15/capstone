// app/components/Logo.jsx
import React from 'react';
import Link from 'next/link';

const Logo = ({ fontColor = 'text-blue' }) => {
  return (
    <header className="inline-block">
      <Link href="/">
        <div className={`${fontColor} font-bold text-6xl md:text-8xl font-custom-1 mb-4 lg:mb-0 mx-auto`}>
          TS
        </div>
      </Link>
    </header>
  );
};

export default Logo;
