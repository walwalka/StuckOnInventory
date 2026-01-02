import React from 'react';
import { Link } from 'react-router-dom';
import { MdEmail } from 'react-icons/md';

// Reusable card component for consistent styling
const AdminCard = ({ to, icon: Icon, title, description }) => (
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
        </div>
      </div>
    </Link>
  </div>
);

const Admin = () => {
  return (
    <div className="flex justify-center p-4">
      <div className="max-w-full">
        <h1 className='text-3xl my-8'>Admin Panel</h1>
        <p className='usd-muted mb-6'>Manage system settings and data.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-start items-stretch gap-6 mt-10">
          <AdminCard
            to="/admin/users"
            icon={MdEmail}
            title="User Management"
            description="Manage users, roles, invitations, and account settings."
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;
