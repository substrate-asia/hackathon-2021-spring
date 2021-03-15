import { Result, Button } from 'antd';
import Router from "next/router";
import FaucetCss from "../../styles/Faucet.module.css";

function Successful(){
    return (
        <div>
            <Result
                status="success"
                title="Successfully get 100 Sgc on Substrate Game Chain!"
                subTitle="you can see at Check Button"
                extra={[
                    <Button type="primary" onClick={()=>{Router.push('/post/Faucet').then()}} key="console">
                        Return
                    </Button>,
                    <Button  onClick={()=>{Router.push('https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fsubstrate.org.cn%3A4443#/accounts').then()}} key="console">
                        Check
                    </Button>

                ]}
                style={{paddingTop:'100px'}}
            />
            <footer className={FaucetCss.footer} style={{marginTop:"400px",paddingLeft:'830px'}}>
                <a
                    href="https://github.com/Web3-Substrate-Game-World"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Powered by{' '}
                    <img src="/images/logo.svg" alt="SGC Logo" className={FaucetCss.logo} />
                </a>
            </footer>
        </div>

    );
}

export default Successful
