import React from 'react';
import Link from 'next/link';

const Logo = () => {
  return (
    <header className="bg-beige inline-block">
      <Link href="/">
        <div className="text-blue font-bold text-6xl md:text-8xl font-custom-1 mb-4 lg:mb-0 mx-auto">
          TS
        </div>
      </Link>
    </header>
  );
};

export default Logo;