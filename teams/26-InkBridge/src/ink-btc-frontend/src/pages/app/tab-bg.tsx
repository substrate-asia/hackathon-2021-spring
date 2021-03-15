import React, { FC, ReactElement } from 'react';
import './tab-bg.css';

export const TabBg: FC<{ rotate?: boolean }> = ({ rotate = false }): ReactElement => {
  return (
    <div className="tab-bg" style={{ transform: rotate ? 'rotate(180deg)' : 'rotate(0deg)', }}></div>
  );
};