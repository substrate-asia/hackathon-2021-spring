import React, { FC, useEffect, useState } from 'react';
import {NavLink} from 'react-router-dom'
import store from 'store';

import { useTranslation } from '@/components';

import logo from '../../assets/nav-logo.svg';
import styled from 'styled-components';
import {AccountSelect} from '@/components/AccountSelect';


const LogoBox = styled.div`
  margin-right:40px;
  margin-left:80px;
  width:140px;
  img{
    width: 100%;
  }
`;
const Logo: FC = () => {
  return (
    <LogoBox>
      <img src={logo} alt="SubLend logo" />
    </LogoBox>
  )
}
const LanguageBoxBox = styled.div`
  margin-right:80px;
  display:flex;
  justify-content:flex-end;
  align-items:center;
`;
const LanguageInner = styled.div`
  margin-left:20px;
  span{
    margin: 0 10px;
    cursor:pointer;
    transition:all .5s ease;
    &:hover{
      color:var(--primary-color);
    }
    &.active{
      color:var(--primary-color);
    }
  }
`;
const LanguageBox: FC = () => {
  const { t, i18n } = useTranslation();
  const [lng,setLng] = useState<string>('zh');

  // const changeLanguage = useCallback((val: any) => {
  //   console.log(val);
    
  //   setLng(val)
  //   i18n.changeLanguage(lng);
  //   store.set('Language',lng)
  // }, [setLng,lng,i18n]);

  useEffect(()=>{
    i18n.changeLanguage(lng);
    store.set('SubLendLanguage',lng)

  }, [lng,i18n])

  return (
    <LanguageBoxBox>
      <AccountSelect />
      {/* <AccountBar /> */}
      <LanguageInner>
        <span className={ lng==='zh' ? 'active' : '' } onClick={()=>setLng('zh')}>
          {t('ZH')}
        </span>
        <span className={ lng==='en' ? 'active' : '' } onClick={()=>setLng('en')}>
          {t('EN')}
        </span>
      </LanguageInner>
    </LanguageBoxBox>
  )
}
const NavBoxBox = styled.ul`
  display:flex;
  justify-content:flex-start;
  align-items:center;
  li{
    margin: 0 20px;

    a{
      &:hover{
        color: var(--primary-color); 
      }
    }
  }`;

const activeClassName = 'active'
// eslint-disable-next-line
const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  &.${activeClassName} {
    border-radius: 12px;
    font-weight: 500;
    color: var(--primary-color);
  }
`
const NavBox: FC = () => {
  const { t } = useTranslation();
  return (
    <NavBoxBox>
      <li>
        <StyledNavLink exact to="/">{t('Market')}</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/bank">{t('Bank')}</StyledNavLink>
      </li>
      <li>
        <StyledNavLink to="/lend">{t('Lend')}</StyledNavLink>
      </li>
    </NavBoxBox>
  )
}
const NavBarBox = styled.div`
  display:flex;
  justify-content: space-between;
  align-items:center;
  height:100px;
  background:white;
`;
const Left = styled.div`
  width: 50%;
  display:flex;
  justify-content:flex-start;
`;
export const NavBar: FC = () => {
  return (
    <NavBarBox>
      <Left>
        <Logo />
        <NavBox></NavBox>
      </Left>
      <LanguageBox />
    </NavBarBox>
  )
}