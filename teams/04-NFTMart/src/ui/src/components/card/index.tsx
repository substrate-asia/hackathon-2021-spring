import React, { FC } from 'react';
import { HTMLChakraProps, Box, Heading, Divider } from '@chakra-ui/react';
import colors from '../../themes/colors';


export const CardHead: FC<HTMLChakraProps<'div'>> = ({ children, ...restProps }) => (
  <Box paddingX={4}>
    <Box paddingY={4}>
      <Heading as="h4" size="md" color={colors.text.black}>
        {children}
      </Heading>
    </Box>
  </Box>
);

export const CardBody: FC<HTMLChakraProps<'div'>> = ({ children, ...restProps }) => (
  <Box paddingX={4}>
    <Box paddingY={4}>{children}</Box>
  </Box>
);

export interface CardProps {
  title?: React.ReactNode;
  body?: React.ReactNode;
  noHeadBorder?: boolean;
}

const Card: FC<Omit<HTMLChakraProps<'div'>, 'title'> & CardProps> = ({
  title,
  noHeadBorder = false,
  body,
  children,
  ...restProps
}) => {
  return (
    <Box borderRadius="3px" backgroundColor="white" padding={0} {...restProps}>
      {title && <CardHead>{title}</CardHead>}
      {title && !noHeadBorder && <Divider borderColor={colors.divider.dark} />}
      {body || <CardBody>{children}</CardBody>}
    </Box>
  );
};

export default Card;
