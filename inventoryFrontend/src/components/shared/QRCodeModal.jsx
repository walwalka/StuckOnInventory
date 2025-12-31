import React, { useRef } from 'react';
import { QRCodeSVG } from 'react-qr-code';
import api from '../../api/client';

const QRCodeModal = ({ isOpen, onClose, entityType, itemId, qrCodeUrl, onRegenerate }) => {
  const qrRef = useRef();

  if (!isOpen) return null;

  const handleDownload = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 300;
    canvas.height = 300;

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-${entityType}-${itemId}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${entityType} #${itemId}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
            }
            h1 {
              font-size: 18px;
              margin-bottom: 20px;
              color: #333;
            }
            @media print {
              body {
                background: white;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${entityType.charAt(0).toUpperCase() + entityType.slice(1)} #${itemId}</h1>
            ${svgData}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleRegenerateClick = async () => {
    try {
      await api.post(`/${entityType}/qr/regenerate/${itemId}`);
      if (onRegenerate) {
        onRegenerate();
      }
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
      alert('Failed to regenerate QR code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div className="bg-white dark:bg-[#2c2c2c] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold usd-text-green">QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-base font-semibold"
          >
            Close
          </button>
        </div>

        <div ref={qrRef} className="flex justify-center mb-6 bg-white p-4 rounded">
          <QRCodeSVG
            value={qrCodeUrl}
            size={256}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Download
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Print
          </button>
          <button
            onClick={handleRegenerateClick}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition col-span-2"
          >
            Regenerate QR Code
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Scan this code to view item details
        </p>
      </div>
    </div>
  );
};

export default QRCodeModal;
