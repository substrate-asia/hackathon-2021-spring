import React, { useState } from 'react';
import {
  Stack,
  Avatar,
  Icon,
  Popover,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Button,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { IoMdArrowDropup, IoMdArrowDropdown } from 'react-icons/io';

const TRANSLATIONS: Record<string, string> = {
  en: 'lang.en',
  zh: 'lang.zh',
};

const ChangeLanguage = () => {
  const { i18n, t } = useTranslation();

  const [lang, setLang] = useState(i18n.language || 'en');
  const [opening, setOpening] = useState(false);

  const handleSelectLang = (l: string) => {
    setLang(l);
    i18n.changeLanguage(l);
  };

  // Link render helper
  const renderButton = (title: string, idx: string | number | null | undefined) => {
    const path = TRANSLATIONS[title];

    return (
      <Button key={idx} variant="ghost" onClick={() => handleSelectLang(title)}>
        {t(path)}
      </Button>
    );
  };

  // Menus
  const menus = <Stack paddingY={2}>{Object.keys(TRANSLATIONS).map(renderButton)}</Stack>;

  // Trigger
  const triggerContent = (
    <Stack direction="row" cursor="pointer" alignItems="center" spacing={0}>
      <Text>{t(TRANSLATIONS[lang])}</Text>
      {opening ? <Icon as={IoMdArrowDropup} /> : <Icon as={IoMdArrowDropdown} />}
    </Stack>
  );

  return (
    <Popover
      placement="bottom"
      size="sm"
      variant="menu"
      isOpen={opening}
      onOpen={() => setOpening(true)}
      onClose={() => setOpening(false)}
    >
      <PopoverTrigger>{triggerContent}</PopoverTrigger>
      <Portal>
        {/* TODO: Move focus property else where to have common use */}
        <PopoverContent maxWidth="200px" _focus={{ boxShadow: 'none' }}>
          <PopoverArrow />
          <PopoverBody display="flex" justifyContent="center">
            {menus}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

export default ChangeLanguage;
