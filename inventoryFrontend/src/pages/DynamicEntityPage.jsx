import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import GenericEntityList from '../components/shared/GenericEntityList';
import DynamicCreate from '../components/DynamicEntity/DynamicCreate';
import DynamicShow from '../components/DynamicEntity/DynamicShow';
import DynamicEdit from '../components/DynamicEntity/DynamicEdit';
import DynamicDelete from '../components/DynamicEntity/DynamicDelete';
import TablePermissionsModal from '../components/shared/TablePermissionsModal';
import { useTableConfig } from '../hooks/useTableConfig';
import Spinner from '../components/Spinner';
import { MdShare } from 'react-icons/md';
import { getUserId } from '../auth/token';

const DynamicEntityPage = ({ showType, onShowTypeChange }) => {
  const { tableName } = useParams();
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const currentUserId = getUserId();
  const { data: config, isLoading: configLoading, error: configError } = useTableConfig(tableName);

  const {
    data: items = [],
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: ['entities', tableName],
    queryFn: async () => {
      const response = await api.get(`/entities/${tableName}`);
      return response.data.data || [];
    },
    enabled: !!tableName
  });

  if (configLoading) {
    return (
      <div className="p-4">
        <Spinner />
      </div>
    );
  }

  if (configError) {
    return (
      <div className="p-4">
        <div className="usd-panel p-6 text-center">
          <h2 className="text-2xl mb-4">Table Not Found</h2>
          <p className="usd-muted">
            The table "{tableName}" could not be loaded. It may not exist or you may not have permission to access it.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="usd-panel p-6 text-center">
          <h2 className="text-2xl mb-4">Error Loading Data</h2>
          <p className="usd-muted">
            {error.message || 'An error occurred while loading the data.'}
          </p>
        </div>
      </div>
    );
  }

  // Check if current user is the table owner
  const isOwner = config.table.created_by === currentUserId;

  // Create permissions button for header
  const permissionsButton = isOwner ? (
    <button
      onClick={() => setPermissionsModalOpen(true)}
      className="usd-btn-copper px-4 py-2 rounded flex items-center gap-2"
      title="Manage Access"
    >
      <MdShare className="text-xl" />
      Manage Access
    </button>
  ) : null;

  return (
    <>
      <GenericEntityList
        entityName={tableName}
        entityLabel={config.table.display_name}
        items={items}
        loading={isLoading}
        onRefresh={refetch}
        showType={showType}
        tableColumns={config.tableColumns}
        headerActions={permissionsButton}
        CreateComponent={() => <DynamicCreate tableName={tableName} config={config} onRefresh={refetch} />}
        ShowComponent={() => <DynamicShow tableName={tableName} config={config} />}
        EditComponent={() => <DynamicEdit tableName={tableName} config={config} onRefresh={refetch} />}
        DeleteComponent={() => <DynamicDelete tableName={tableName} onRefresh={refetch} />}
      />

      {/* Permissions Modal */}
      {isOwner && (
        <TablePermissionsModal
          isOpen={permissionsModalOpen}
          onClose={() => setPermissionsModalOpen(false)}
          tableName={tableName}
          tableDisplayName={config.table.display_name}
        />
      )}
    </>
  );
};

export default DynamicEntityPage;
