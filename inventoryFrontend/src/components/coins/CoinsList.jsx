import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericEntityList from '../shared/GenericEntityList';
import CoinsCard from './CoinsCard';
import CreateCoins from './CreateCoins';
import ShowCoin from './ShowCoin';
import EditCoin from './EditCoin';
import DeleteCoin from './DeleteCoin';
import QRCodeModal from '../shared/QRCodeModal';
import { coinsTableColumns, getCoinsCustomActions } from '../../config/coinsConfig';

const CoinsList = ({ showType }) => {
  const [estimating, setEstimating] = useState({});
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch coins using React Query
  const {
    data: coins = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['coins'],
    queryFn: async () => {
      const response = await api.get('/coins/');
      return response.data.data || [];
    },
  });

  // Handle AI estimate
  const handleGetEstimate = async (coinId) => {
    setEstimating((prev) => ({ ...prev, [coinId]: true }));
    try {
      const { data } = await api.post(`/coins/estimate/${coinId}`);
      const valNum =
        typeof data?.estimated_value === 'number' ? data.estimated_value : null;
      const val = valNum !== null ? valNum.toFixed(2) : 'N/A';
      enqueueSnackbar(`Estimated value: $${val}`, {
        variant: valNum !== null ? 'success' : 'warning',
      });
      refetch();
    } catch (err) {
      console.error('Estimate error', err);
      enqueueSnackbar('Failed to get estimate', { variant: 'error' });
    } finally {
      setEstimating((prev) => ({ ...prev, [coinId]: false }));
    }
  };

  // Handle QR code modal
  const handleQRClick = (coin) => {
    const qrCodeUrl = `${window.location.origin}/coins/details/${coin.id}`;
    setSelectedQR({
      entityType: 'coins',
      itemId: coin.id,
      qrCodeUrl,
      itemDetails: coin
    });
    setQrModalOpen(true);
  };

  const handleQRRegenerate = () => {
    enqueueSnackbar('QR code regenerated successfully', { variant: 'success' });
    setQrModalOpen(false);
    refetch();
  };

  const customActions = getCoinsCustomActions(handleGetEstimate, estimating, handleQRClick);

  return (
    <>
      <GenericEntityList
        entityName="coins"
        entityLabel="Coin Inventory"
        items={coins}
        loading={isLoading}
        onRefresh={refetch}
        showType={showType}
        tableColumns={coinsTableColumns}
        CardComponent={(props) => <CoinsCard coins={props.items} />}
        CreateComponent={CreateCoins}
        ShowComponent={ShowCoin}
        EditComponent={EditCoin}
        DeleteComponent={DeleteCoin}
        customActions={customActions}
      />

      {qrModalOpen && selectedQR && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          entityType={selectedQR.entityType}
          itemId={selectedQR.itemId}
          qrCodeUrl={selectedQR.qrCodeUrl}
          itemDetails={selectedQR.itemDetails}
          onRegenerate={handleQRRegenerate}
        />
      )}
    </>
  );
};

export default CoinsList;
