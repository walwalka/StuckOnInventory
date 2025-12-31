import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import api from '../../api/client';
import moment from 'moment';

const QRCodeModal = ({ isOpen, onClose, entityType, itemId, qrCodeUrl, onRegenerate, itemDetails }) => {
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

    // Format item details for the label
    let detailsHtml = '';
    if (itemDetails) {
      const details = [];

      // Common fields for all entity types
      if (itemDetails.type) details.push(`<div><strong>Type:</strong> ${itemDetails.type}</div>`);
      if (itemDetails.added_date) {
        const formattedDate = moment(itemDetails.added_date).format('MM/DD/YYYY');
        details.push(`<div><strong>Added:</strong> ${formattedDate}</div>`);
      }

      // Entity-specific fields
      if (entityType === 'coins') {
        if (itemDetails.mintyear) {
          const year = moment.utc(itemDetails.mintyear).format('YYYY');
          details.push(`<div><strong>Year:</strong> ${year}</div>`);
        }
        if (itemDetails.mintlocation) details.push(`<div><strong>Mint:</strong> ${itemDetails.mintlocation}</div>`);
        if (itemDetails.grade) details.push(`<div><strong>Grade:</strong> ${itemDetails.grade}</div>`);
      } else if (entityType === 'stamps') {
        if (itemDetails.country) details.push(`<div><strong>Country:</strong> ${itemDetails.country}</div>`);
        if (itemDetails.year) details.push(`<div><strong>Year:</strong> ${itemDetails.year}</div>`);
      } else if (entityType === 'relics' || entityType === 'bunnykins' || entityType === 'comics') {
        if (itemDetails.era) details.push(`<div><strong>Era:</strong> ${itemDetails.era}</div>`);
        if (itemDetails.manufacturer) details.push(`<div><strong>Manufacturer:</strong> ${itemDetails.manufacturer}</div>`);
      }

      if (itemDetails.quantity) details.push(`<div><strong>Quantity:</strong> ${itemDetails.quantity}</div>`);

      detailsHtml = details.join('');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Label - ${entityType} #${itemId}</title>
          <style>
            @page {
              size: 4in 2in;
              margin: 0.25in;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .label {
              width: 4in;
              height: 2in;
              display: flex;
              border: 1px solid #ccc;
              box-sizing: border-box;
            }
            .qr-section {
              width: 2in;
              display: flex;
              align-items: center;
              justify-content: center;
              border-right: 1px solid #eee;
              padding: 0.15in;
            }
            .qr-section svg {
              width: 1.7in !important;
              height: 1.7in !important;
            }
            .details-section {
              width: 2in;
              padding: 0.15in;
              display: flex;
              flex-direction: column;
            }
            .title {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 0.1in;
              color: #2c5f2d;
              border-bottom: 2px solid #2c5f2d;
              padding-bottom: 0.05in;
            }
            .details {
              font-size: 9pt;
              line-height: 1.3;
            }
            .details div {
              margin-bottom: 0.05in;
            }
            .details strong {
              color: #555;
            }
            .item-id {
              margin-top: auto;
              font-size: 7pt;
              color: #999;
              text-align: right;
            }
            @media print {
              body {
                background: white;
              }
              .label {
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="qr-section">
              ${svgData}
            </div>
            <div class="details-section">
              <div class="title">${entityType.charAt(0).toUpperCase() + entityType.slice(1)}</div>
              <div class="details">
                ${detailsHtml || '<div style="color: #999; font-style: italic;">No details available</div>'}
              </div>
              <div class="item-id">ID: ${itemId}</div>
            </div>
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
          <QRCode
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
