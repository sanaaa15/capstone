'use client';
import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import NavBar from '../components/NavBar';

const CheckoutPage = () => {
  const [orderDetails, setOrderDetails] = useState([]);

  useEffect(() => {
    const details = JSON.parse(localStorage.getItem('orderDetails') || '[]');
    setOrderDetails(details);
    // Clear cart after order is placed
    localStorage.removeItem('cart');
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

      // Add title
      doc.setFontSize(20);
      doc.text('Order Details', 105, yPosition, { align: 'center' });
      yPosition += 20;

      let totalOrderAmount = 0;

      // Add items
      for (const [index, item] of orderDetails.entries()) {
        // Add item number
        doc.setFontSize(16);
        doc.text(`Item ${index + 1}`, 20, yPosition);
        yPosition += 15;

        try {
          // Convert image URL to base64
          const imageData = await loadImage(item.imageUrl);
          doc.addImage(imageData, 'JPEG', 20, yPosition, 50, 60);
          yPosition += 70;
        } catch (error) {
          console.error('Error loading image:', error);
          // Continue with the rest of the details even if image fails
          yPosition += 10;
        }

        // Add text details
        doc.setFontSize(12);
        doc.text(`Price: ₹${item.price}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Quantity: ${item.quantity}`, 20, yPosition);
        yPosition += 10;

        // Add description with word wrap
        const descLines = doc.splitTextToSize(`Description: ${item.description}`, 170);
        doc.text(descLines, 20, yPosition);
        yPosition += (descLines.length * 7);

        // Add comments if any
        if (item.comment) {
          const commentLines = doc.splitTextToSize(`Comments: ${item.comment}`, 170);
          doc.text(commentLines, 20, yPosition);
          yPosition += (commentLines.length * 7);
        }

        totalOrderAmount += item.price * item.quantity;
        yPosition += 20;

        // Add a page break if there's not enough space for the next item
        if (yPosition > 250 && index < orderDetails.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      }

      // Add total amount
      doc.setFontSize(14);
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