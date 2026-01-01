import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import BunnykinsCard from './BunnykinsCard';
import CreateBunnykins from './CreateBunnykins';
import ShowBunnykin from './ShowBunnykin';
import EditBunnykin from './EditBunnykin';
import DeleteBunnykin from './DeleteBunnykin';
import { bunnykinsTableColumns } from '../../config/bunnykinsConfig';

const BunnykinsList = ({ showType }) => {
  const {
    data: bunnykins = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['bunnykins'],
    queryFn: async () => {
      const response = await api.get('/bunnykins/');
      return response.data.data || [];
    },
  });

  return (
    <GenericEntityList
      entityName="bunnykins"
      entityLabel="Bunnykins Inventory"
      items={bunnykins}
      loading={isLoading}
      onRefresh={refetch}
      showType={showType}
      tableColumns={bunnykinsTableColumns}
      CardComponent={(props) => <BunnykinsCard bunnykins={props.items} />}
      CreateComponent={CreateBunnykins}
      ShowComponent={ShowBunnykin}
      EditComponent={EditBunnykin}
      DeleteComponent={DeleteBunnykin}
    />
  );
};

export default BunnykinsList;
