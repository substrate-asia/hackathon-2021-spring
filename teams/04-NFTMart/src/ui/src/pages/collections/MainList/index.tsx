import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { IoMdAddCircle } from 'react-icons/io';

import { useTranslation } from 'react-i18next';
import colors from '../../../themes/colors';
import Collection, { MotionBox } from '../../../components/collection';
import NSelect from '../../../components/nSelect';
import { Category, Work } from '../../../types';
import Empty from '../../../components/empty';

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
      {/* {sorter} */}
    </Flex>
  );
};

export interface MainListProps {
  data: Work[];
  loading?: boolean;
  onTypeChange: (type: number) => void;
  onCreateAsset: () => void;
  title?: string;
  description?: string;
}

const MainList: FC<MainListProps> = ({
  title,
  description,
  data,
  loading,
  onTypeChange,
  onCreateAsset,
}) => {
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

  const headerNode = title && (
    <Box marginLeft="16px" paddingBottom={4}>
      <Stack diretion="column">
        <Heading>{title}</Heading>
        <Text color={colors.text.gray}>{description}</Text>
      </Stack>
    </Box>
  );

  return (
    <Box flex={1}>
      {/* <TypeFilters onChange={handleFilterChange} /> */}
      {headerNode}
      {title && <Divider marginLeft="16px" />}

      {loading && (
        <Center height="100%">
          <Spinner />
        </Center>
      )}

      {!loading && (
        <>
          <Helpers onSort={handleSorting} count={count} />
          <SimpleGrid columns={4}>
            {onCreateAsset && (
              <MotionBox
                onClick={onCreateAsset}
                color={colors.primary}
                backgroundColor="#fff"
                borderRadius="4px"
                cursor="pointer"
                _hover={{ boxShadow: 'lg' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                userSelect="none"
                ml="16px"
                mb="16px"
                height="310px"
              >
                <Box mt={6} mb={2}>
                  <IoMdAddCircle size={99} />
                </Box>
                <Heading as="h4" size="sm">
                  {t('create.title')}
                </Heading>
              </MotionBox>
            )}

            {!!count &&
              data.map((work) => (
                <Link to={`/detail/${work.classId}/${work.tokenId}`} key={`${work.classId}-${work.tokenId}`}>
                  <Box ml="16px" mb="16px">
                    <Collection {...work} />
                  </Box>
                </Link>
              ))}
            {/* {!count && <Empty description={t('list.empty')} />} */}
          </SimpleGrid>
        </>
      )}
    </Box>
  );
};

export default MainList;
