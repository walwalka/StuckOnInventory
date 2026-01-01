import React from 'react';
import { BsQrCode } from 'react-icons/bs';

const QRButton = ({ onClick, title = "View QR Code" }) => {
  return (
    <button
      onClick={onClick}
      className="hover:scale-110 transition-transform"
      title={title}
    >
      <BsQrCode className='text-xl' style={{ color: 'var(--usd-green)' }} />
    </button>
  );
};

export default QRButton;
