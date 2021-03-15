import React, { useEffect, useState } from 'react';
import { Box, Center, Container } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { globalStore } from 'rekv';

import SideFilter from './SideFilter';
import MainList from './MainList';
import Layout from '../../layouts/common';
import store, { actions } from '../../stores/assets';
import { useMyAssetsQuery, useMyCollectionsQuery } from '../../api/query';
import { debounce } from '../../utils';
import { useQuery } from '../../utils/hook';
import Empty from '../../components/empty';

// TODO
const STATUS_MAP: Record<any, any> = {
  all: -1,
  listing: 1,
  // new: 2,
  // recent: 3,
  '-1': 'all',
  '1': 'listing',
  // '2': 'new',
  // '3': 'recent',
};

// TODO: Error handling
const Wallet = () => {
  const { t } = useTranslation();

  const query = useQuery();

  const statusQueryValue = STATUS_MAP[query.get('status') ?? 'all'];

  const { account } = globalStore.useState('account');

  const {
    data: collectionsData,
    isLoading: collectionsLoading,
    error: collectionsError,
  } = useMyCollectionsQuery(account.address);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const [selectedStatus, setSelectedStatus] = useState<number>(statusQueryValue);

  const { data: assetsData, isLoading: itemsLoading } = useMyAssetsQuery(account.address);

  const { filteredAssets, filteredCollections } = store.useState(
    'filteredAssets',
    'filteredCollections',
  );

  // Update status
  useEffect(() => {
    setSelectedStatus(statusQueryValue);
    return () => {
      //
    };
  }, [statusQueryValue]);

  // Update collections when data fetched
  useEffect(() => {
    if (Array.isArray(collectionsData)) {
      // Update store
      actions.setCollections(collectionsData);
      // Update default selectedCollectionId
      if (!selectedCollectionId && collectionsData.length > 0) {
        setSelectedCollectionId(collectionsData[0].id);
      }
    }

    return () => {
      //
    };
  }, [collectionsData]);

  // Update assets by collectionId when data fetched
  useEffect(() => {
    const data = assetsData;
    if (Array.isArray(data)) {
      actions.setAssets(data);
    }

    return () => {
      //
    };
  }, [assetsData]);

  // Filter assets
  useEffect(() => {
    actions.filterAssets({
      categoryId: selectedCategoryId,
      collectionId: selectedCollectionId,
      status: selectedStatus,
    });
    return () => {
      // cleanup
    };
  }, [selectedCategoryId, selectedCollectionId, selectedStatus]);

  const handleSelectCollection = (collectionId: number) => {
    setSelectedCollectionId(collectionId);
  };

  const handleSearch = debounce((value: string) => {
    actions.filterCollectionsByName(value);
  }, 233);

  const handleStatusChange = (status: number) => {
    setSelectedStatus(status);
    // const statusString = STATUS_MAP[String(status)];
    // history.push(`explore?status=${statusString}`);
  };

  const handleTypeChange = (type: number) => {
    setSelectedCategoryId(type);
  };

  return (
    <Layout title="title.wallet">
      <Box pt="20px" pb="24px">
        <Container display="flex" minHeight="100vh">
          <SideFilter
            // FIXME: Here using a simple error handling
            data={collectionsError ? [] : filteredCollections}
            header={t('wallet.title')}
            loading={collectionsLoading}
            onSearch={handleSearch}
            onSelectCollection={handleSelectCollection}
            onStatusChange={handleStatusChange}
            singleStatus
          />
          {/* TODO: sorting event */}
          {!!collectionsData?.length && (
            <MainList
              data={filteredAssets}
              onTypeChange={handleTypeChange}
              loading={itemsLoading}
            />
          )}
          {!collectionsData?.length && (
            <Center height="444px" flex={1}>
              <Empty description={t('list.empty')} />
            </Center>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default Wallet;
