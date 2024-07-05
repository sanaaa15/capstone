'use client';
import NavBarHome from '../components/NavBarHome';
import ScrollingText from '../components/ScrollingText';

function About() {
  return (
    <div className="bg-beige min-h-screen overflow-x-hidden font-custom-3">
      <div style={{ marginLeft: '2%', marginBottom: '3%' }}>
        <NavBarHome />
      </div>
      <ScrollingText text="ABOUT US" />
      <div className="bg-beige px-16 py-8">
        <div className="flex flex-col space-y-16">
          <div className="flex items-start -mr-16 mt-10">
            <div className="w-2/3 pr-16">
              <h2 className="text-3xl font-bold mb-6 text-navy">Welcome to Tailor Swift!</h2>
              <p className='text-xl text-justify'>At Tailor Swift, we believe in the perfect blend of tradition and technology. Our mission is to bring you beautifully crafted kurtas that are personalized to your unique style and measurements. Each piece is a testament to our commitment to quality, comfort, and elegance.</p>
            </div>
            <div className="w-[45%] h-56 bg-navy bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('/about-page-pattern.jpg')" }}></div>
          </div>
          
          <div className="flex items-start -ml-16">
            <div className="w-[45%] bg-navy h-56 bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('/about-page-pattern.jpg')" }}></div>
            <div className="w-2/3 pl-16">
              <h2 className="text-3xl font-custom-3 font-bold text-navy mb-6">Our Story</h2>
              <p className='text-xl text-justify'>Tailor Swift was founded with a vision to revolutionize traditional attire by integrating advanced computer vision and innovative tailoring techniques. We understand that every individual has a unique style, and our goal is to provide you with garments that reflect your personality and fit you perfectly.</p>
            </div>
          </div>
          
          <div className="flex -mx-16 justify-between">
            <div className="mt-20 w-[12%] bg-navy h-[540px] bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('/about-page-pattern.jpg')" }}></div>
            <div className="w-3/5 px-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6 text-navy">What We Do</h2>
                <p className="text-xl text-justify mt-10">Using state-of-the-art technology, we ensure that each kurta is tailored with precision for an unmatched fit. Our designs are inspired by timeless traditions, yet crafted to meet modern tastes. From casual wear to special occasions, Tailor Swift offers a range of kurtas that are as unique as you are.</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6 text-navy">Why Choose Us?</h2>
                <ul className="marker:text-navy list-disc list-inside text-xl text-justify m-10 space-y-10">
                  <li><span className="text-navy">Personalized Fit:</span> Our advanced tailoring techniques ensure that your kurta is made to your exact measurements for a perfect fit.</li>
                  <li><span className="text-navy">Quality Craftsmanship:</span> Each garment is crafted with attention to detail and high-quality materials for lasting elegance and comfort.</li>
                  <li><span className="text-navy">Innovative Design:</span> We combine traditional aesthetics with contemporary designs to bring you kurtas that stand out.</li>
                  <li><span className="text-navy">Customer Satisfaction:</span> Your satisfaction is our priority. We are here to provide you with a seamless and enjoyable shopping experience.</li>
                </ul>
              </div>
              
              <div className="text-center text-navy font-bold text-2xl mb-4 font-custom-3">
                <p>Thank you for choosing Tailor Swift. We look forward to helping you discover the perfect kurta, tailored just for you!</p>
              </div>
            </div>
            <div className="mt-20 w-[12%] bg-navy h-[540px] bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('/about-page-pattern.jpg')" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
