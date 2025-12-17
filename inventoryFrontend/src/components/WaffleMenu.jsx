import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GiTwoCoins, GiArrowhead, GiStamper, GiRabbit } from 'react-icons/gi';
import { RiAdminLine } from 'react-icons/ri';
import { MdDashboard, MdLocationOn } from 'react-icons/md';
import { BsGrid3X3Gap } from 'react-icons/bs';

const WaffleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Navigation items - add new pages here and they'll automatically appear
  const navItems = [
    { path: '/', title: 'Inventory Hub', icon: MdDashboard, color: 'usd-btn-green' },
    { path: '/coins', title: 'Coins', icon: GiTwoCoins, color: 'usd-btn-green' },
    { path: '/relics', title: 'Indian Relics', icon: GiArrowhead, color: 'usd-btn-green' },
    { path: '/stamps', title: 'Stamps', icon: GiStamper, color: 'usd-btn-green' },
    { path: '/bunnykins', title: 'Bunnykins', icon: GiRabbit, color: 'usd-btn-green' },
    { path: '/admin', title: 'Admin', icon: RiAdminLine, color: 'usd-btn-copper' },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Waffle Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded hover:opacity-100 transition usd-btn-green"
        title="Menu"
      >
        <BsGrid3X3Gap className="text-2xl" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
          <div className="absolute right-0 mt-2 w-80 usd-panel rounded-lg shadow-lg p-4 z-50">
          <div className="grid grid-cols-2 gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`p-4 rounded-lg ${item.color} hover:opacity-100 transition flex flex-col items-center justify-center gap-2 text-center`}
                >
                  <Icon className="text-3xl" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaffleMenu;
