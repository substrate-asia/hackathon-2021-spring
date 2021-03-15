import {
  Box,
  Center,
  Flex,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
  SelectProps,
  Stack,
  Text,
} from '@chakra-ui/react';
import React, { FC, useState } from 'react';
import { IoMdArrowDropdown, IoMdArrowDropup } from 'react-icons/io';

import colors from '../themes/colors';

export type Option<Value = any> = { value: Value; title: string };

export interface NSelectProps<Value = any> extends PopoverProps {
  options: Option<Value>[];
  onSelect?: (val: Value) => void;
  suffix?: boolean;
}

const NSelect: FC<NSelectProps> = ({
  options,
  onSelect,
  suffix,
  ...popoverProps
}) => {
  const [opening, setOpening] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option>();

  // Trigger
  const triggerNode = suffix ? (
    <Flex
      justify="space-between"
      cursor="pointer"
      minWidth="180px"
      borderRadius={3}
      borderWidth={1}
      onClick={() => setOpening(true)}
    >
      <Flex align="center" minWidth={99} flex={2} paddingX={3} paddingY={3}>
        <Text>{selectedOption?.title ?? options[0].title}</Text>
      </Flex>
      <Center flex={1} paddingX={4} paddingY={2} backgroundColor={colors.bg.light1}>
        <Icon color={colors.text.gray} as={opening ? IoMdArrowDropup : IoMdArrowDropdown} />
      </Center>
    </Flex>
  ) : (
    <Box
      paddingX={4}
      paddingY={2}
      backgroundColor="white"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      width="180px"
      borderRadius={3}
      cursor="pointer"
      boxShadow="base"
      onClick={() => setOpening(true)}
    >
      <Text>{selectedOption?.title ?? options[0].title}</Text>
      <Icon color={colors.text.gray} as={opening ? IoMdArrowDropup : IoMdArrowDropdown} />
    </Box>
  );

  // events
  const handleSelect = (index: number) => {
    onSelect?.(options[index].value);
    setSelectedOption(options[index]);
    setOpening(false);
  };

  // option
  const renderOption = ({ title, value }: Option, index: number) => (
    <Box
      color={colors.text.gray}
      _hover={{ color: colors.text.black }}
      cursor="pointer"
      onClick={() => handleSelect(index)}
      textAlign="center"
      userSelect="none"
      paddingX={4}
      key={title}
    >
      <Text>{title}</Text>
    </Box>
  );

  const Options = <Stack paddingY={2}>{options.map(renderOption)}</Stack>;

  return (
    <Popover
      placement="bottom-end"
      size="sm"
      variant="menu"
      isOpen={opening}
      onClose={() => setOpening(false)}
      {...popoverProps}
    >
      <PopoverTrigger>{triggerNode}</PopoverTrigger>
      <PopoverContent maxWidth="200px" _focus={{ boxShadow: 'none' }} padding="0">
        <PopoverArrow />
        <PopoverBody>{Options}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NSelect;
