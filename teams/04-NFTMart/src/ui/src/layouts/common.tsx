import React from 'react';
import { Box } from '@chakra-ui/react';
import Helmet from 'react-helmet';
import { useTranslation } from 'react-i18next';

interface Props {
  children: React.ReactNode;
  title: string;
}

const Layout = ({ children, title }: Props) => {
  const { t } = useTranslation();
  return (
    <>
      <Helmet>{title && <title>{t(title)}</title>}</Helmet>
      <Box marginTop="77px" as="main">
        {children}
      </Box>
    </>
  );
};

export default Layout;
