import { ComponentStyleConfig } from '@chakra-ui/react';
import colors from '../colors';

const Button: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: '4px',
    padding: '3px 16px',
    // py: 1,
    fontWeight: 'normal',
    _disabled: {
      backgroundColor: colors.btnBg.disabled,
      border: 'none',
      color: colors.text.lightGray,
      _hover: {
        background: colors.btnBg.disabled,
      },
    },
  },
  variants: {
    primary: {
      color: 'white',
      backgroundColor: colors.primary,
      _hover: {
        backgroundColor: colors.btnBg.hover.primary,
      },
    },
    default: {
      color: colors.primary,
      backgroundColor: 'white',
      borderWidth: 1,
      borderColor: colors.primary,
      _hover: {
        backgroundColor: colors.btnBg.hover.default,
      },
    },
  },
  defaultProps: {
    variants: 'default',
  },
};

export default Button;
