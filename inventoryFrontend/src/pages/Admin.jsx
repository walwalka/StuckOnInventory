import React from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineTableRows } from 'react-icons/md';
import { RiAdminLine } from 'react-icons/ri';
import { GiTwoCoins } from 'react-icons/gi';

const Admin = () => {
  return (
    <div className='p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center gap-3 mb-8'>
          <RiAdminLine className='text-4xl usd-text-green' />
          <h1 className='text-4xl font-bold usd-text-green'>Admin Panel</h1>
        </div>
        
        <p className='text-lg usd-muted mb-8'>
          Manage system settings and data.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Mint Locations Card */}
          <Link 
            to='/mintlocations'
            className='block border-2 usd-border-silver rounded-xl p-6 hover:shadow-lg transition-shadow usd-panel group'
          >
            <div className='flex items-center gap-4 mb-4'>
              <MdOutlineTableRows className='text-5xl usd-text-green group-hover:scale-110 transition-transform' />
              <div>
                <h2 className='text-2xl font-semibold usd-text-green'>Mint Locations</h2>
                <p className='text-sm usd-muted'>Manage mint location data</p>
              </div>
            </div>
            <p className='usd-muted text-sm'>
              View, create, edit, and delete mint locations used for coin records.
            </p>
          </Link>

          {/* Coin Types Card */}
          <Link 
            to='/cointypes'
            className='block border-2 usd-border-silver rounded-xl p-6 hover:shadow-lg transition-shadow usd-panel group'
          >
            <div className='flex items-center gap-4 mb-4'>
              <GiTwoCoins className='text-5xl usd-text-green group-hover:scale-110 transition-transform' />
              <div>
                <h2 className='text-2xl font-semibold usd-text-green'>Coin Types</h2>
                <p className='text-sm usd-muted'>Manage default face values</p>
              </div>
            </div>
            <p className='usd-muted text-sm'>
              View, create, edit, and delete coin types used to auto-fill face values.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Admin;
