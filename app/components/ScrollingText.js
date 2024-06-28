import React from 'react';

function ScrollingText({ text }) {
  const words = text.split(' ');

  return (
    <div className="overflow-hidden whitespace-nowrap pb-4">
      <div className="inline-block animate-infinite-scroll font-custom-2 text-6xl">
        {[...Array(20)].map((_, i) => (
          <span key={i} className="mx-10">
            <span className="text-white">{words[0]}</span>
            <span className="text-blue ml-2">   {words[1]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default ScrollingText;
