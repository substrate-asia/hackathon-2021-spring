import React, { FC } from 'react';
import { Box, Center, Container, SimpleGrid, Skeleton, Spinner } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Collection from '../../../components/collection';
import Empty from '../../../components/empty';
import colors from '../../../themes/colors';
import IconSj from '../../../assets/home/icon_sj.png';
import IconCj from '../../../assets/home/icon_cj.png';
import IconClinch from '../../../assets/home/icon_clinch.png';
import IconRight from '../../../assets/home/icon_right.png';
import { Work } from '../../../types';

type PartWorksProps = {
  title: string;
  icon: React.ReactNode;
  link: string;
  typicalList: Work[];
};

type PartHeaderProps = {
  title: string;
  icon: any;
  link: string;
};
export interface WorksProps {
  loading: boolean;
  data: Record<string, Work[]>;
}

const Works: FC<WorksProps> = ({ loading, data }) => {
  const { t } = useTranslation();

  const partList = [
    {
      key: 'listing',
      title: t('nav.list-sale'),
      icon: IconSj,
      link: '/explore?status=listing',
    },
    {
      key: 'new',
      title: t('nav.latest-create'),
      icon: IconCj,
      link: '/explore?status=new',
    },
    {
      key: 'recent',
      title: t('nav.latest-strike'),
      icon: IconClinch,
      link: '/explore?status=recent',
    },
  ].map((item) => ({ ...item, list: data[item.key] || [] }));

  const PartHeader = (props: PartHeaderProps) => {
    const { title, icon, link } = props;

    return (
      <Box
        display="flex"
        height="30px"
        alignItems="flex-end"
        justifyContent="space-between"
        marginBottom="30px"
      >
        <Box display="flex" height="100%" alignItems="center">
          {/* TODO: Update image source to have more clearness by using svg etc... */}
          <Box as="img" src={icon} alt="" width={7} height={7} mr="8px" />
          <Box color="#232A4A" fontSize="22px" fontWeight="600" lineHeight="30px">
            {title}
          </Box>
        </Box>
        <Box display="flex" alignItems="center" cursor="pointer">
          <Link to={link}>
            <Box
              as="a"
              lineHeight="20px"
              display="block"
              height="20px"
              color={colors.text.black}
              fontSize="14px"
            >
              {t(`home.more`)}
            </Box>
          </Link>
          <Box
            as="img"
            src={IconRight}
            alt=""
            width="14px"
            height="14px"
            transform="translateY(2px)"
          />
        </Box>
      </Box>
    );
  };

  const PartWorks = (props: PartWorksProps) => {
    const { title, typicalList, icon, link } = props;

    return (
      <Box marginBottom={10}>
        <PartHeader title={title} icon={icon} link={link} />
        <SimpleGrid columns={5} spacing={4}>
          {typicalList.map((work) => (
            <Collection {...work} isSet />
          ))}
        </SimpleGrid>
      </Box>
    );
  };

  const loadingNode = (
    <Center height="40vh">
      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
    </Center>
  );

  return (
    <Box p="40px 0">
      <Container>
        {!Object.keys(data).length && loading && loadingNode}

        {!Object.keys(data).length && !loading && <Empty description={t('home.empty')} />}

        {!!Object.keys(data).length &&
          partList.map(({ title, link, icon, list }) =>
            list.length ? (
              <Skeleton isLoaded={!loading} key={title}>
                <PartWorks title={title} typicalList={list} icon={icon} link={link} />
              </Skeleton>
            ) : null,
          )}
      </Container>
    </Box>
  );
};

export default Works;
