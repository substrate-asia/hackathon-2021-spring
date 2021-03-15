import React, { FC } from 'react';
import { Box, Center } from '@chakra-ui/react';
import Image, { Shimmer } from 'react-shimmer';

export interface ImageCardProps {
  src: string;
  width?: number;
  height?: number;
}

const ImageCard: FC<ImageCardProps> = ({ width = 466, height = 666, src }) => {
  return (
    <Box>
      {/* <AspectRatio maxHeight="666px" ratio={1}> */}
      <Center borderRadius="3px" minHeight="20vh" backgroundColor="white">
        <Image
          src={src}
          fallback={<Shimmer height={height} width={width} />}
          NativeImgProps={{
            style: {
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            },
          }}
          fadeIn
        />
      </Center>
      {/* </AspectRatio> */}
    </Box>
  );
};

export default ImageCard;
