import Head from 'next/head'
import Image from 'next/image'
import Logo from '../components/Logo';
import Link from 'next/link';

export default function Measurements() {
//   const measurements = [
//     "Bust", "Under Bust", "Waist", "Hips", "Front Width", "Neck",
//     "Bust Height", "Bust Width", "Shoulder to Waist on Front", "Leg Length",
//     "Back Width", "Shoulder", "Shoulder Width", "Neck to Waist",
//     "Shoulder to Elbow", "Bicep", "Shoulder to Waist on Back", "Arm Length",
//     "Wrist", "Thigh", "Calf", "Height", "Neck to Floor", "Waist to Floor"
//   ];
const measurements = [
    "Shoulder", "Front Neck Depth", "Back Neck Depth", "Arm Hole", "Short Sleeve Length", "3/4th Sleeve Length",
    "Full Sleeve Length", "Biceps", "Elbow Round", "Mohari (Wrist)", "Chest (around)",
    "Waist (around)", "Hip (around)", "Kurta Length"];

  return (
    <div className="max-w-6xl mx-auto p-5 bg-beige-200">
      <header className="flex justify-between items-center mb-10">
        <Logo />
        <nav className="space-x-5">
          <Link href="/" className="text-gray-700">Home</Link>
          <Link href="#" className="text-gray-700">Profile</Link>
          <Link href="/wishlist" className="text-gray-700">Wishlist</Link>
          <Link href="/cart" className="text-gray-700">Cart</Link>
        </nav>
      </header>
      <main>
        <h1 className="text-center mb-8 text-blue text-4xl ">
          We use state-of-the-art computer vision models to extract your measurements using only an image.
        </h1>
       
        <button className="block mx-auto mb-8 px-4 py-2 bg-[#003366] text-white rounded-full">
          Upload image
        </button>

        <div className="flex border-blue-500 justify-between mb-8 ">
          <div className='w-[39%]'>
            <Image src="/Kurta_measurements4.png" alt="Measurement Diagram" width={500} height={600} />
          </div>
          <div className="w-[48%]">
            <table className="w-full border-collapse">
              <tbody>
                {measurements.map((measurement, index) => (
                  <tr key={index} className="border border-blue">
                    <td className="p-2 border border-blue">{index + 1}</td>
                    <td className="p-2 border border-blue">{measurement}</td>
                    <td className="p-2 border border-blue"></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-4 px-4 py-2 bg-[#003366] text-white rounded-full">
              Modify measurements
            </button>
          </div>
        </div>

        <button className="float-right px-4 py-2 bg-[#003366] text-white rounded">
          Next
        </button>
      </main>
    </div>
  )
}