import React, { FC, useEffect, useMemo, useState } from 'react';
import { Box, Center, Flex, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import colors from '../../../themes/colors';
import Collection from '../../../components/collection';
import NSelect from '../../../components/nSelect';
import Empty from '../../../components/empty';
import { Category, Work } from '../../../types';

import categoriesStore from '../../../stores/categories';

/** 类型选择 Type filter, use for filtering different types of works */
export interface TypeFiltersProps {
  onChange: (val: any) => void;
}

const TypeFilters: FC<TypeFiltersProps> = ({ onChange }) => {
  const { t, i18n } = useTranslation();

  const [selectedType, setSelectedType] = useState(-1);

  const { categories } = categoriesStore.useState('categories');

  const typeList = useMemo<Category[]>(() => {
    if (categories?.length) {
      const first = { id: -1, name: t(`type.all`) };
      const rest = categories.map((cat, idx) => ({
        name: t(`type.${cat}`),
        id: idx,
      }));
      return [first, ...rest];
    }

    return [];
  }, [categories, i18n.language]);

  const handleSelect = (type: number) => {
    setSelectedType(type);
    onChange(type);
  };

  const renderFilter = ({ name, id }: Category) => {
    return (
      <Box
        key={name}
        cursor="pointer"
        _hover={{ color: colors.text.black }}
        color={id === selectedType ? colors.text.black : ''}
        onClick={() => handleSelect(id)}
      >
        {name}
      </Box>
    );
  };

  return (
    <Box
      display="flex"
      justifyContent="space-evenly"
      alignItems="center"
      ml="16px"
      height="60px"
      borderRadius="4px"
      backgroundColor="#fff"
      boxShadow="base"
      color={colors.text.gray}
    >
      {typeList.map(renderFilter)}
    </Box>
  );
};

/** 展示 结果 与 排序选择 */
export interface Helpers {
  count: number;
  onSort: (val: any) => void;
}

const Helpers: FC<Helpers> = ({ count, onSort }) => {
  const { t } = useTranslation();

  const countText = t(`list.total.result${count > 1 ? 's' : ''}`, { count });
  const options = [
    { value: 1, title: t('form.sort.auto') },
    // { value: 2, title: t('form.sort.other') },
    // { value: 3, title: t('form.sort.latest') },
  ];

  const result = (
    <Box>
      <Text color={colors.text.gray}>{countText}</Text>
    </Box>
  );

  const handleSelect = (value: any) => {
    onSort(value);
  };

  const sorter = (
    <Box>
      <NSelect options={options} onSelect={handleSelect} />
    </Box>
  );

  return (
    <Flex justify="space-between" align="center" ml="16px" py="16px">
      {result}
      {sorter}
    </Flex>
  );
};

export interface MainListProps {
  data: Work[];
  loading?: boolean;
  onTypeChange: (type: number) => void;
}

const MainList: FC<MainListProps> = ({ data, loading, onTypeChange }) => {
  const { t } = useTranslation();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (Array.isArray(data)) {
      setCount(data.length);
    }
  }, [data]);

  const handleFilterChange = (type: number) => {
    onTypeChange(type);
  };

  const handleSorting = (sort: any) => {
    //
  };

  return (
    <Box flex={1}>
      <TypeFilters onChange={handleFilterChange} />

      {loading && (
        <Center height="100%">
          <Spinner />
        </Center>
      )}

      {!loading && (
        <>
          <Helpers onSort={handleSorting} count={count} />
          {!!count && (
            <SimpleGrid columns={4}>
              {data.map((work) => (
                <Link
                  to={`/detail/${work.classId}/${work.tokenId}`}
                  key={`${work.classId}-${work.tokenId}`}
                >
                  <Box ml="16px" mb="16px">
                    <Collection {...work} />
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          )}

          {!count && <Empty description={t('list.empty')} />}
        </>
      )}
    </Box>
  );
};

export default MainList;
