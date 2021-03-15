import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Box,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Flex,
  Stack,
  Heading,
  Container,
} from '@chakra-ui/react';
import React, { FC, useState } from 'react';
import Card from '../../components/card';
import colors from '../../themes/colors';
import ImageCard from './ImageCard';
import Meta from './Meta';

// import bgSrc from '../../assets/background-demo.jpeg';
import { IPFS_GET_SERVER } from '../../constants';
import { t } from '../../i18n';
import { Work } from '../../types';

export interface PurchaseModalProps {
  open: boolean;
  count: number;
  item: Work;
  category: string;
  onClose: () => void;
  onConfirm: (setLoading: any) => void;
}

const PurchaseModal: FC<PurchaseModalProps> = ({
  category,
  count,
  item,
  open,
  onClose,
  onConfirm,
}) => {
  const { metadata, order = null } = item;
  const owner = '';
  const [loading, setLoading] = useState(false);

  const itemColumnNode = (
    <Container>
      <Stack direction="row" justifyContent="space-between">
        <Flex flex={2} align="center">
          <ImageCard src={`${IPFS_GET_SERVER}${metadata.url}`!} width={90} height={60} />
        </Flex>
        <Stack flex={2} justifyContent="space-between">
          <Flex flex={1}>
            <Text color={colors.text.gray}>{category}</Text>
          </Flex>
          <Flex flex={2}>
            <Heading as="h4" size="md">
              {metadata.name}
            </Heading>
          </Flex>
          <Flex flex={1} align="flex-end">
            {owner && (
              <Meta
                description="Owned by"
                who={owner}
                fontSize="0.75rem"
                cursor="text"
                userSelect="auto"
                whoProps={{ color: colors.text.gray }}
              />
            )}
          </Flex>
        </Stack>
      </Stack>
    </Container>
  );

  const itemCard = (
    <Card backgroundColor={colors.bg.light2}>
      <Stack>
        <Flex color={colors.text.gray} align="center">
          <Flex flex={4}>
            <Text>{t('detail.modal.purchase.item')}</Text>
          </Flex>
          <Flex flex={2}>{t('detail.modal.purchase.count')}</Flex>
          <Flex flex={1} justify="flex-end">
            {t('detail.modal.purchase.price')}
          </Flex>
        </Flex>
        <Flex align="center">
          {/* First column with picture and title */}
          <Flex flex={4}>{itemColumnNode}</Flex>
          <Flex flex={2}>{count}</Flex>
          <Flex flex={1} justify="flex-end">
            <Text color={colors.primary}>{order ? order.price : ''}</Text>
          </Flex>
        </Flex>
      </Stack>
    </Card>
  );

  return (
    <Modal isOpen={open} onClose={onClose} size="lg" isCentered size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading as="h3" size="md">
            {t('detail.modal.purchase.title')}
          </Heading>
        </ModalHeader>
        <ModalCloseButton />
        <Box paddingX={6} marginTop={-3}>
          <Text color={colors.text.gray}>{t('detail.modal.purchase.subtitle')}</Text>
        </Box>
        <ModalBody>{order ? itemCard : null}</ModalBody>

        <ModalFooter display="flex" justifyContent="center">
          <Button isLoading={loading} variant="primary" onClick={() => onConfirm(setLoading)}>
            {t('detail.modal.purchase.confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PurchaseModal;
