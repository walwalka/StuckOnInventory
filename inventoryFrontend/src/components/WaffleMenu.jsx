import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import * as GiIcons from 'react-icons/gi';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import { RiAdminLine } from 'react-icons/ri';
import { BsGrid3X3Gap } from 'react-icons/bs';
import { isAdmin } from '../auth/token';

// Helper function to get icon component from icon name
const getIcon = (iconName) => {
  // Try GiIcons first (most common for collectibles)
  if (GiIcons[iconName]) return GiIcons[iconName];
  // Then FaIcons
  if (FaIcons[iconName]) return FaIcons[iconName];
  // Then MdIcons
  if (MdIcons[iconName]) return MdIcons[iconName];
  // Default fallback
  return MdIcons.MdFolder;
};

const WaffleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const userIsAdmin = isAdmin();

  // Fetch dynamic tables
  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response.data.tables || [];
    },
    enabled: isOpen // Only fetch when menu is opened
  });

  // Build navigation items from dynamic tables
  const tableNavItems = tables.map(table => ({
    path: `/${table.table_name}`,
    title: table.display_name,
    icon: getIcon(table.icon),
    color: 'usd-btn-green'
  }));

  // Static navigation items
  const staticNavItems = [
    { path: '/', title: 'Inventory Hub', icon: MdIcons.MdDashboard, color: 'usd-btn-green' },
  ];

  // Admin items
  const adminNavItems = userIsAdmin
    ? [{ path: '/admin', title: 'Admin', icon: RiAdminLine, color: 'usd-btn-copper' }]
    : [];

  // Combine all nav items
  const navItems = [...staticNavItems, ...tableNavItems, ...adminNavItems];

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
