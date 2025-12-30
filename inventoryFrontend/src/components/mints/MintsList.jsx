import { Routes, Route } from 'react-router-dom';
import Mints from '../coins/Mints';
import CreateMint from '../coins/CreateMints';
import ShowMint from '../coins/ShowMint';
import EditMint from '../coins/EditMint';
import DeleteMint from '../coins/DeleteMint';

export default function MintsList({ showType, onShowTypeChange }) {
  return (
    <>
      <Mints showType={showType} onShowTypeChange={onShowTypeChange} />
      <Routes>
        <Route path="create" element={<CreateMint />} />
        <Route path="details/:id" element={<ShowMint />} />
        <Route path="edit/:id" element={<EditMint />} />
        <Route path="delete/:id" element={<DeleteMint />} />
      </Routes>
    </>
  );
}
