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
  const [totalOrderAmount, setTotalOrderAmount] = useState(0);

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
          
          const total = cartData.cartItems.reduce((sum: number, item: CartItem) => 
            sum + (item.price * item.quantity), 0);
          setTotalOrderAmount(total);
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
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      throw error;
    }
  };

  const generatePDF = async () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      let backgroundImage;
      try {
        backgroundImage = await loadImage('/ORDER.png');
      } catch (error) {
        console.error('Error loading background image:', error);
      }

      if (backgroundImage) {
        doc.addImage(backgroundImage, 'PNG', 0, 0, pageWidth, pageHeight);
      }
      const orderId = `ORD-${Date.now()}`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.setTextColor(0, 0, 102);
      doc.text(orderId, pageWidth / 2, pageHeight / 2, { align: 'center' });

      for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        const details = kurtaDetails[i] || {};

        doc.addPage();
        if (backgroundImage) {
          doc.addImage(backgroundImage, 'PNG', 0, 0, pageWidth, pageHeight);
        }
        let yPosition = 20;

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        yPosition += 30;

        try {
          const imageData = await loadImage(item.imageUrl);
          const imgWidth = 80;
          const imgHeight = 96;
          const xPosition = (pageWidth - imgWidth) / 2;
          doc.addImage(imageData, 'JPEG', xPosition, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 20;
        } catch (error) {
          console.error('Error adding image to PDF:', error);
          yPosition += 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 102)
        doc.setFont('helvetica', 'bold');

        doc.text('DESCRIPTION:', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal');

        const promptLines = doc.splitTextToSize(item.description, 170);
        doc.text(promptLines, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += (promptLines.length * 7) + 10;
        doc.setTextColor(0, 0, 102) 
        doc.setFont('helvetica', 'bold');

        doc.text('KURTA DETAILS:', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        const detailsText = [
          `Sleeve Length: ${details.sleeve_length || 'N/A'}`,
          `Color: ${details.color || 'N/A'}`,
          `Hemline: ${details.hemline || 'N/A'}`,
          `Neckline: ${details.neckline || 'N/A'}`,
          `Print/Pattern: ${details.print || 'N/A'}`,
          `Sleeve Style: ${details.sleeve_style || 'N/A'}`,
          `Fabric: ${details.fabric || 'N/A'}`
        ];
        doc.setTextColor(0, 0, 0)
        doc.setFont('helvetica', 'normal');

        detailsText.forEach(text => {
          doc.text(text, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 8;
        });
        yPosition += 5;
        const priceString = `PRICE: Rs. ${item.price.toLocaleString('en-IN')}`;
        doc.setTextColor(0, 0, 102)
        doc.setFont('helvetica', 'bold');
        doc.text(priceString, pageWidth / 2, yPosition, { align: 'center' });
      }

      doc.addPage();
      if (backgroundImage) {
        doc.addImage(backgroundImage, 'PNG', 0, 0, pageWidth, pageHeight);
      }
      let yPosition = 50;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 102)
      doc.setFont('helvetica', 'bold');
      doc.text('MEASUREMENTS', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 30;

      try {
        const measurementsResponse = await fetch('/api/saveMeasurements', {
          method: 'GET',
          credentials: 'include',
        });

        if (measurementsResponse.ok) {
          const measurements = await measurementsResponse.json();
          
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
          doc.setTextColor(0, 0, 0)
          doc.setFont('helvetica', 'normal');

          measurementDetails.forEach(text => {
            doc.text(text, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
          });
        }
      } catch (error) {
        console.error('Error fetching measurements:', error);
        doc.text('Measurements not available', pageWidth / 2, yPosition, { align: 'center' });
      }

      yPosition += 40;
      const tax = totalOrderAmount * 0.18;
      const totalWithTax = totalOrderAmount + tax;

      doc.setFontSize(18);
      doc.text(`Subtotal: Rs. ${totalOrderAmount.toLocaleString('en-IN')}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Tax (18%): Rs. ${tax.toLocaleString('en-IN')}`, 20, yPosition);
      yPosition += 10;
      doc.text(`Total Amount (inc. tax): Rs. ${totalWithTax.toLocaleString('en-IN')}`, 20, yPosition);

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