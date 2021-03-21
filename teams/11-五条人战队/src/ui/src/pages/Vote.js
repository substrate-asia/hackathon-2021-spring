import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import {useAccounts, useSubstrate, getFromAcct} from '../substrate-lib';
import Loading from '../components/Loading';

function Vote(props) {
    const {api, apiState} = useSubstrate();
    const { account } = useAccounts();
    // 议题id
    const voteId = parseInt(props.match.params.id);

    const [proposal, setProposal] = useState({});
    const [curVote, setCurVote] = useState();
    const [isVoted, setIsVoted] = useState(false);
    const [isVoting, setIsvoting] = useState(false);
    const [chainMassage, setChainMassage] = useState('');
    const [isMyPropos, setIsMyPropos] = useState([]);

    const getProposalInfo = useCallback(() => {
        let action = api.query.proposalModule.proposal;
        action(voteId||0, (result) => {
            if (!result.isNone) {
                setProposal(result.toJSON());
            }
        });
    }, [api, voteId, setProposal]);

    

    // 切换账号
    useEffect(() => {
        setCurVote('');
        setIsvoting(false);
        setIsVoted(false);
        setChainMassage('');

        if (!api) return;

        const checkMyPropos = () => {
            api.query.proposalModule.proposalResult(voteId, result => {
                if (!result.isNone) {
                    setCurVote(result.toJSON());
                }
                setIsVoted(!result.isNone);
            })
        }

        let mod = api.query.proposalModule;
        // 当前账户的议题
        account && account.address && 
        mod.accountIdCreatedProposal(account.address, (result) => {
            console.log('accountIdProposal', result.toJSON());
            if (!result.isNone) {
                const myPops = result.toJSON();
                const isMyself = myPops.find(i => i===voteId) !== undefined;
                setIsMyPropos(isMyself);
                console.log('isMyself', isMyself);
                if (isMyself) checkMyPropos();
            }
        });

    }, [account, api, voteId, setCurVote]);

    // 初始化数据
    useEffect(() => {
        if (apiState === 'READY') {
            getProposalInfo();
        }
    }, [api, apiState, getProposalInfo, setProposal]);

    

    // 查询当前用户投票情况
    useEffect(() => {
        if (apiState === 'READY' && api && account && proposal.title) {
            !isMyPropos &&
            api.query.proposalModule
                .accountIdProposal(account.address, (voteId||0), result => {
                    if (!result.isNone) {
                        const rJSON = result.toJSON();
                        const accountVoted = Object.keys(rJSON).find(v => {
                            if (rJSON[v]>0) {
                                setCurVote(v);
                                return true;
                            } else {
                                return false;
                            }
                        });
                        setIsVoted(!!accountVoted);
                    }
                });
        }
    }, [account, api, apiState, proposal, voteId, isMyPropos, setIsVoted]);

    const selectOption = (value) => {
        console.log(value);
        setCurVote(value);
    }

    const vote = async () => {
        if (isVoting) return;
        setIsvoting(true);
        const formAcct = await getFromAcct(account);

        const action = isMyPropos ? 'uploadresult' : 'vote';
        const formData = isMyPropos ? [voteId, curVote] : [voteId, curVote, 1]

        const txExecute = api.tx.proposalModule[action](...formData);
        txExecute.signAndSend(formAcct, ({status}) => {
            if (status.isFinalized) {
                getProposalInfo();
                setIsvoting(false);
            }
        })
        .catch(err => {
            setChainMassage(err.message);
            setCurVote('');
            setIsvoting(false);
        });
    }


    const [disabled, setDisabled] = useState(false);
    useEffect(() => {
        if (isVoting || isVoted ) {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
    }, [isVoting, isVoted, setDisabled]);


    return <div className={props.className}>
        <h3>Name of proposal: {proposal.title}</h3>
        <p className="proposal-dec">description：{proposal.dec}</p>
        <div className="proposal-table">
            <div className="proposal-option">
                <div className="opt-item">
                    <label className="opt-label">
                        <input type="radio" 
                            name="option" value="A"
                            checked={curVote==='A'}
                            disabled={disabled}
                            onChange={() => selectOption('A')} />
                        <span>option A: {proposal.VoteNum && proposal.VoteNum.A} vote</span>
                    </label>
                    <div className="opt-dec">{proposal.OptionA}</div>
                </div>

                <div className="opt-item">
                    <label className="opt-label">
                        <input type="radio" 
                            name="option" value="B" 
                            checked={curVote==='B'}
                            disabled={disabled}
                            onChange={() => selectOption('B')} />
                        <span>option B: {proposal.VoteNum && proposal.VoteNum.B} vote</span>
                    </label>
                    <div className="opt-dec">{proposal.OptionB}</div>
                </div>
            </div>
        </div>
        <div className="vote-submite">
            {
                !isMyPropos
                ? <button disabled={isVoting|| !curVote || isVoted} onClick={vote}>
                    {
                        isVoted ? "voted" : 'Vote'
                    }
                    {isVoting?'...':''}
                </button>
                :<button disabled={isVoting|| !curVote || isVoted} onClick={vote}>
                    {
                        isVoted 
                        ? isVoting ? 'submitting' : 'Results uploaded' 
                        : "Upload results now" 
                    }
                    {isVoting?'...':''}
                </button>
            }
        </div>
        <div className="chain-message">{chainMassage}</div>
        {
            isVoting? <Loading /> : null
        }
    </div>
}

export default React.memo(styled(Vote)`
    margin: 30px auto 0;
    width: 600px;

    .proposal-table {
        display: flex;
        flex-direction: column;
    }
    .proposal-dec {
        margin: 3px 0 30px;
        padding: 8px 10px;
        font-size: 14px;
        color: #999;
        border: 1px solid #ccc;
    }
    .opt-item {
        margin: 0 0 40px 0;
        padding: 0 0 5px;
        border-bottom: 1px solid #ccc;
        

        .opt-label {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        .opt-dec {
            font-size: 12px;
            text-indent: 40px;
            color: #999;
        }
    }

    .option-item {
        margin: 0 0 20px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #999;
        border-radius: 5px;
        height: 50px;
        cursor: pointer;

        /* &:hover {
            transform: scale3d(1.01, 1.01, 1.01);
        } */

        &.selected {
            border-color: #0932ff;
            color: #0932ff;

            span:first-child {
                border-color: #0932ff;
            }
        }

        span {
            box-sizing: border-box;
            padding: 10px;

            &:first-child {
                flex-shrink:0;
                width: 120px;
                border-right: 1px solid #666;
                text-align: right;
                line-height: 1.8;
            }

            &:last-child {
                flex: 1;
            }
        }
    }

    .chain-message {
        margin: 20px 0;
        padding: 5px 10px;
        color: red;
    }
`);