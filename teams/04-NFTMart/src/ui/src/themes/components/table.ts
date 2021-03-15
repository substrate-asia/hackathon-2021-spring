import { ComponentStyleConfig } from '@chakra-ui/react';
import colors from '../colors';

const Table: ComponentStyleConfig = {
  sizes: {
    md: {
      th: {
        px: '4',
        py: '3',
        lineHeight: '5',
        fontSize: 'md',
      },
      td: {
        px: '4',
        py: '4',
        lineHeight: '5',
      },
    },
    lg: {
      th: {
        px: '4',
        py: '4',
        lineHeight: '5',
      },
      td: {
        px: '44',
        py: '5',
        lineHeight: '6',
      },
      caption: {
        px: '4',
        py: '2',
        fontSize: 'md',
      },
    },
  },
  baseStyle: {
    table: {
      paddingX: '4',
    },
    thead: {
      backgroundColor: colors.bg.light1,
      paddingX: '4',
    },
    td: {
      borderBottom: 'none',
      fontWeight: '700',
    },
  },
  variants: {},
};

export default Table;
