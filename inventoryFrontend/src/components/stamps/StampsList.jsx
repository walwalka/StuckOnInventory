import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import StampsCard from './StampsCard';
import CreateStamps from './CreateStamps';
import ShowStamp from './ShowStamp';
import EditStamp from './EditStamp';
import DeleteStamp from './DeleteStamp';
import { stampsTableColumns } from '../../config/stampsConfig';

const StampsList = ({ showType }) => {
  const {
    data: stamps = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['stamps'],
    queryFn: async () => {
      const response = await api.get('/stamps/');
      return response.data.data || [];
    },
  });

  return (
    <GenericEntityList
      entityName="stamps"
      entityLabel="Stamps Inventory"
      items={stamps}
      loading={isLoading}
      onRefresh={refetch}
      showType={showType}
      tableColumns={stampsTableColumns}
      CardComponent={(props) => <StampsCard stamps={props.items} />}
      CreateComponent={CreateStamps}
      ShowComponent={ShowStamp}
      EditComponent={EditStamp}
      DeleteComponent={DeleteStamp}
    />
  );
};

export default StampsList;
