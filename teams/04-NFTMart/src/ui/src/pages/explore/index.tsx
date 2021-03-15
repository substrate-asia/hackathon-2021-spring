import React, { useEffect, useState } from 'react';
import { Box, Center, Container } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import SideFilter from './SideFilter';
import MainList from './MainList';
import Layout from '../../layouts/common';
import store, { actions as assetsActions } from '../../stores/assets';
import { GetCollections, GetItems } from '../../api/graph';
import { useCollectionsQuery, useAssetsQuery } from '../../api/query';
import { debounce } from '../../utils';
import { useQuery } from '../../utils/hook';
import Empty from '../../components/empty';

// TODO
const STATUS_MAP: Record<any, any> = {
  all: -1,
  listing: 1,
  new: 2,
  recent: 3,
  '-1': 'all',
  '1': 'listing',
  '2': 'new',
  '3': 'recent',
};

const Explore = () => {
  const { t } = useTranslation();

  const query = useQuery();
  const history = useHistory();

  const statusQueryValue = STATUS_MAP[query.get('status') ?? 'all'];

  // const {
  //   data: collectionsResponse,
  //   // loading: collectionsLoading,
  //   // error: collectionsError,
  // } = GetCollections();

  const [selectedCollectionId, setSelectedCollectionId] = useState<number>();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const [selectedStatus, setSelectedStatus] = useState<number>(statusQueryValue);
  // const [pageNumber, setPageNumber] = useState(1);

  // const collectionsData = collectionsResponse?.collections?.collections;

  // const { data: assetsResponse, loading: itemsLoading } = GetItems({
  //   status: selectedStatus,
  //   collectionId: selectedCollectionId,
  //   categoryId: selectedCategoryId,
  // });

  const { data: assetsData, isLoading: itemsLoading } = useAssetsQuery();

  const {
    data: collectionsQueryData,
    isLoading: collectionsLoading,
    error: collectionsError,
  } = useCollectionsQuery();

  const { filteredAssets, filteredCollections } = store.useState(
    'filteredAssets',
    'filteredCollections',
  );

  // ----- Effects
  // Update status
  useEffect(() => {
    setSelectedStatus(statusQueryValue);
    return () => {
      //
    };
  }, [statusQueryValue]);

  // Update filters
  useEffect(() => {
    assetsActions.filterAssets({
      collectionId: selectedCollectionId,
      categoryId: selectedCategoryId,
      status: selectedStatus,
    });

    return () => {
      // cleanup;
    };
  }, [selectedCategoryId, selectedStatus, selectedCollectionId]);

  // Update collections when data fetched
  // useEffect(() => {
  //   if (Array.isArray(collectionsData)) {
  //     // Update store
  //     actions.setCollections(collectionsData);
  //     // Update default selectedCollectionId
  //     if (!selectedCollectionId && collectionsData.length) {
  //       setSelectedCollectionId(collectionsData[0].id);
  //     }
  //   }

  //   return () => {
  //     //
  //   };
  // }, [collectionsResponse]);

  useEffect(() => {
    if (Array.isArray(collectionsQueryData) && collectionsQueryData.length) {
      assetsActions.setCollections(collectionsQueryData);
    }

    return () => {
      // cleanup
    };
  }, [collectionsQueryData]);

  // Update assets by collectionId when data fetched
  useEffect(() => {
    // const data = assetsResponse?.assets?.assets;
    const data = assetsData;
    if (Array.isArray(data)) {
      assetsActions.setAssets(data);
    }

    return () => {
      //
    };
  }, [assetsData]);

  const handleSelectCollection = (collectionId: number) => {
    setSelectedCollectionId(collectionId);
  };

  const handleSearch = debounce((value: string) => {
    assetsActions.filterCollectionsByName(value);
  }, 233);

  const handleStatusChange = (status: number) => {
    setSelectedStatus(status);
    const statusString = STATUS_MAP[String(status)];
    history.push(`explore?status=${statusString}`);
  };

  const handleTypeChange = (type: number) => {
    setSelectedCategoryId(type);
  };

  return (
    <Layout title="title.explore">
      <Box pt="20px" pb="24px">
        <Container display="flex" minHeight="100vh">
          <SideFilter
            // FIXME: Here using a simple error handling
            data={collectionsError ? [] : filteredCollections}
            loading={collectionsLoading}
            onSearch={handleSearch}
            onSelectCollection={handleSelectCollection}
            onStatusChange={handleStatusChange}
            singleStatus
          />
          {/* TODO: sorting event */}
          {!!collectionsQueryData?.length && (
            <MainList
              data={filteredAssets}
              onTypeChange={handleTypeChange}
              loading={itemsLoading}
            />
          )}
          {!collectionsQueryData?.length && (
            <Center height="444px" flex={1}>
              <Empty description={t('list.empty')} />
            </Center>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default Explore;
