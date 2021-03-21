import React, { FC } from 'react';
import { Box, Center, Text } from '@chakra-ui/react';
import Image, { Shimmer } from 'react-shimmer';
import colors from '../../themes/colors';

import img from '../../assets/empty.png';

export interface EmptyProps {
  image?: React.ReactNode;
  description?: string;
}

// const DefaultImage = <Box height={233} width={188} backgroundColor={colors.divider.dark} ></Box>;

const Empty: FC<EmptyProps> = ({ image = img, description }) => {
  const imageNode =
    typeof image === 'string' ? (
      <Image src={image} fallback={<Shimmer width={300} height={400} />} />
    ) : (
      image
    );

  return (
    <Box textAlign="center">
      <Center marginBottom={3}>{imageNode}</Center>
      <Text color={colors.text.gray}>{description}</Text>
    </Box>
  );
};

export default Empty;
