import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import BunnykinsCard from './BunnykinsCard';
import CreateBunnykins from './CreateBunnykins';
import ShowBunnykin from './ShowBunnykin';
import EditBunnykin from './EditBunnykin';
import DeleteBunnykin from './DeleteBunnykin';
import QRCodeModal from '../shared/QRCodeModal';
import { bunnykinsTableColumns, getBunnykinsCustomActions } from '../../config/bunnykinsConfig.jsx';

const BunnykinsList = ({ showType }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

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

  const handleQRClick = (bunnykin) => {
    const qrCodeUrl = `${window.location.origin}/bunnykins/details/${bunnykin.id}`;
    setSelectedQR({
      entityType: 'bunnykins',
      itemId: bunnykin.id,
      qrCodeUrl,
      itemDetails: bunnykin
    });
    setQrModalOpen(true);
  };

  const customActions = getBunnykinsCustomActions(handleQRClick);

  return (
    <>
      <GenericEntityList
        entityName="bunnykins"
        entityLabel="Bunnykins Inventory"
        items={bunnykins}
        loading={isLoading}
        onRefresh={refetch}
        showType={showType}
        tableColumns={bunnykinsTableColumns}
        customActions={customActions}
        CardComponent={(props) => <BunnykinsCard bunnykins={props.items} />}
        CreateComponent={CreateBunnykins}
        ShowComponent={ShowBunnykin}
        EditComponent={EditBunnykin}
        DeleteComponent={DeleteBunnykin}
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

export default BunnykinsList;
