import React, { FC, ReactElement } from 'react';
import './no-address.css';

export const NoAddress: FC = (): ReactElement => {
  return (
    <div className="area">
      <div className="no-address">
        <span>—— No address Available ——</span>
      </div>
    </div>
  );
};