import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { MdAdd } from 'react-icons/md';
import { RiAdminLine } from 'react-icons/ri';
import * as GiIcons from 'react-icons/gi';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import { isAdmin } from '../auth/token';
import Spinner from '../components/Spinner';

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

// Reusable card component for consistent styling
const HubCard = ({ to, icon: Icon, title, description, itemCount }) => (
  <div className="w-full md:w-96">
    <Link
      to={to}
      className="block usd-panel border-2 usd-border-green rounded-lg p-6 hover:shadow-lg transition h-full"
    >
      <div className="flex items-center gap-4">
        <Icon className="text-5xl flex-shrink-0" style={{ color: 'var(--usd-copper)' }} />
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-semibold usd-text-green">
            {title}
          </div>
          <div className="text-sm usd-muted">
            {description}
          </div>
          {itemCount !== undefined && (
            <div className="text-xs usd-muted mt-1">
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </Link>
  </div>
);

const Home = () => {
  const userIsAdmin = isAdmin();

  const { data: tables = [], isLoading, error } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get('/tables');
      return response.data.tables || [];
    }
  });

  return (
    <div className="flex justify-center p-4">
      <div className="max-w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className='text-3xl my-8'>Inventory Hub</h1>
            <p className='usd-muted'>Manage your collectibles inventory.</p>
          </div>
          <Link
            to="/table-designer"
            className="usd-btn-green px-4 py-2 rounded flex items-center gap-2"
          >
            <MdAdd /> Create New Table
          </Link>
        </div>

        {isLoading ? (
          <Spinner />
        ) : error ? (
          <div className="usd-panel p-6 text-center">
            <p className="text-red-500">Error loading tables</p>
            <p className="text-sm usd-muted mt-2">{error.message}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-start items-stretch gap-6 mt-10">
            {/* Dynamic table cards */}
            {tables.map((table) => {
              const Icon = getIcon(table.icon);
              return (
                <HubCard
                  key={table.id}
                  to={`/${table.table_name}`}
                  icon={Icon}
                  title={table.display_name}
                  description={table.description || `Manage your ${table.display_name.toLowerCase()}`}
                  itemCount={table.item_count}
                />
              );
            })}

            {/* Admin Panel (always last) */}
            {userIsAdmin && (
              <HubCard
                to="/admin"
                icon={RiAdminLine}
                title="Admin Panel"
                description="View, create, edit, and manage your admin settings."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
