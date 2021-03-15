import React, { FC, useEffect, useState } from 'react';
import { Box, Center, OrderedList, Spinner, useToast } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { globalStore } from 'rekv';

import store, { actions } from '../../stores/assets';
import cateStore from '../../stores/categories';

import Alert from './Alert';

import HistoryEventCard from './HisotryEventCard';
import PriceHistoryCard from './PriceHistoryCard';

import PurchaseCard from './PurchaseCard';
import DetailContainer from './DetailContainer';
import ImageCard from './ImageCard';
import IntroCard from './IntroCard';
import MetaCard from './MetaCard';
import ClassInfo from './AboutCard';

import PurchaseModal from './PurchaseModal';
import SalesSettingModal from './SalesSettingModal';

import { GetCollections, GetItems } from '../../api/graph';
import { getNft, getOrder, deleteOrder, takeOrder } from '../../api/polka';
import { toFixedDecimals } from '../../utils';
import { IPFS_GET_SERVER } from '../../constants';

const Detail: FC = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const params = useParams<{ classId: string; tokenId: string }>();
  const { classId, tokenId } = params;
  const { account } = globalStore.useState('account');

  const { categories } = cateStore.useState('categories');
  // const { data: assetsResponse } = GetItems({ id: Number(params?.token) ?? -1, pageSize: 1 });

  const [cancelLoading, setCancelLoading] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [settingOpen, setSettingOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  const { selectedAsset } = store.useState('selectedAsset');

  // const { data: collectionsResponse } = GetCollections({
  //   id: selectedAsset?.classId,
  //   pageSize: 1,
  // });

  // useEffect(() => {
  //   const assets = assetsResponse?.assets?.assets ?? [];
  //   if (!selectedAsset && assets[0]) {
  //     actions.selectAsset(assets[0]);
  //   }

  //   return () => {
  //     //
  //   };
  // }, [assetsResponse]);

  // useEffect(() => {
  //   const collections = collectionsResponse?.collections?.collections ?? [];
  //   if (!categoryName && collections[0]) {
  //     setCategoryName(collections[0].name);
  //   }
  // }, [collectionsResponse]);
  const fetchData = async (cid = '', tid = '') => {
    if (+cid < 0 || +tid < 0) return;
    const res = await getNft(cid, tid);
    if (!res) {
      return;
    }
    const order = await getOrder(cid, tid, res.owner);
    res.order = order;
    actions.selectAsset(res);
  };

  useEffect(() => {
    fetchData(classId, tokenId);
    return () => {
      actions.selectAsset(null);
    };
  }, [classId, tokenId]);

  if (!selectedAsset) {
    return (
      <Box height="100vh" width="100vw">
        <Center height="100%">
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </Center>
      </Box>
    );
  }

  // Events
  const handlePurchaseClose = () => {
    setPurchaseOpen(false);
  };

  const handleCancelOrder = () => {
    setCancelLoading(true);
    const delParams = {
      address: account.address,
      ownerAddress: selectedAsset.owner,
      classId,
      tokenId,
      cb: {
        success: () => {
          toast({
            title: 'success',
            status: 'success',
            position: 'top',
            duration: 3000,
            description: t('detail.cancel.success'),
          });
          fetchData(classId, tokenId);
          setCancelLoading(false);
        },
        error: (error: string) => {
          toast({
            title: 'success',
            status: 'error',
            position: 'top',
            duration: 3000,
            description: error,
          });
          setCancelLoading(false);
        },
      },
    };
    deleteOrder(delParams);
  };

  const handlePurchaseConfirm = (setLoading: any) => {
    setLoading(true);
    const price = selectedAsset.order.price.split(' ');
    const purchaseParams = {
      address: account.address,
      ownerAddress: selectedAsset.owner,
      classId,
      tokenId,
      price: price[0],
      cb: {
        success: () => {
          toast({
            title: 'success',
            status: 'success',
            position: 'top',
            duration: 3000,
            description: t('detail.purchase.success'),
          });
          fetchData(classId, tokenId);
          setLoading(false);
          setPurchaseOpen(false);
        },
        error: (error: string) => {
          toast({
            title: 'success',
            status: 'error',
            position: 'top',
            duration: 3000,
            description: error,
          });
          setLoading(false);
        },
      },
    };
    takeOrder(purchaseParams);
  };

  const handleSettingClose = () => {
    setSettingOpen(false);
  };

  const handleSettingConfirm = (success: boolean) => {
    // refetch data
    if (success) {
      fetchData(classId, tokenId);
    }
  };

  const handleDestroy = () => {
    //
  };
  let price = '';
  if (selectedAsset.order) {
    price =
      typeof selectedAsset.order.price === 'number'
        ? toFixedDecimals(selectedAsset.order.price, 8)
        : selectedAsset.order.price ?? '';
  }

  return (
    <Box marginTop="77px">
      <Helmet title={t('title.detail', { name: selectedAsset.name })} />
      {selectedAsset.order && (
        <Alert
          order={selectedAsset.order}
          categories={categories}
          // onDestroy={handleDestroy}
          onSetting={() => setSettingOpen(true)}
        />
      )}

      <DetailContainer
        left={
          <>
            {selectedAsset.metadata && selectedAsset.metadata.url && (
              <ImageCard
                src={`${IPFS_GET_SERVER}${selectedAsset.metadata.url}` ?? 'image placeholder'}
              />
            )}
            {selectedAsset.metadata && (
              <IntroCard
                description={selectedAsset.metadata.description ?? t('detail.no-description')}
              />
            )}
            <MetaCard metadata={selectedAsset.metadata ?? {}} />
            {selectedAsset.class && selectedAsset.class.metadata && (
              <ClassInfo about={selectedAsset.class ?? t('detail.no-about')} />
            )}
          </>
        }
        right={
          <>
            <PurchaseCard
              category={categoryName}
              name={selectedAsset.metadata.name}
              price={price}
              onPurchase={() => setPurchaseOpen(true)}
              order={selectedAsset.order}
              asset={selectedAsset}
              onSetting={() => setSettingOpen(true)}
              onCancel={handleCancelOrder}
              cancelLoading={cancelLoading}
              isOwner={selectedAsset.owner === account.address}
            />
            {/* <IntroCard description={selectedAsset.description ?? t('detail.no-description')} /> */}
            {/* <MetaCard metadata={selectedAsset.metadata ?? t('detail.no-metadata')} />
            <ClassInfo about={selectedAsset.class ?? t('detail.no-about')} /> */}
            <PriceHistoryCard />
            <HistoryEventCard />
          </>
        }
      />

      <PurchaseModal
        item={selectedAsset}
        count={1}
        category={categoryName}
        open={purchaseOpen}
        onClose={handlePurchaseClose}
        onConfirm={handlePurchaseConfirm}
      />

      <SalesSettingModal
        open={settingOpen}
        onClose={handleSettingClose}
        onAfterConfirm={handleSettingConfirm}
        categories={categories}
        classId={classId}
        tokenId={tokenId}
      />
    </Box>
  );
};

export default Detail;
