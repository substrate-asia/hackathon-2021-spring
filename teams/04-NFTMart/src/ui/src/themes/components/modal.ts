import { ComponentStyleConfig } from '@chakra-ui/react';
import colors from '../colors';

const Modal: ComponentStyleConfig = {
  baseStyle: {
    dialog: {
      borderRadius: '3px',
    },
    header: {
      px: 6,
      pt: 6,
      py: 4,
    },
    body: {
      px: 6,
      py: 2,
      pt: 4,
    },
    footer: {
      px: 6,
      pt: 2,
      pb: 6,
    },
    closeButton: {
      top: 4,
      right: 6,
      color: colors.text.lightGray,
      fontSize: '16px',
    },
  },
  variants: {},
  defaultProps: {},
};

export default Modal;
