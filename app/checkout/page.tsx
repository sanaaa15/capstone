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
  sleeve_length?: string;
  color?: string;
  hemline?: string;
  neckline?: string;
  print?: string;
  sleeve_style?: string;
  fabric?: string;
}

interface Measurements {
  height?: number | null;
  shoulder_width?: number | null;
  arm_length?: number | null;
  neck?: number | null;
  wrist?: number | null;
  chest?: number | null;
  waist?: number | null;
  hip?: number | null;
  thigh?: number | null;
  ankle?: number | null;
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

      // Add Order ID and Title
      const orderId = `ORD-${Date.now()}`;
      doc.setFontSize(24);
      doc.text('Order Details', 105, yPosition, { align: 'center' });
      yPosition += 15;
      doc.setFontSize(14);
      doc.text(`Order ID: ${orderId}`, 20, yPosition);
      yPosition += 20;

      // Fetch measurements with type assertion
      const measurementsResponse = await fetch('/api/saveMeasurements', {
        method: 'GET',
        credentials: 'include',
      });

      let measurements: Measurements = {};
      if (measurementsResponse.ok) {
        measurements = await measurementsResponse.json() as Measurements;
      }

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
        doc.text('DESCRIPTION:', 20, yPosition);
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
          `Sleeve Style: ${details.sleeve_style || 'N/A'}`,
          `Fabric: ${details.fabric || 'N/A'}`
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

        // Add a page break if there's not enough space
        if (yPosition > 250 && i < cartItems.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      }

      // Add measurements section
      doc.addPage();
      yPosition = 20;
      doc.setFontSize(20);
      doc.text('MEASUREMENTS', 105, yPosition, { align: 'center' });
      yPosition += 20;

      const measurementDetails = [
        `Height: ${measurements?.height ?? 'N/A'} cm`,
        `Shoulder Width: ${measurements?.shoulder_width ?? 'N/A'} cm`,
        `Arm Length: ${measurements?.arm_length ?? 'N/A'} cm`,
        `Neck: ${measurements?.neck ?? 'N/A'} cm`,
        `Wrist: ${measurements?.wrist ?? 'N/A'} cm`,
        `Chest: ${measurements?.chest ?? 'N/A'} cm`,
        `Waist: ${measurements?.waist ?? 'N/A'} cm`,
        `Hip: ${measurements?.hip ?? 'N/A'} cm`,
        `Thigh: ${measurements?.thigh ?? 'N/A'} cm`,
        `Ankle: ${measurements?.ankle ?? 'N/A'} cm`
      ];

      measurementDetails.forEach(text => {
        doc.text(text, 20, yPosition);
        yPosition += 10;
      });

      // Add total amount with tax
      const tax = totalOrderAmount * 0.18; // 18% GST
      const totalWithTax = totalOrderAmount + tax;

      yPosition += 20;
      doc.setFontSize(16);
      doc.text(`Subtotal: ₹${totalOrderAmount.toFixed(2)}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Tax (18%): ₹${tax.toFixed(2)}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Total Amount (inc. tax): ₹${totalWithTax.toFixed(2)}`, 20, yPosition);

      // Save the PDF
      doc.save(`order_${orderId}.pdf`);
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