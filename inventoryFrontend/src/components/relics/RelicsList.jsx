import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import RelicsCard from './RelicsCard';
import CreateRelics from './CreateRelics';
import ShowRelic from './ShowRelic';
import EditRelic from './EditRelic';
import DeleteRelic from './DeleteRelic';
import { relicsTableColumns } from '../../config/relicsConfig';

const RelicsList = ({ showType }) => {
  const {
    data: relics = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['relics'],
    queryFn: async () => {
      const response = await api.get('/relics/');
      return response.data.data || [];
    },
  });

  return (
    <GenericEntityList
      entityName="relics"
      entityLabel="Native American Relics Inventory"
      items={relics}
      loading={isLoading}
      onRefresh={refetch}
      showType={showType}
      tableColumns={relicsTableColumns}
      CardComponent={(props) => <RelicsCard relics={props.items} />}
      CreateComponent={CreateRelics}
      ShowComponent={ShowRelic}
      EditComponent={EditRelic}
      DeleteComponent={DeleteRelic}
    />
  );
};

export default RelicsList;
