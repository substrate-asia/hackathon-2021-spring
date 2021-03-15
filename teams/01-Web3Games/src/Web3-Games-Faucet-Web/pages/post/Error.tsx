import { Result, Button, Typography } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import Router from "next/router";
import FaucetCss from "../../styles/Faucet.module.css";

const { Paragraph, Text } = Typography;

function Error(){
    return (
        <div>
            <Result
                status="error"
                title="Get SGC Fail"
                subTitle="Please check your address."
                extra={[
                    <Button type="primary" onClick={()=>{Router.push('/post/Faucet').then()}} key='console'>
                        Return
                    </Button>
                ]}
                style={{paddingTop:'100px'}}
            >
                <div className="desc">
                    <Paragraph>
                        <Text
                            strong
                            style={{
                                fontSize: 16,
                            }}
                        >
                            The content you submitted has the following error:
                        </Text>
                    </Paragraph>
                    <Paragraph>
                        <CloseCircleOutlined style={{color:"red"}} /> Your address legend not equal 48 Places.
                    </Paragraph>
                    <Paragraph>
                        <CloseCircleOutlined style={{color:"red"}} /> Your address is not add in Substrate Game Chain
                    </Paragraph>
                </div>
            </Result>
            <footer className={FaucetCss.footer} style={{marginTop:"200px",paddingLeft:'830px'}}>
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

export default Error
