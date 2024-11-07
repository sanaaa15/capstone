'use client';
import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import NavBar from '../components/NavBar';

interface CartItem {
  kurtaId: string;
  description: string;
  imageUrl: string;
  quantity: number;
  price: number;
  comment?: string;
}

interface KurtaDetail {
  description?: string;
  quantity?: number;
  sleeve_length?: string;
  color?: string;
  hemline?: string;
  neckline?: string;
  print?: string;
  sleeve_style?: string;
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [kurtaDetails, setKurtaDetails] = useState<KurtaDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartResponse, kurtaResponse] = await Promise.all([
          fetch('/api/getCart'),
          fetch('/api/getKurtaDetails')
        ]);

        if (cartResponse.ok && kurtaResponse.ok) {
          const cartData = await cartResponse.json();
          const kurtaData = await kurtaResponse.json();
          
          setCartItems(cartData.cartItems);
          setKurtaDetails(kurtaData.kurtaDetails || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const loadImage = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';  // Enable CORS
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      let yPosition = 20;
      let totalOrderAmount = 0;

      // Add title
      doc.setFontSize(24);
      doc.text('Order Details', 105, yPosition, { align: 'center' });
      yPosition += 30;

      // Process each cart item
      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const details = kurtaDetails[i] || {};

        // Add Kurta number header
        doc.setFontSize(20);
        doc.text(`KURTA ${i + 1}`, 20, yPosition);
        yPosition += 20;

        // Add image
        try {
          const imageData = await loadImage(item.imageUrl);
          doc.addImage(imageData, 'JPEG', 20, yPosition, 50, 60);
          yPosition += 70;
        } catch (error) {
          console.error('Error loading image:', error);
        }

        // Add prompt
        doc.setFontSize(12);
        doc.text('PROMPT:', 20, yPosition);
        yPosition += 10;
        const promptLines = doc.splitTextToSize(item.description, 170);
        doc.text(promptLines, 20, yPosition);
        yPosition += (promptLines.length * 7) + 10;

        // Add kurta details
        doc.setFontSize(14);
        doc.text('KURTA DETAILS:', 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        const detailsText = [
          `Sleeve Length: ${details.sleeve_length || 'N/A'}`,
          `Color: ${details.color || 'N/A'}`,
          `Hemline: ${details.hemline || 'N/A'}`,
          `Neckline: ${details.neckline || 'N/A'}`,
          `Print/Pattern: ${details.print || 'N/A'}`,
          `Sleeve Style: ${details.sleeve_style || 'N/A'}`
        ];

        detailsText.forEach(text => {
          doc.text(text, 20, yPosition);
          yPosition += 8;
        });

        // Add price
        doc.setFontSize(14);
        doc.text(`PRICE: ₹${item.price}`, 20, yPosition);
        yPosition += 20;

        totalOrderAmount += item.price * (item.quantity || 1);

        // Add a page break if there's not enough space for the next item
        if (yPosition > 250 && i < cartItems.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      }

      // Add total amount at the end
      doc.setFontSize(16);
      doc.text(`Total Amount: ₹${totalOrderAmount.toFixed(2)}`, 20, yPosition);

      // Save the PDF
      doc.save('order_details.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="bg-beige min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-navy mb-6">
            Order Placed Successfully!
          </h1>
          <p className="text-xl mb-8">
            Thank you for your order. Your kurtas will be crafted with care.
          </p>
          <button
            onClick={generatePDF}
            className="bg-navy text-white py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors duration-300"
          >
            Download Order Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;