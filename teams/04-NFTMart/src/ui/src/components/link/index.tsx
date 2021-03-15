import { Link as RouterLink } from 'react-router-dom';
import { Text, Link, HTMLChakraProps, LinkProps } from '@chakra-ui/react';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import colors from '../../themes/colors';

export interface NLinkProps extends HTMLChakraProps<'p'> {
  path: string;
  title: string;
  active?: boolean;
  bordered?: boolean;
  linkProps?: LinkProps;
}

const NLink: FC<NLinkProps> = (props) => {
  const { t } = useTranslation();
  const { path, title, active = false, bordered = false, linkProps, ...restStyles } = props;

  const borderBottom = {
    content: '" "',
    height: 1,
    width: '80%',
    borderRadius: 3,
    position: 'absolute',
    backgroundColor: colors.primary,
    left: '50%',
    bottom: -2,
    transform: 'translate(-50%, -50%)',
  };

  return (
    <Text
      fontSize={16}
      _hover={{
        color: colors.primary,
      }}
      position="relative"
      {...restStyles}
    >
      <Link
        as={RouterLink}
        key={title}
        to={path}
        color={active ? colors.primary : ''}
        _after={active && bordered ? borderBottom : {}}
        {...linkProps}
      >
        {t(title)}
      </Link>
    </Text>
  );
};

export default NLink;
