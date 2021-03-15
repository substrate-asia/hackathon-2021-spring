import { pick } from 'ramda';
import Rekv from 'rekv';
import { Work, Collection } from '../types';

export interface FilterTypes {
  status: number;
  categoryId: number;
  collectionId: number;
}
export interface AssetStore extends FilterTypes {
  assets: Work[];
  myAssets: Work[];
  selectedAsset: Work | null;
  filteredAssets: Work[];
  collections: Collection[];
  myCollections: Collection[];
  filteredCollections: Collection[];
}

const store = new Rekv<AssetStore>({
  assets: [],
  myAssets: [],
  selectedAsset: null,
  filteredAssets: [],
  // filtering properties
  // status id
  status: -1,
  // category id
  categoryId: -1,
  // collection id
  collectionId: -1,

  // Store collections title and id
  collections: [],
  //
  myCollections: [],
  // Search filtered collections
  filteredCollections: [],
});

export default store;

// filter assets by filter types
const filterAssets = (
  assets: Work[],
  { status = -1, categoryId: category = -1, collectionId: collection = -1 }: Partial<FilterTypes>,
) =>
  assets
    .filter(({ status: assetStatus }) => status === -1 || assetStatus === status)
    .filter(({ categoryId }) => category === -1 || categoryId === category)
    .filter(({ classId: collectionId }) => collection === -1 || collectionId === collection);

const takeFilterTypes = pick(['status', 'categoryId', 'collectionId']);

export const actions = {
  setCollections(collections: Collection[]) {
    store.setState({ collections, filteredCollections: collections });
  },
  setAssets(assets: Work[]) {
    store.setState((s) => ({
      ...s,
      assets,
      filteredAssets: filterAssets(assets, takeFilterTypes(s)),
    }));
  },
  selectAsset(asset: any) {
    store.setState({ selectedAsset: asset });
  },
  setFilters(filterTypes: Partial<FilterTypes>) {
    store.setState({ ...filterTypes });
  },
  filterAssets(filterTypes: Partial<FilterTypes>) {
    store.setState((s) => {
      const originalFilterTypes = takeFilterTypes(s);
      const filteredAssets = filterAssets(s.assets, { ...originalFilterTypes, ...filterTypes });

      return {
        ...s,
        ...filterTypes,
        filteredAssets,
      };
    });
  },
  filterCollectionsByName(val: string) {
    // TODO: Search algos
    store.setState(({ collections }) => ({
      filteredCollections: collections.filter(({ name }) => name.toLowerCase().includes(val)),
    }));
  },
};
