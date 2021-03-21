import React from 'react';
import { Table, Thead, Tr, Th, Tbody, Td, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import Card from '../../../components/card';

const HistoryEventCard = () => {
  const { t } = useTranslation();
  return (
    <Card
      title={t('detail.title.event')}
      body={
        // <Table variant="simple">
        //   <Thead>
        //     <Tr>
        //       <Th>{t('detail.event.event')}</Th>
        //       <Th isNumeric>{t('detail.event.price')}</Th>
        //       <Th>{t('detail.event.source')}</Th>
        //       <Th>{t('detail.event.target')}</Th>
        //       <Th isNumeric>{t('detail.event.date')}</Th>
        //     </Tr>
        //   </Thead>
        //   <Tbody>
        //     <Tr>
        //       <Td>Create</Td>
        //       <Td isNumeric>187,12</Td>
        //       <Td>未知</Td>
        //       <Td>目标</Td>
        //       <Td isNumeric>2021-02-12 14:23:45</Td>
        //     </Tr>

        //     <Tr>
        //       <Td>Create</Td>
        //       <Td isNumeric>187,12</Td>
        //       <Td>未知</Td>
        //       <Td>目标</Td>
        //       <Td isNumeric>2021-02-12 14:23:45</Td>
        //     </Tr>
        //     <Tr>
        //       <Td>Create</Td>
        //       <Td isNumeric>187,12</Td>
        //       <Td>未知</Td>
        //       <Td>目标</Td>
        //       <Td isNumeric>2021-02-12 14:23:45</Td>
        //     </Tr>
        //   </Tbody>
        // </Table>
        <Center h="300px">{t('event.coming.soon')}</Center>
      }
    />
  );
};

export default HistoryEventCard;
