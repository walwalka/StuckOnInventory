import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import ComicsCard from './ComicsCard';
import CreateComics from './CreateComics';
import ShowComic from './ShowComic';
import EditComic from './EditComic';
import DeleteComic from './DeleteComic';
import QRCodeModal from '../shared/QRCodeModal';
import { comicsTableColumns, getComicsCustomActions } from '../../config/comicsConfig';

const ComicsList = ({ showType }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

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

  // Handle QR code modal
  const handleQRClick = (comic) => {
    const qrCodeUrl = `${window.location.origin}/comics/details/${comic.id}`;
    setSelectedQR({
      entityType: 'comics',
      itemId: comic.id,
      qrCodeUrl,
      itemDetails: comic
    });
    setQrModalOpen(true);
  };

  const customActions = getComicsCustomActions(handleQRClick);

  return (
    <>
      <GenericEntityList
        entityName="comics"
        entityLabel="Comic Books Inventory"
        items={comics}
        loading={isLoading}
        onRefresh={refetch}
        showType={showType}
        tableColumns={comicsTableColumns}
        customActions={customActions}
        CardComponent={(props) => <ComicsCard comics={props.items} />}
        CreateComponent={CreateComics}
        ShowComponent={ShowComic}
        EditComponent={EditComic}
        DeleteComponent={DeleteComic}
      />

      {qrModalOpen && selectedQR && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          qrData={selectedQR}
        />
      )}
    </>
  );
};

export default ComicsList;
