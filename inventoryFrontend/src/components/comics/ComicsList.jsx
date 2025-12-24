import { useEffect, useState } from 'react';
import api from '../../api/client';
import Spinner from '../Spinner';
import { Link, Routes, Route } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import ComicsTable from './ComicsTable';
import ComicsCard from './ComicsCard';
import ShowComic from './ShowComic';
import EditComic from './EditComic';
import DeleteComic from './DeleteComic';

const ComicsList = ({ showType }) => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/comics/')
      .then((response) => {
        setComics(response.data.data);
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
        <h1 className='text-3xl my-8'>Comic Books Inventory</h1>
        <div className='flex gap-x-4 justify-end'>
          <Link to='/comics/create'>
            <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-copper)' }} />
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <ComicsTable comics={comics} />
      ) : (
        <ComicsCard comics={comics} />
      )}

      {/* Render modals as overlays when on details/edit/delete routes */}
      <Routes>
        <Route path="details/:id" element={<ShowComic />} />
        <Route path="edit/:id" element={<EditComic />} />
        <Route path="delete/:id" element={<DeleteComic />} />
      </Routes>
    </div>
  );
};

export default ComicsList;
