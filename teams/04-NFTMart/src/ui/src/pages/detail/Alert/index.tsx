import React, { FC } from 'react';
import { Box, Stack, Text, Button, Container, Center, BoxProps } from '@chakra-ui/react';
import colors from '../../../themes/colors';
import { t } from '../../../i18n';

export interface AlertProps extends BoxProps {
  onSetting: () => void;
  order: any;
  categories: string[];
}

const Alert: FC<AlertProps> = ({ onSetting, order, categories, ...boxProps }) => {
  return (
    <Box height="80px" backgroundColor="#e9ecff" display="flex" alignItems="center" {...boxProps}>
      <Container>
        <Stack direction="row" justifyContent="center">
          <Center>
            <Box>
              <Text display="inline" color={colors.text.gray}>
                {t('detail.alert.list')}
              </Text>{' '}
              <Text as="span" color={colors.primary}>
                {t(categories[order.categoryId])}
              </Text>
            </Box>
          </Center>
          {/* <Button variant="default">销毁</Button> */}
          {/* <Button variant="primary" onClick={onSetting}>
            {t(categories[order.categoryId])}
          </Button> */}
        </Stack>
      </Container>
    </Box>
  );
};

export default Alert;
