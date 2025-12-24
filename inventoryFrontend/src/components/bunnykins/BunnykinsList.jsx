import { useEffect, useState } from 'react';
import api from '../../api/client';
import Spinner from '../Spinner';
import { Link, Routes, Route } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import BunnykinsTable from './BunnykinsTable';
import BunnykinsCard from './BunnykinsCard';
import ShowBunnykin from './ShowBunnykin';
import EditBunnykin from './EditBunnykin';
import DeleteBunnykin from './DeleteBunnykin';

const BunnykinsList = ({ showType }) => {
  const [bunnykins, setBunnykins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/bunnykins/')
      .then((response) => {
        setBunnykins(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl my-8'>Bunnykins Inventory</h1>
        <div className='flex gap-x-4 justify-end'>
          <Link to='/bunnykins/create'>
            <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-copper)' }} />
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <BunnykinsTable bunnykins={bunnykins} />
      ) : (
        <BunnykinsCard bunnykins={bunnykins} />
      )}

      {/* Render modals as overlays when on details/edit/delete routes */}
      <Routes>
        <Route path="details/:id" element={<ShowBunnykin />} />
        <Route path="edit/:id" element={<EditBunnykin />} />
        <Route path="delete/:id" element={<DeleteBunnykin />} />
      </Routes>
    </div>
  );
};

export default BunnykinsList;
