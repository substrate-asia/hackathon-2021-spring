import React, { FC, ReactElement } from 'react';
import './back.css';
import BackImg from '../../assets/back.webp';

interface IProp {
  onBack(): void;
}

export const BackTo: FC<IProp> = ({ onBack }): ReactElement => {
  return (
    <div className="back-area" onClick={ onBack }>
      <div className="back-holder">
        <img src={BackImg} alt="" />
        <span className="back">Back</span>
      </div>
    </div>
  );
};