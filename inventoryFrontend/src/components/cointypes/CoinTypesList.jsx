import { useEffect, useMemo, useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import api from '../../api/client';
import Spinner from '../Spinner';
import { MdOutlineAddBox } from 'react-icons/md';
import CoinTypesTable from './CoinTypesTable';
import ShowCoinType from './ShowCoinType';
import EditCoinType from './EditCoinType';
import DeleteCoinType from './DeleteCoinType';

const CoinTypesList = () => {
  const [coinTypes, setCoinTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [minFace, setMinFace] = useState('');
  const [maxFace, setMaxFace] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'face_value'
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  useEffect(() => {
    setLoading(true);
    api
      .get('/cointypes')
      .then((response) => {
        setCoinTypes(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    let base = coinTypes;
    if (s) {
      base = base.filter((ct) => (ct.name || '').toLowerCase().includes(s));
    }

    const min = minFace === '' ? null : parseFloat(minFace);
    const max = maxFace === '' ? null : parseFloat(maxFace);

    if (min !== null && !Number.isNaN(min)) {
      base = base.filter((ct) => Number(ct.face_value) >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      base = base.filter((ct) => Number(ct.face_value) <= max);
    }

    return base;
  }, [coinTypes, search, minFace, maxFace]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av, bv;
      if (sortBy === 'face_value') {
        av = Number(a.face_value);
        bv = Number(b.face_value);
      } else {
        av = (a.name || '').toLowerCase();
        bv = (b.name || '').toLowerCase();
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-3xl font-semibold usd-text-green'>Coin Types</h1>
          <p className='usd-muted text-sm'>Manage the default face values for each coin type.</p>
        </div>
        <Link to='/cointypes/create'>
          <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-green)' }} />
        </Link>
      </div>

      {/* Search Filter */}
      <div className='mb-4 flex items-center gap-3'>
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Filter by name (e.g., Quarter, Gold Eagle)'
          className='border-2 border-gray-300 rounded px-4 py-2 w-full max-w-md focus:border-green-500 focus:outline-none'
        />
        <span className='text-sm usd-muted'>
          {sorted.length} of {coinTypes.length}
        </span>
      </div>

      {/* Amount Filters and Sort Controls */}
      <div className='mb-4 flex flex-wrap items-center gap-3'>
        <div className='flex items-center gap-2'>
          <label className='text-sm usd-muted'>Min face value</label>
          <input
            type='number'
            step='0.01'
            value={minFace}
            onChange={(e) => setMinFace(e.target.value)}
            className='border-2 border-gray-300 rounded px-3 py-1 w-28 focus:border-green-500 focus:outline-none'
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-sm usd-muted'>Max face value</label>
          <input
            type='number'
            step='0.01'
            value={maxFace}
            onChange={(e) => setMaxFace(e.target.value)}
            className='border-2 border-gray-300 rounded px-3 py-1 w-28 focus:border-green-500 focus:outline-none'
          />
        </div>
        <div className='flex items-center gap-2'>
          <label className='text-sm usd-muted'>Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className='border-2 border-gray-300 rounded px-3 py-1 focus:border-green-500 focus:outline-none'
          >
            <option value='name'>Name</option>
            <option value='face_value'>Face Value</option>
          </select>
          <button
            type='button'
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className='px-3 py-1 rounded usd-btn-green hover:opacity-90'
            title='Toggle sort direction'
          >
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>
      </div>

      {loading ? <Spinner /> : <CoinTypesTable coinTypes={sorted} />}

      {/* Render modals as overlays when on details/edit/delete routes */}
      <Routes>
        <Route path="details/:id" element={<ShowCoinType />} />
        <Route path="edit/:id" element={<EditCoinType />} />
        <Route path="delete/:id" element={<DeleteCoinType />} />
      </Routes>
    </div>
  );
};

export default CoinTypesList;
