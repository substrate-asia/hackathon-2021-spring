import { ComponentStyleConfig } from '@chakra-ui/react';

const Popover: ComponentStyleConfig = {
  baseStyle: {
    content: {
      padding: '4px 18px',
      borderRadius: '4px',
    },
  },

  variants: {
    menu: {
      popper: {
        width: 'unset',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      content: {
        padding: '0',
      },
      body: {
        padding: '0'
      }
    },
  },
};

export default Popover;
