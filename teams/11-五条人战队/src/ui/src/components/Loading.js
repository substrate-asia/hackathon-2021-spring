import React from 'react';
import styled from 'styled-components';
import LoadingSvg from '../assets/loading.svg';

function Loading(props) {


    return <div className={props.className}>
        <img src={LoadingSvg} alt="" />
    </div>
}

export default React.memo(styled(Loading)`
    position: fixed;
    left: 0;
    top: 0;
    z-index: 999;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0,0,0,.5);

    img {
        width: 100px;
        height: 100px;
        animation: loading 2s linear infinite;
        animation: name duration timing-function delay iteration-count direction fill-mode;
    }

    @keyframes loading {
        0% {
            transform: rotateZ(0deg);
        }
        100% {
            transform: rotateZ(360deg);
        }
    }
`);