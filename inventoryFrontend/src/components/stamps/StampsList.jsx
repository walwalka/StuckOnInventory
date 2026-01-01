import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import StampsCard from './StampsCard';
import CreateStamps from './CreateStamps';
import ShowStamp from './ShowStamp';
import EditStamp from './EditStamp';
import DeleteStamp from './DeleteStamp';
import QRCodeModal from '../shared/QRCodeModal';
import { stampsTableColumns, getStampsCustomActions } from '../../config/stampsConfig.jsx';

const StampsList = ({ showType }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

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

  const handleQRClick = (stamp) => {
    const qrCodeUrl = `${window.location.origin}/stamps/details/${stamp.id}`;
    setSelectedQR({
      entityType: 'stamps',
      itemId: stamp.id,
      qrCodeUrl,
      itemDetails: stamp
    });
    setQrModalOpen(true);
  };

  const customActions = getStampsCustomActions(handleQRClick);

  return (
    <>
      <GenericEntityList
        entityName="stamps"
        entityLabel="Stamps Inventory"
        items={stamps}
        loading={isLoading}
        onRefresh={refetch}
        showType={showType}
        tableColumns={stampsTableColumns}
        customActions={customActions}
        CardComponent={(props) => <StampsCard stamps={props.items} />}
        CreateComponent={CreateStamps}
        ShowComponent={ShowStamp}
        EditComponent={EditStamp}
        DeleteComponent={DeleteStamp}
      />

      {qrModalOpen && selectedQR && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          entityType={selectedQR.entityType}
          itemId={selectedQR.itemId}
          qrCodeUrl={selectedQR.qrCodeUrl}
          itemDetails={selectedQR.itemDetails}
        />
      )}
    </>
  );
};

export default StampsList;
