import { useMemo, useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import Spinner from '../Spinner';
import { MdOutlineAddBox } from 'react-icons/md';
import ComicPublishersTable from './ComicPublishersTable';
import CreateComicPublisher from './CreateComicPublisher';
import ShowComicPublisher from './ShowComicPublisher';
import EditComicPublisher from './EditComicPublisher';
import DeleteComicPublisher from './DeleteComicPublisher';

const ComicPublishersList = () => {
  const [search, setSearch] = useState('');

  const {
    data: publishers = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ['comicPublishers'],
    queryFn: async () => {
      const response = await api.get('/comicpublishers');
      return response.data.data || [];
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return publishers;
    return publishers.filter((p) => (p.name || '').toLowerCase().includes(s));
  }, [publishers, search]);

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-semibold usd-text-green'>Comic Publishers</h1>
          <p className='usd-muted text-sm'>Manage the publishers used for comic book classification.</p>
        </div>
        <Link to='/comicpublishers/create'>
          <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-green)' }} />
        </Link>
      </div>

      {/* Search Filter */}
      <div className='mb-4 flex items-center gap-3'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Filter by name (e.g., Marvel, DC Comics)'
          className='border-2 border-gray-300 rounded px-4 py-2 w-full max-w-md focus:border-green-500 focus:outline-none'
        />
        <span className='text-sm usd-muted'>
          {filtered.length} of {publishers.length}
        </span>
      </div>

      {loading ? <Spinner /> : <ComicPublishersTable publishers={filtered} />}

      {/* Render modals as overlays when on create/details/edit/delete routes */}
      <Routes>
        <Route path="create" element={<CreateComicPublisher />} />
        <Route path="details/:id" element={<ShowComicPublisher />} />
        <Route path="edit/:id" element={<EditComicPublisher />} />
        <Route path="delete/:id" element={<DeleteComicPublisher />} />
      </Routes>
    </div>
  );
};

export default ComicPublishersList;
