import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import RelicsCard from './RelicsCard';
import CreateRelics from './CreateRelics';
import ShowRelic from './ShowRelic';
import EditRelic from './EditRelic';
import DeleteRelic from './DeleteRelic';
import QRCodeModal from '../shared/QRCodeModal';
import { relicsTableColumns, getRelicsCustomActions } from '../../config/relicsConfig.jsx';

const RelicsList = ({ showType }) => {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);

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

  const handleQRClick = (relic) => {
    const qrCodeUrl = `${window.location.origin}/relics/details/${relic.id}`;
    setSelectedQR({
      entityType: 'relics',
      itemId: relic.id,
      qrCodeUrl,
      itemDetails: relic
    });
    setQrModalOpen(true);
  };

  const customActions = getRelicsCustomActions(handleQRClick);

  return (
    <>
      <GenericEntityList
        entityName="relics"
        entityLabel="Native American Relics Inventory"
        items={relics}
        loading={isLoading}
        onRefresh={refetch}
        showType={showType}
        tableColumns={relicsTableColumns}
        customActions={customActions}
        CardComponent={(props) => <RelicsCard relics={props.items} />}
        CreateComponent={CreateRelics}
        ShowComponent={ShowRelic}
        EditComponent={EditRelic}
        DeleteComponent={DeleteRelic}
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

export default RelicsList;
