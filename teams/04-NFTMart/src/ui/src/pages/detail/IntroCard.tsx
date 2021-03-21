import React, { FC } from 'react';
import { Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import Card from '../../components/card';
import colors from '../../themes/colors';

const IntroCard: FC<{ description: string }> = ({ description }) => {
  const { t } = useTranslation();

  return (
    <Card title={t('detail.title.intro')}>
      <Stack>
        <Text color={colors.text.black}>{description}</Text>
      </Stack>
    </Card>
  );
};

export default IntroCard;
