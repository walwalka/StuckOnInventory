import { useMemo, useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import Spinner from '../Spinner';
import { MdOutlineAddBox } from 'react-icons/md';
import RelicTypesTable from './RelicTypesTable';
import CreateRelicType from './CreateRelicType';
import ShowRelicType from './ShowRelicType';
import EditRelicType from './EditRelicType';
import DeleteRelicType from './DeleteRelicType';

const RelicTypesList = () => {
  const [search, setSearch] = useState('');

  const {
    data: relicTypes = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ['relicTypes'],
    queryFn: async () => {
      const response = await api.get('/relictypes');
      return response.data.data || [];
    },
  });

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return relicTypes;
    return relicTypes.filter((rt) => (rt.name || '').toLowerCase().includes(s));
  }, [relicTypes, search]);

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-semibold usd-text-green'>Relic Types</h1>
          <p className='usd-muted text-sm'>Manage the types used for relic classification.</p>
        </div>
        <Link to='/relictypes/create'>
          <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-green)' }} />
        </Link>
      </div>

      {/* Search Filter */}
      <div className='mb-4 flex items-center gap-3'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Filter by name (e.g., Arrowhead, Pottery)'
          className='border-2 border-gray-300 rounded px-4 py-2 w-full max-w-md focus:border-green-500 focus:outline-none'
        />
        <span className='text-sm usd-muted'>
          {filtered.length} of {relicTypes.length}
        </span>
      </div>

      {loading ? <Spinner /> : <RelicTypesTable relicTypes={filtered} />}

      {/* Render modals as overlays when on create/details/edit/delete routes */}
      <Routes>
        <Route path="create" element={<CreateRelicType />} />
        <Route path="details/:id" element={<ShowRelicType />} />
        <Route path="edit/:id" element={<EditRelicType />} />
        <Route path="delete/:id" element={<DeleteRelicType />} />
      </Routes>
    </div>
  );
};

export default RelicTypesList;
