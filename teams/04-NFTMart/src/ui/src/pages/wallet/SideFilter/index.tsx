import React, { ChangeEventHandler, FC, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import colors from '../../../themes/colors';
import { Collection } from '../../../types';
import Empty from '../../../components/empty';
import { useQuery } from '../../../utils/hook';

const STATUS_MAP: Record<string, number> = {
  'nav.explore.all': -1,
  'nav.list-sale': 1,
  // 'nav.latest-create': 2,
  // 'nav.latest-strike': 3,
};

const QUERY_MAP: Record<string, string> = {
  all: 'nav.explore.all',
  listing: 'nav.list-sale',
  // new: 'nav.latest-create',
  // recent: 'nav.latest-strike',
};

const DEFUALT_COLLECTION_ID = -1;
export interface SideFilterProps {
  data: Collection[];
  header?: string;
  singleStatus?: boolean;
  loading: boolean;
  onSearch: (v: string) => void;
  onSelectCollection: (c: number) => void;
  onStatusChange: (s: number) => void;
}

const SideFilter: FC<SideFilterProps> = ({
  data,
  header,
  loading,
  singleStatus,
  onSearch,
  onStatusChange,
  onSelectCollection,
}) => {
  const { t } = useTranslation();
  const query = useQuery();
  const statusQueryValue = STATUS_MAP[QUERY_MAP[query.get('status') ?? 'all']];

  const selectedStatusSet = useMemo<Set<number>>(() => new Set(), []);
  const [selectedStatus, setSelectedStatus] = useState<number[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number>(-1);

  // Update status base on router
  useEffect(() => {
    if (singleStatus) {
      selectedStatusSet.clear();
    }
    if (selectedStatusSet.has(statusQueryValue)) {
      selectedStatusSet.delete(statusQueryValue);
    } else {
      selectedStatusSet.add(statusQueryValue);
    }
    setSelectedStatus(Array.from(selectedStatusSet));
    return () => {
      //
    };
  }, [statusQueryValue]);

  // Update default collectionId
  useEffect(() => {
    if (data.length && selectedCollectionId === -1) {
      setSelectedCollectionId(data[0].id);
    }

    return () => {
      //
    };
  }, [data]);

  const handleSelectStatus = (status: number) => {
    if (singleStatus) {
      selectedStatusSet.clear();
    }
    if (selectedStatusSet.has(status)) {
      selectedStatusSet.delete(status);
    } else {
      selectedStatusSet.add(status);
    }
    setSelectedStatus(Array.from(selectedStatusSet));
    onStatusChange(status);
  };

  const handleSelectCollection = (val: number | string) => {
    const result = Number(val);
    setSelectedCollectionId(result);
    onSelectCollection(result);
  };

  const handleSearch: ChangeEventHandler<HTMLInputElement> = ({ target: { value } }) => {
    // TODO: add debounce
    onSearch(value);
  };

  return (
    // Columns
    <Box width="321px">
      {/* Header */}
      {header && (
        <Box
          backgroundColor={colors.primary}
          color="white"
          padding={4}
          borderTopLeftRadius={6}
          borderTopRightRadius={6}
        >
          <Heading as="h4" size="md">
            {header}
          </Heading>
        </Box>
      )}
      {/* Card */}
      <Box backgroundColor="#fff" boxShadow="base" borderRadius="4px" paddingY={6} paddingX={4}>
        <Stack spacing={4}>
          <Stack mb={2}>
            <Heading as="h4" size="md">
              {t('form.status')}
            </Heading>
            <Wrap direction="row" spacing={4}>
              {Object.keys(STATUS_MAP).map((key) => {
                const status = STATUS_MAP[key];
                const isSelected = !selectedStatus.length || selectedStatusSet.has(status);
                const color = isSelected ? colors.primary : colors.text.gray;

                return (
                  <WrapItem flex={1} key={key}>
                    <Button
                      variant="default"
                      borderColor={color}
                      color={color}
                      onClick={() => handleSelectStatus(status)}
                      flex={1}
                      _focus={{ boxShadow: 'none' }}
                    >
                      {t(key)}
                    </Button>
                  </WrapItem>
                );
              })}
              {/* Placeholder */}
              {/* <WrapItem flex={1}></WrapItem> */}
            </Wrap>
          </Stack>

          <Stack>
            <Heading as="h4" size="md">
              {t('form.collection')}
            </Heading>
            <Input placeholder={t('form.collection.placeholder')} onChange={handleSearch} />
            {loading && (
              <Center height="88px">
                <Spinner />
              </Center>
            )}

            {!loading && !data.length && (
              <Empty image={null} description={t('explore.collections.empty')} />
            )}

            {!loading && !!data.length && (
              <RadioGroup
                onChange={handleSelectCollection}
                value={`${selectedCollectionId}`}
                defaultValue={DEFUALT_COLLECTION_ID}
              >
                <Stack>
                  <Radio value={`${DEFUALT_COLLECTION_ID}`} key={`${DEFUALT_COLLECTION_ID}`}>
                    {t('nav.explore.all')}
                  </Radio>
                  {data.map(({ id, name }) => (
                    <Radio value={`${id}`} key={id + name}>
                      {name}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default SideFilter;
