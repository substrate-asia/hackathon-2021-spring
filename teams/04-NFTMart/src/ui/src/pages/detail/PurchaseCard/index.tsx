import React, { FC } from 'react';
import { Box, Button, Heading, Stack, Flex, Text, Badge } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Card from '../../../components/card';
import colors from '../../../themes/colors';
import Meta from '../Meta';

export interface InnerCardProps {
  price: number | string;
  onPurchase: () => void;
  onCancel: () => void;
  order: any;
  onSetting: () => void;
  isOwner: boolean;
  cancelLoading: boolean;
  asset: any;
}

const InnerCard: FC<InnerCardProps> = ({
  price,
  onPurchase,
  onCancel,
  order = null,
  onSetting,
  isOwner,
  cancelLoading,
  asset,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      title={
        <Box>
          {order && <Text color={colors.text.gray}>{t('detail.current-price')}</Text>}
          {order ? (
            <Box>
              {!isOwner && (
                <Button
                  variant="primary"
                  width="180px"
                  height="50px"
                  float="right"
                  onClick={() => onPurchase()}
                >
                  {t('detail.purchase')}
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="primary"
                  width="180px"
                  height="50px"
                  float="right"
                  onClick={onCancel}
                  isLoading={cancelLoading}
                  // TODO: add translation
                  loadingText="Canceling"
                >
                  {t('detail.cancel')}
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              {isOwner && (
                <Button
                  variant="primary"
                  width="180px"
                  height="50px"
                  float="right"
                  onClick={() => onSetting()}
                >
                  {t('order.setting')}
                </Button>
              )}
            </Box>
          )}
        </Box>
      }
      backgroundColor="#f9f8fd"
      noHeadBorder
    >
      <Box marginTop="-1rem">
        {/* TODO: price formatting */}
        {order ? (
          <Heading size="lg" display="inline">
            {price}
          </Heading>
        ) : (
          <Text display="inline">{t('detail.no.list')}</Text>
        )}{' '}
        {order && <Text display="inline">{(price as string).includes('NMT') ? '' : 'NMT'}</Text>}
      </Box>
    </Card>
  );
};

export interface PurchaseCardProps {
  name: string;
  category: string;
  price: number | string;
  owner?: string;
  onPurchase: () => void;
  onSetting: any;
  onCancel: any;
  isOwner: boolean;
  cancelLoading: boolean;
  asset: any;
}

const PurchaseCard: FC<PurchaseCardProps> = ({
  category,
  name,
  price,
  onPurchase,
  isOwner,
  asset,
  ...rest
}) => {
  const { t } = useTranslation();

  return (
    <Card title={<Text color={colors.primary}>{category}</Text>} noHeadBorder>
      <Stack marginTop={category ? '-1rem' : '-2rem'} spacing={4}>
        <Flex justify="space-between" align="flex-end">
          <Heading as="h2" size="lg">
            {name}
          </Heading>
          <Meta description="Owned by" who={isOwner ? 'You' : asset.owner} />
        </Flex>
        <InnerCard
          price={price}
          onPurchase={onPurchase}
          asset={asset}
          isOwner={isOwner}
          {...rest}
        ></InnerCard>
      </Stack>
    </Card>
  );
};

export default PurchaseCard;
