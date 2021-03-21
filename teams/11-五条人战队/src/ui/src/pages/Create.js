import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSubstrate, useAccounts } from '../substrate-lib';
import { web3FromSource } from '@polkadot/extension-dapp';
import Loading from '../components/Loading';


const Create = (props) => {
    let { api, apiState } = useSubstrate();
    let { account } = useAccounts();

    let [formData, setFormData] = useState({
        title: '',  OptionA: '',  OptionB: '',  description: ''
    });

    const getFromAcct = async (accountPair) => {
        const {
            address,
            meta: { source, isInjected }
        } = accountPair;
        let fromAcct;

        // signer is from Polkadot-js browser extension
        if (isInjected) {
            const injected = await web3FromSource(source);
            fromAcct = address;
            api.setSigner(injected.signer);
        } else {
            fromAcct = accountPair;
        }

        return fromAcct;
    };

    useEffect(() => {
        if (apiState === 'READY') {
            let metaArgs = api.tx.proposalModule.proposalSet.meta.args;
            let paramFields = {}
            metaArgs.forEach(arg => {
                let name = arg.name.toString();
                paramFields[name] = ''
            });
            setFormData(paramFields);
        }
    }, [api, apiState]);

    const formHandle = (event, type) => {
        let oldForm = { ...formData };
        oldForm[type] = event.target.value;
        setFormData(oldForm);
    }

    const [isPulling, setIsPulling] = useState(false);

    const createHandle = async () => {
        if (isPulling) return;
        setIsPulling(true);
        try {
            const fromAcct = await getFromAcct(account);
            let formValue = Object.keys(formData).map(k => {
                return formData[k];
            });
            console.log(formValue);
            const txExecute = api.tx.proposalModule.proposalSet(...formValue)

            await txExecute.signAndSend(fromAcct, ({ status }) => {
                // clear数据
                setFormData({});
                if (status.isFinalized) {
                    // console.log('创建成功');
                    setIsPulling(false);
                    setFormData({ title: '',  OptionA: '',  OptionB: '',  description: '' });
                }
            })
            .catch(err => {
                setIsPulling(false);
            });

        } catch (error) {
            setIsPulling(false);
        }
        
    }

    // console.log(props);
    return <div className={props.className}>
        <h3>Create proposal</h3>
        <div className="flex-center-center form-data">
            <div className="flex-align-center form-item">
                <span className="label">Name of proposal:</span>
                <input type="text" disabled={isPulling} value={formData.title}
                    placeholder="Please enter Name of proposal" onInput={(e) => formHandle(e, 'title')} />
            </div>
            <div className="flex-align-center form-item">
                <span className="label">Option A:</span>
                <input type="text" disabled={isPulling} value={formData.OptionA}
                    placeholder="Please enter Option A" onInput={(e) => formHandle(e, 'OptionA')} />
            </div>
            <div className="flex-align-center form-item">
                <span className="label">Option B:</span>
                <input type="text" disabled={isPulling} value={formData.OptionB}
                    placeholder="Please enter Option B" onInput={(e) => formHandle(e, 'OptionB')} />
            </div>
            <div className="flex-align-center form-item">
                <span className="label">Detailed description of your proposal:</span>
                <textarea className="form-textarea" disabled={isPulling} value={formData.description}
                    placeholder="Please enter description of your proposal" onInput={(e) => formHandle(e, 'description')}></textarea>
            </div>
            <div className="form-item form-submit">
                <button onClick={() => createHandle()} disabled={isPulling}>{isPulling?'submitting...':'create'}</button>
            </div>
        </div>

        {
            isPulling
            ?<Loading />
            :null
        }
    </div>
};


export default React.memo(styled(Create)`
    margin: 30px auto 0;
    width: 600px;

    h3 {
        font-size: 35px;
        text-align: center;
    }

    .form-data {
        margin: 0 auto;
        flex-direction: column;
    }

    .form-item {
        margin: 10px 0;

        .label {
            width: 120px;
            text-align: right;
            font-size: 18px;
            padding-right: 20px;
        }
    }

    .form-submit {
        margin-top: 30px;
        padding-left: 140px;
    }
`);