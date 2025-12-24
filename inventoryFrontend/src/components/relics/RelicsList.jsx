import { useEffect, useState } from 'react';
import api from '../../api/client';
import Spinner from '../Spinner';
import { Link, Routes, Route } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import RelicsTable from './RelicsTable';
import RelicsCard from './RelicsCard';
import ShowRelic from './ShowRelic';
import EditRelic from './EditRelic';
import DeleteRelic from './DeleteRelic';

const RelicsList = ({ showType }) => {
  const [relics, setRelics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/relics/')
      .then((response) => {
        setRelics(response.data.data);
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
        <h1 className='text-3xl my-8'>Native American Relics Inventory</h1>
        <div className='flex gap-x-4 justify-end'>
          <Link to='/relics/create'>
            <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-copper)' }} />
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <RelicsTable relics={relics} />
      ) : (
        <RelicsCard relics={relics} />
      )}

      {/* Render modals as overlays when on details/edit/delete routes */}
      <Routes>
        <Route path="details/:id" element={<ShowRelic />} />
        <Route path="edit/:id" element={<EditRelic />} />
        <Route path="delete/:id" element={<DeleteRelic />} />
      </Routes>
    </div>
  );
};

export default RelicsList;
