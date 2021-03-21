import { ComponentStyleConfig } from '@chakra-ui/react';

const Link: ComponentStyleConfig = {
  baseStyle: {
    _hover: {
      textDecoration: 'none',
    },
    _focus: {
      boxShadow: 'none',
    },
  },
};

export default Link;
