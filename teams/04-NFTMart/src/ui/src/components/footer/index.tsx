import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import LogoImg from '../../assets/footer_logo.png';
import GithubLogo from '../../assets/footer_icon_github.png';
import GithubLogoHover from '../../assets/footer_icon_github_s.png';
import TwitterLogo from '../../assets/footer_icon_twitter.png';
import TwitterLogoHover from '../../assets/footer_icon_twitter_s.png';
import FaceboookLogo from '../../assets/footer_icon_facebook.png';
import FaceboookLogoHover from '../../assets/footer_icon_facebook_s.png';
import WeboLogo from '../../assets/footer_icon_webo.png';
import WeboLogoHover from '../../assets/footer_icon_webo_s.png';
import WechatLogo from '../../assets/footer_icon_wechat.png';
import WechatLogoHover from '../../assets/footer_icon_wechat_s.png';
import InsLogo from '../../assets/footer_icon_ins.png';
import InsLogoHover from '../../assets/footer_icon_ins_s.png';

export default function Uploader() {
  const { t } = useTranslation();
  const iconList = [
    { src: GithubLogo, hoverSrc: GithubLogoHover, id: 0 },
    { src: TwitterLogo, hoverSrc: TwitterLogoHover, id: 1 },
    { src: FaceboookLogo, hoverSrc: FaceboookLogoHover, id: 2 },
    { src: WeboLogo, hoverSrc: WeboLogoHover, id: 3 },
    { src: WechatLogo, hoverSrc: WechatLogoHover, id: 4 },
    { src: InsLogo, hoverSrc: InsLogoHover, id: 5 },
  ];

  return (
    <Box
      as="footer"
      flex={1}
      display="flex"
      justifyContent="center"
      minHeight="232px"
      backgroundColor="#373F60"
      border="1px solid #979797"
      className="page-footer"
    >
      <Container
        display="flex"
        flexDirection="row"
        paddingX={3}
        justifyContent="space-around"
        flexWrap="wrap"
        paddingBottom={5}
      >
        <Box alignSelf="center">
          <Box as="img" src={LogoImg} alt="" width="200px" height="auto"></Box>
        </Box>
        <Box width="663px" mt="60px">
          <Box lineHeight="20px" fontWeight="500" fontSize="14px" color="#61688A" mb="10px">
            {t('footer.aboutus.title')}
          </Box>
          <Box lineHeight="20px" color="#C7CCE6" fontSize="14px">
            {t('footer.aboutus.intro')}
          </Box>
        </Box>
        <Box mt="60px">
          <Box lineHeight="20px" color="#61688a" fontWeight="500" fontSize="14px" mb="20px">
            {t('footer.follow')}
          </Box>
          <Box mb="20px" display="flex">
            {iconList.map(({ id, src, hoverSrc }) => (
              <Box ml={id !== 0 ? '30px' : 0} role="group" key={src}>
                <Box
                  as="img"
                  alt=""
                  src={src}
                  width="32px"
                  cursor="pointer"
                  _groupHover={{ display: 'none' }}
                />
                <Box
                  as="img"
                  alt=""
                  display="none"
                  src={hoverSrc}
                  width="32px"
                  cursor="pointer"
                  _groupHover={{ display: 'block' }}
                />
              </Box>
            ))}
          </Box>
          <Box lineHeight="20px" color="#61688a" fontSize="12px">
            {t('footer.copyright')}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
