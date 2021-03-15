import React, { FC } from 'react';
import { Avatar, Stack, StackProps, Text, TextProps } from '@chakra-ui/react';
import colors from '../../../themes/colors';

export interface MetaProps extends StackProps {
  avatar?: string;
  description?: string;
  who?: string;
  whoProps?: TextProps;
}

const Meta: FC<MetaProps> = ({ avatar, description, who, whoProps, ...stackProps }) => (
  <Stack direction="row" alignItems="center" cursor="pointer" userSelect="none" {...stackProps}>
    {avatar && <Avatar width={6} height={6} src={avatar} />}{' '}
    <Text color={colors.text.gray}>{description}</Text>
    <Text as="span" color={colors.primary} {...whoProps}>
      {who}
    </Text>
  </Stack>
);

export default Meta;
