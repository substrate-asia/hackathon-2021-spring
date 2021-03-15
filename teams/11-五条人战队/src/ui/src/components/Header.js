import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import Accounts from './Accounts';

function Header(props) {
    let {className} = props;

    const routers = [
        {text: 'Create', to: '/'},
        {text: 'Issue', to: '/issue'},
    ];

    return <div className={className}>
        <div className="flex">
            <Logo />
            <div className="nav">
                {
                    routers.map(r => <Link 
                        className={ 'nav-item ' + (props.location.pathname===r.to?'active':'')} 
                        to={r.to} key={r.to}>{r.text}</Link>)
                }
            </div>
        </div>
       
        <Accounts className="last-item" />
    </div>
}

export default React.memo(styled(Header)`
    display: flex;
    padding: 20px 60px 20px;
    justify-content: space-between;

    .nav {
        display: flex;
        align-items: center;
        font-size: 22px;

        .nav-item {
            margin: 0 10px 0 60px;
            text-decoration: none;
            color: #222;
            cursor: pointer;
            transition: all .25s;

            &.active {
                color: #ccc;
                cursor: default;
                transition: all .25s;
            }
        }
    }
`)