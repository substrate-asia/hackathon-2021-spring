import { useQuery } from 'react-query';
import { Order, Work, Collection } from '../../types';
import {
  getAllNfts,
  getAllOrders,
  getClasses,
  queryClassByAddress,
  queryNftByAddress,
} from '../polka';

export * from './queryClient';

const ASSETS_QUERY = 'getAssets';
const COLLECTIONS_QUERY = 'getCollections';
const MY_COLLECTIONS_QUERY = 'getMyCollections';
const MY_ASSETS_QUERY = 'getMyAssets';

export const useAssetsQuery = () => {
  // ----- helpers
  const updateAssetByOrder = (asset: Work, orders: Order[]) => {
    const givenOrder = orders.find(
      (order) => order.classId === asset.classId && order.tokenId === asset.tokenId,
    );

    if (givenOrder) {
      const categoryId = givenOrder.categoryId ? Number(givenOrder.categoryId) : 3;
      return {
        ...asset,
        status: 1,
        price: givenOrder.price,
        categoryId,
      };
    }
    return { ...asset, status: 2, price: undefined, categoryId: -1 };
  };

  const queryAssetsAndMap = async () => {
    const assets = await getAllNfts();
    const orders = (await getAllOrders()) as Order[];

    if (Array.isArray(orders) && Array.isArray(assets)) {
      const newAssets = assets.map((asset) => updateAssetByOrder(asset, orders));
      return newAssets;
    }
    return assets;
  };

  // use query
  const { data: assetsData, isLoading, error, refetch } = useQuery<Work[]>(
    ASSETS_QUERY,
    queryAssetsAndMap,
    {
      staleTime: Infinity,
    },
  );

  return { data: assetsData, isLoading, error, refetch };
};

export const useCollectionsQuery = () => {
  const { data, isLoading, error } = useQuery<Collection[]>(COLLECTIONS_QUERY, getClasses, {
    staleTime: Infinity,
  });

  return { data, isLoading, error };
};

export const useMyCollectionsQuery = (address: string) => {
  const queryClassesAndMap = async () => {
    const classes = await queryClassByAddress({ address });
    return classes;
  };

  const { data, isLoading, error } = useQuery<Collection[]>(
    MY_COLLECTIONS_QUERY,
    queryClassesAndMap as any,
    {
      staleTime: Infinity,
    },
  );

  return { data, isLoading, error };
};

export const useMyAssetsQuery = (address: string) => {
  // helpers
  const updateAssetByOrder = (asset: Work, orders: Order[]) => {
    const givenOrder = orders.find(
      (order) => order.classId === asset.classId && order.tokenId === asset.tokenId,
    );

    if (givenOrder) {
      const categoryId = givenOrder.categoryId ? Number(givenOrder.categoryId) : 3;
      return {
        ...asset,
        status: 1,
        price: givenOrder.price,
        categoryId,
      };
    }
    return { ...asset, status: 2, price: undefined, categoryId: -1 };
  };

  const queryAssetsAndMap = async () => {
    const assets = (await queryNftByAddress({ address })) as Work[];
    const orders = (await getAllOrders()) as Order[];

    if (Array.isArray(orders) && orders.length && Array.isArray(assets) && assets.length) {
      const newAssets = assets.map((asset) => updateAssetByOrder(asset, orders));
      return newAssets;
    }
    return assets;
  };

  const { data, isLoading, error, refetch } = useQuery<Work[]>([MY_ASSETS_QUERY, address], queryAssetsAndMap as any, {
    staleTime: Infinity,
  });

  return { data, isLoading, error, refetch };
};
