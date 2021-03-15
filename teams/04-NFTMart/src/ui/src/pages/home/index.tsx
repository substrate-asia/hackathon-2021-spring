import React, { useEffect, useState } from 'react';
import { groupBy } from 'ramda';
import { Container, Button, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { globalStore } from 'rekv';
import store, { actions } from '../../stores/assets';
import CommLayout from '../../layouts/common';
import TypeFilter from './TypeFilter';
import Works from './Works';
import { Order, Work } from '../../types';
import {
  createClass,
  getClassById,
  mintNft,
  getCategories,
  getAllNfts,
  getAllOrders,
  createOrder,
  takeOrder,
  updateOrderPrice,
  deleteOrder,
  queryClassByAddress,
  queryNftByAddress,
} from '../../api/polka';
import { useAssetsQuery } from '../../api/query';

type ListMap = Record<string, Work[]>;

const STATUS_MAP: Record<number, string> = {
  1: 'listing',
  2: 'new',
  // 3: 'recent',
};

const groupByStatus = groupBy<Work>(({ status }) => STATUS_MAP[status]);
// const groupByStatus = (orders, assets) => {
//   const listMap = new Map();

// }

const Page = () => {
  const { data: assetsData, isLoading, error, refetch } = useAssetsQuery();
  // FIXME: Add type instead of any
  const ordersQuery = useQuery<Order[]>('getOrders', getAllOrders as any);

  const { t } = useTranslation();

  const { filteredAssets } = store.useState('assets', 'filteredAssets');
  const { account } = globalStore.useState('account');

  const [workListMap, setWorkListMap] = useState<ListMap>(groupByStatus(filteredAssets));
  // TODO: sticky animation
  const [stickyFilter] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(-1);

  const listOrder = () => {
    const order = {
      address: account.address,
      price: 20,
      categoryId: 0,
      classId: 17,
      tokenId: 0,
    };
    createOrder(order);
  };
  const takerOrder = () => {
    const order = {
      address: account.address,
      classId: 17,
      tokenId: 0,
      ownerAddress: '611LQeE32RZvaY6m2oG8US5R4dRsTzxRnn43vqjtoUwzHqtC',
      price: 20,
    };
    takeOrder(order);
  };
  const updateOrder = () => {
    const order = {
      address: account.address,
      price: 50,
      classId: 17,
      tokenId: 0,
      ownerAddress: '611LQeE32RZvaY6m2oG8US5R4dRsTzxRnn43vqjtoUwzHqtC',
    };
    updateOrderPrice(order);
  };

  const delOrder = () => {
    const order = {
      address: account.address,
      classId: 17,
      tokenId: 0,
      ownerAddress: '611LQeE32RZvaY6m2oG8US5R4dRsTzxRnn43vqjtoUwzHqtC',
    };
    deleteOrder(order);
  };

  const create = () => {
    const metadata = {
      name: 'nft class',
      description: 'this is my second nft class',
      url: 'http://www.baidu.com',
      externalUrl: '123',
      bannerUrl: '123',
    };
    createClass({ address: account.address, metadata });
  };

  const mint = () => {
    const metadata = {
      name: 'nft',
      description: 'this is my second nft class',
      url: 'http://www.baidu.com',
      externalUrl: '123',
      bannerUrl: '123',
    };
    mintNft({ address: account.address, metadata, classId: 17 });
  };

  // Update filters when mount
  useEffect(() => {
    refetch();
    actions.setFilters({ categoryId: -1, collectionId: -1, status: -1 });
  }, []);

  // Update assets store after query
  useEffect(() => {
    const orders = ordersQuery.data;
    let assets = assetsData?.slice();

    if (Array.isArray(orders) && Array.isArray(assets)) {
      assets = assets.map((asset) => {
        const givenOrder = orders.find(
          (order) => order.classId === asset.classId && order.tokenId === asset.tokenId,
        );
        if (givenOrder) {
          return {
            ...asset,
            status: 1,
            price: givenOrder.price,
            categoryId: Number(givenOrder.categoryId),
          };
        }
        return { ...asset, status: 2, price: undefined, categoryId: -1 };
      });
    }

    actions.setAssets(assets ?? []);
    return () => {
      //
    };
  }, [ordersQuery.data, assetsData]);

  // Update worklist after filteredAssets change
  useEffect(() => {
    setWorkListMap(groupByStatus(filteredAssets));
    return () => {
      // cleanup
    };
  }, [filteredAssets]);

  useEffect(() => {
    actions.filterAssets({
      categoryId: selectedCategoryId,
    });
    return () => {
      // cleanup
    };
  }, [selectedCategoryId]);

  // Update sticky header UI
  // useEffect(() => {
  //   const listenter = () => {
  //     if (window.pageYOffset > 80 && !stickyFilter) {
  //       setStickyFilter(true);
  //       return;
  //     }

  //     setStickyFilter(false);
  //   };

  //   window.addEventListener('scroll', listenter);
  //   return () => {
  //     window.removeEventListener('scroll', listenter);
  //   };
  // }, []);

  // Events
  const handleFilter = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
  };

  // Component
  const errorBox = (
    <Container height={300}>
      <Center flexDirection="column" height="100%">
        Error on fetching data
        {/* <Text color={colors.text.gray}>{error?.message}</Text> */}
        <Button variant="primary" onClick={() => refetch()}>
          {t('network.retry')}
        </Button>
      </Center>
    </Container>
  );

  return (
    <CommLayout title="title.home">
      <TypeFilter onFilter={handleFilter} sticky={stickyFilter} />
      {error ? errorBox : <Works loading={isLoading} data={workListMap} />}
      {/* <button onClick={() => create()}>create</button>|
      <button onClick={() => getClassById(8)}>get</button>|
      <button onClick={() => mint()}>mint</button>
      <br />
      <button onClick={() => getCategories()}>getCate</button>|
      <button onClick={() => getAllNfts()}>getAllNFTs</button>|
      <button onClick={() => getAllOrders()}>getAllOrders</button>|
      <br />
      <button onClick={() => listOrder()}>createOrder</button>|
      <button onClick={() => takerOrder()}>takeOrder</button>|
      <button onClick={() => updateOrder()}>updateOrderPrice</button>|
      <button onClick={() => delOrder()}>deleteOrder</button>|
      <br />
      <button onClick={() => queryClassByAddress({ address: 'account.address' })}>
        queryClassByAddress
      </button>
      |
      <button onClick={() => queryNftByAddress({ address: account.address })}>
        queryNftByAddress
      </button> */}
    </CommLayout>
  );
};

export default Page;
