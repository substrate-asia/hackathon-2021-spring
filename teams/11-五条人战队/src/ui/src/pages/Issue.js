import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import { useSubstrate, useAccounts } from '../substrate-lib'

function Issue(props) {
    const {api, apiState} = useSubstrate();
    const {account} = useAccounts();

    const [issues, setIssues] = useState([]);
    const [accountPID, setAccountPID] = useState([]);

    // 
    useEffect(() => {
        if (apiState === 'READY') {
            let mod = api.query.proposalModule;

            // 所有议题
            const getAllProposalIndex = async (action, query) => {
                await action(...query, async (result) => {
                    if (!result.isNone) {
                        let issList = result.map(pos => mod.proposal(...pos.words));
                        let resultList = await Promise.all(issList)
                        let allIssues = resultList.map(i => i.toJSON());
                        console.log(allIssues);
                        setIssues(allIssues);
                    }
                });
            };
            getAllProposalIndex(mod.allProposalIndex, []);
            
            // 当前账户的议题
            account && account.address && 
            mod.accountIdCreatedProposal(account.address, (result) => {
                console.log('accountIdProposal', result.toJSON());
                if (!result.isNone) {
                    setAccountPID(result.toJSON());
                }
            });
        }
    }, [api, apiState, account]);

    return <div className={props.className}>
        <h3>All the proposals</h3>
        <ul>
            {issues.map(iss => <li key={iss.id}>
                {
                    accountPID.find(i => i===iss.id) !== undefined
                    ? <span className="self-propos">My proposal</span>
                    : null
                }
                <Link className="" to={'/vote/'+iss.id}>
                    <span>ID: {iss.id}</span>
                    <span>title: {iss.title}</span>
                    <span>Option A: {iss.OptionA}</span>
                    <span>Option B: {iss.OptionB}</span>
                </Link>
            </li>)}
        </ul>
    </div>
};

export default React.memo(styled(Issue)`
    padding: 30px 0 0;

    h3 {
        margin: 0 auto;
        width: 600px;
        font-size: 24px;
    }

    ul {
        padding: 10px 0 0;
        list-style: none;

        li {
            margin: 0 auto;
            position: relative;
            width: 600px;
            padding: 10px 0;

            .self-propos {
                position: absolute;
                left: 8px;
                top: 5px;
                display: block;
                padding: 0 5px;
                border-radius: 5px;
                border: 1px solid #ccc;
                font-size: 12px;
                color: orange;
            }

            &>a {
                display: flex;
                justify-content: space-between;
                height: 40px;
                padding: 5px 10px;
                line-height: 40px;
                font-size: 16px;
                color: #222;
                text-decoration: none;
            }

            &:not(:last-child) {
                border-bottom: 1px solid #ccc;
            }

            span {
                display: inline-block;
                
                &:first-child {
                    font-weight: bold;
                }
            }
        }
    }
`);