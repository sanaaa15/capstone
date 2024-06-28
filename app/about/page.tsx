'use client'

import NavBarHome from '../components/NavBarHome';
import ScrollingText from '../components/ScrollingText';

function About() {
    return (
        <div>
            <div className="bg-beige min-h-screen">
            <div style={{ marginLeft: '2%' , marginBottom: '3%'}}>
                <NavBarHome />
            </div>
        <ScrollingText text="ABOUT US" />

          <div className="absolute right-0 p-8 bg-navy h-[35%] w-[37%] top-[35%] bg-cover bg-center" style={{ backgroundImage: "url('/about-page-pattern.jpg')"}}>
          </div>

          <div className="absolute left-0 p-8 bg-navy h-[35%] w-[37%] top-[75%] bg-cover bg-center" style={{ backgroundImage: "url('/about-page-pattern.jpg')"}}>
          </div> 
        </div>

        <div className="min-h-screen bg-beige p-16">
        <div className="absolute right-0 p-8 bg-navy h-[70%] w-[20%] top-[125%] bg-cover bg-center" style={{ backgroundImage: "url('/about-page-pattern.jpg')"}}>
          </div>

          <div className="absolute left-0 p-8 bg-navy h-[70%] w-[20%] top-[125%] bg-cover bg-center" style={{ backgroundImage: "url('/about-page-pattern.jpg')"}}>
          </div> 
        </div>

        <div className="h-[20%] p-8">

        </div>


        </div>
        
    );
}

export default About;
