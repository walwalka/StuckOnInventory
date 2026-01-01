import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import ComicsCard from './ComicsCard';
import CreateComics from './CreateComics';
import ShowComic from './ShowComic';
import EditComic from './EditComic';
import DeleteComic from './DeleteComic';
import { comicsTableColumns } from '../../config/comicsConfig';

const ComicsList = ({ showType }) => {
  const {
    data: comics = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['comics'],
    queryFn: async () => {
      const response = await api.get('/comics/');
      return response.data.data || [];
    },
  });

  return (
    <GenericEntityList
      entityName="comics"
      entityLabel="Comic Books Inventory"
      items={comics}
      loading={isLoading}
      onRefresh={refetch}
      showType={showType}
      tableColumns={comicsTableColumns}
      CardComponent={(props) => <ComicsCard comics={props.items} />}
      CreateComponent={CreateComics}
      ShowComponent={ShowComic}
      EditComponent={EditComic}
      DeleteComponent={DeleteComic}
    />
  );
};

export default ComicsList;
