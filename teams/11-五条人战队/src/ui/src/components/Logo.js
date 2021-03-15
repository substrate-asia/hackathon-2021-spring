import React from 'react'
import logo from '../assets/logo.svg';
import styled from 'styled-components';

const Logo = ({className}) => (
    <div className={className}>
        <img className="logo-img" src={logo} alt="" />
        <span>P Market</span>
    </div>
)

export default React.memo(styled(Logo)`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 28px;
    font-weight: 600;
    color: #154352;

    .logo-img {
        margin-right: 6px;
        width: 30px;
        height: 30px;
    }
`);