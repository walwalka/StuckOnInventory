import React from 'react';
import { Link } from 'react-router-dom';
import { FaCoins } from 'react-icons/fa';
import { RiAdminLine } from 'react-icons/ri';
import { GiArrowhead, GiStamper, GiRabbit } from 'react-icons/gi';

// Reusable card component for consistent styling
const HubCard = ({ to, icon: Icon, title, description }) => (
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

const Home = () => {
  return (
    <div className="flex justify-center p-4">
      <div className="max-w-full">
        <h1 className='text-3xl my-8'>Inventory Hub</h1>
        <p className='usd-muted mb-6'>Manage your collectibles inventory.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-start items-stretch gap-6 mt-10">
          <HubCard
            to="/coins"
            icon={FaCoins}
            title="Coin List"
            description="View, create, edit, and manage your coins."
          />
          <HubCard
            to="/relics"
            icon={GiArrowhead}
            title="Indian Relics"
            description="View, create, edit, and manage your indian relics."
          />
          <HubCard
            to="/stamps"
            icon={GiStamper}
            title="Stamps"
            description="View, create, edit, and manage your stamps."
          />
          <HubCard
            to="/bunnykins"
            icon={GiRabbit}
            title="Bunnykins"
            description="View, create, edit, and manage your bunnykins."
          />
          <HubCard
            to="/admin"
            icon={RiAdminLine}
            title="Admin Panel"
            description="View, create, edit, and manage your admin settings."
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
