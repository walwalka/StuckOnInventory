import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import Spinner from '../Spinner';
import GenericTable from './GenericTable';

/**
 * GenericEntityList - Reusable list component for all entity types
 *
 * @param {string} entityName - Entity name (e.g., 'coins', 'stamps')
 * @param {string} entityLabel - Display label (e.g., 'Coin Inventory')
 * @param {Array} items - Items to display
 * @param {boolean} loading - Loading state
 * @param {Function} onRefresh - Refresh callback
 * @param {string} showType - Display type ('table' or 'card')
 * @param {Array} tableColumns - Column configuration for table view
 * @param {Component} CardComponent - Card component for card view
 * @param {Component} CreateComponent - Create modal component
 * @param {Component} ShowComponent - Show/Details modal component
 * @param {Component} EditComponent - Edit modal component
 * @param {Component} DeleteComponent - Delete modal component
 * @param {Array} customActions - Optional custom action buttons for table
 */
const GenericEntityList = ({
  entityName,
  entityLabel,
  items = [],
  loading = false,
  onRefresh,
  showType = 'table',
  tableColumns = [],
  CardComponent = null,
  CreateComponent = null,
  ShowComponent = null,
  EditComponent = null,
  DeleteComponent = null,
  customActions = [],
}) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl my-8">{entityLabel}</h1>
        <div className="flex gap-x-4 justify-end">
          <Link to={`/${entityName}/create`}>
            <MdOutlineAddBox
              className="text-4xl"
              style={{ color: 'var(--usd-copper)' }}
            />
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <GenericTable
          items={items}
          columns={tableColumns}
          entityName={entityName}
          customActions={customActions}
          onRefresh={onRefresh}
        />
      ) : CardComponent ? (
        <CardComponent items={items} />
      ) : (
        <div className="text-center text-gray-500 dark:text-stone-400 py-8">
          Card view not implemented
        </div>
      )}

      {/* Render modals as overlays when on create/details/edit/delete routes */}
      <Routes>
        {CreateComponent && <Route path="create" element={<CreateComponent />} />}
        {ShowComponent && (
          <Route path="details/:id" element={<ShowComponent />} />
        )}
        {EditComponent && <Route path="edit/:id" element={<EditComponent />} />}
        {DeleteComponent && (
          <Route path="delete/:id" element={<DeleteComponent />} />
        )}
      </Routes>
    </div>
  );
};

export default GenericEntityList;
