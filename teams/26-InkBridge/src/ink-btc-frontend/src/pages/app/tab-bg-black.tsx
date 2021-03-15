import React, { FC, ReactElement } from 'react';
import './tab-bg-black.css';

export const TabBgBlack: FC<{ rotate?: boolean }> = ({ rotate = false }): ReactElement => {
  console.log('TabBgBlack')
  return (
    <div className="tab-bg-black" style={{ transform: rotate ? 'rotate(180deg)' : 'rotate(0deg)', }}></div>
  );
};