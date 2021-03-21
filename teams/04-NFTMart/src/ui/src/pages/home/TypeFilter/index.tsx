import React, { FC, useMemo, useState } from 'react';
import { Box, Container, Button, keyframes } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import BannerBg from '../../../assets/home/banner.png';
import colors from '../../../themes/colors';
import { Z_INDEXES } from '../../../constants';
import { Category } from '../../../types';

import categoriesStore from '../../../stores/categories';

const fadeIn = keyframes`
from {
  opacity: 0;
}

to {
  opacity: 1;
}
`

const BannerImg = styled.img({
  height: '100%',
  maxWidth: 'none',
  animation: `${fadeIn} .5s ease-in`,
});

const Title = styled.div({
  fontSize: '54px',
  fontWeight: 'bold',
  color: '#fff',
  lineHeight: '75px',
  letterSpacing: '2px',
});

const Intro = styled.div({
  marginTop: '8px',
  color: '#fff',
  lineHeight: '30px',
  fontSize: '22px',
  letterSpacing: '1px',
});

const ExploreButton = styled(Button)`
  margin-top: 40px;
  height: 48px;
  width: 184px;
  font-size: 16px;
  font-weight: bold;
  color: #1f58e7;
  border-radius: 4px;
`;

const TextContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  left: '0',
  top: '0',
  height: '100%',
  width: '100%',
  textAlign: 'center',
  zIndex: Z_INDEXES.banner,
});

const TypeItem = styled.li`
  list-style: none;
  padding: 0 10px;
  margin-left: 100px;
  font-size: 16px;
  line-height: 60px;
  cursor: pointer;
  color: ${colors.text.gray};
  :first-of-type {
    margin-left: 0;
  }
  &.active,
  :hover {
    color: #000;
  }
`;

export interface TypeFilterProps {
  onFilter?: (v: number) => void;
  sticky?: boolean;
}

const TypeFilter: FC<TypeFilterProps> = ({ onFilter, sticky }) => {
  const { t, i18n } = useTranslation();

  const [selectedTypeId, setSelectedTypeId] = useState(-1);
  const { categories } = categoriesStore.useState('categories');

  const typeList = useMemo<Category[]>(() => {
    if (categories?.length) {
      const first = { id: -1, name: t(`type.all`) };
      const rest = categories.map((cat, idx) => ({
        name: t(`type.${cat}`),
        id: idx,
      }));
      return [first, ...rest];
    }

    return [];
  }, [categories, i18n.language]);

  const handleTypeClick = (id: number) => {
    setSelectedTypeId(id);
    onFilter?.(id);
  };

  return (
    <Box
      position="relative"
      display="flex"
      justifyContent="center"
      height="440px"
      overflow="hidden"
      backgroundColor="blue"
    >
      <BannerImg src={BannerBg} alt="" />

      <TextContainer>
        <Title>The largest NFT marketplace</Title>
        <Intro>Buy, sell, and discover rare digital items</Intro>
        <Link to="/explore">
          <ExploreButton>EXPLORE</ExploreButton>
        </Link>
      </TextContainer>

      <Box
        backgroundColor="white"
        // boxShadow="sm"
        boxShadow="0px 2px 4px 0px rgba(0, 0, 0, 0.06)"
        borderTop={sticky ? `1px solid ${colors.divider.dark}` : ''}
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        zIndex={Z_INDEXES.typeFilter - 1}
        transition="top 0.2s linear"
      >
        <Container display="flex" justifyContent="center">
          {typeList.map(({ id, name }) => (
            <TypeItem
              key={id}
              onClick={() => handleTypeClick(id)}
              className={selectedTypeId === id ? 'active' : ''}
            >
              {name}
            </TypeItem>
          ))}
        </Container>
      </Box>
    </Box>
  );
};

export default TypeFilter;
