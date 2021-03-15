import React, { useCallback, useMemo } from 'react';
import {
  forwardRef,
  ChakraProps,
  chakra,
  ComponentWithAs,
  Box,
  Flex,
  Center,
} from '@chakra-ui/react';
import { motion, MotionProps, isValidMotionProp } from 'framer-motion';
import Image, { Shimmer } from 'react-shimmer';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { omit } from 'ramda';

import colors from '../../themes/colors';
import { Work } from '../../types';
import { toFixedDecimals } from '../../utils';
import { actions } from '../../stores/assets';
import { IPFS_GET_SERVER } from '../../constants';

type CollectionProps = {
  isSet?: boolean;
} & Partial<Work>;

export type MotionBoxProps = Omit<ChakraProps, keyof MotionProps> &
  MotionProps & {
    as?: React.ElementType;
  };

// TODO: Should we abstract motion to a common component?
export const MotionBox = motion.custom(
  forwardRef<MotionBoxProps, 'div'>((props, ref) => {
    const chakraProps = Object.fromEntries(
      // do not pass framer props to DOM element
      Object.entries(props).filter(([key]) => !isValidMotionProp(key)),
    );
    // FIXME: ref type imcompatible
    return <chakra.div ref={ref as any} {...chakraProps} />;
  }),
) as ComponentWithAs<'div', MotionBoxProps>;

// FIXME: MotionBox seems to have a bit rendering issue which looks like crashing
const Collection = (props: CollectionProps) => {
  const { t } = useTranslation();
  const { classId, tokenId: id, name, price, isSet = false, url } = props;
  const history = useHistory();

  const picUrl = useMemo(() => `${IPFS_GET_SERVER}${url}`, []);

  const dispense = () => {
    actions.selectAsset(omit(['isSet'], props as Work));
    history.push(`/detail/${classId}/${id}`);
  };

  const handleCollectionClick = useCallback(dispense, [classId, id]);

  // TODO: Might wanna move link outside
  return (
    <MotionBox
      onClick={handleCollectionClick}
      width="231px"
      height="310px"
      backgroundColor="#fff"
      borderRadius="4px"
      cursor="pointer"
      _hover={{ boxShadow: 'lg' }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      display="flex"
      flexDirection="column"
      justifyContent="space-around"
    >
      <Center height={195} width={231} borderBottom={`1px solid ${colors.divider.dark}`}>
        <Image
          NativeImgProps={{ style: { width: 231, height: 195 } }}
          src={picUrl as string}
          fallback={<Shimmer height={195} width={231} />}
          fadeIn
        />
      </Center>

      <Box
        mt="16px"
        display="flex"
        justifyContent="space-between"
        p="0 16px"
        height="17px"
        lineHeight="17px"
        fontSize="12px"
        color={colors.text.gray}
      >
        <Box userSelect="none">{t('component.collection.title')}</Box>
        {price && (
          <Box userSelect="none" flex="1" textAlign="right">
            {t('component.collection.price')}
          </Box>
        )}
      </Box>
      <Box
        mt="8px"
        display="flex"
        justifyContent="space-between"
        maxHeight="80px"
        p="0 16px 16px 16px"
        fontWeight="600"
        color={colors.text.black}
        flex="1"
      >
        <Box pr={2} flex="2" overflow="hidden" textOverflow="ellipsis">
          <Flex align="center">{name}</Flex>
        </Box>
        {price && (
          <Box flex="1" textAlign="right" display="flex" justifyContent="flex-end">
            <Flex align="flex-start">
              {/* {isSet && <Box src={PriceIcon} as="img" alt="" mr="4px" />} */}
              <Box>{typeof price === 'number' ? toFixedDecimals(price, 0) : price}</Box>
            </Flex>
          </Box>
        )}
      </Box>
    </MotionBox>
  );
};

export default Collection;
