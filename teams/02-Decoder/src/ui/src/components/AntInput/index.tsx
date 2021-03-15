import React, { FC } from 'react';
import { Input, InputProps } from 'antd';

export interface AntInputProps extends InputProps {}
export const AntInput: FC<AntInputProps> = ({
  ...props
}) => {
  return (
    <Input
      {...props}
    />
  )
}