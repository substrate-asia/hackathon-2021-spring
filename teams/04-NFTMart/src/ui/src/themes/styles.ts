import colors from './colors';

const obj = {
  global: () => ({
    // font
    'html, body': {
      // fontFamily: "PingFangSC-Regular, PingFang SC;",
      width: '100%',
      height: '100%',
    },
    body: {
      backgroundColor: colors.bg.light1,
    },
    a: {
      _hover: {
        textDecoration: 'none',
      },
    },
    '#root': {
      position: 'relative',
    },

    'footer.page-footer': {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: '-233px',
    },

    ':focus': {
      outline: 'none',
      boxShadow: 'none',
    },
  }),
};

export default obj;
