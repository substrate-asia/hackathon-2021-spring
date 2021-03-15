import { Result, Button } from 'antd';
import Router from 'next/router'
import FaucetCss from "../../styles/Faucet.module.css";

function Waring(){
    return (
        <div>
        <Result
            status="warning"
            title="You Already Get 100 SGC Today."
            extra={
                <Button type="primary" onClick={()=>{Router.push('/post/Faucet').then()}}>
                    Return
                </Button>
            }
            style={{paddingTop:'100px'}}
        ></Result>
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

export default Waring
