import React, {useState} from "react";
import {message, Modal} from "antd";
import Codebox from '@axetroy/react-codebox';
import {validatePayCode} from "@/services/user";
import ForgetPayModal from "@/components/ForgetPayModal";

export interface PayModalProps {
  onOk: () => void;
  onCancel?: () => void;
  isPayNumModalVisible: boolean;
}

const PayModal: React.FC<PayModalProps> = (props) => {
  const [isForgetPayNumModalVisible, setIsForgetPayNumModalVisible] = useState<boolean>(false);
  return (
    <div>
      <Modal
        visible={props.isPayNumModalVisible}
        onCancel={() => {
          if (props.onCancel) {
            props.onCancel()
          }
        }}
        footer={null}
      >
        <div style={{textAlign: 'center', marginTop: '20px'}}>
          <p style={{fontSize: '30px'}}>请输入支付密码</p>
          <Codebox
            type="password"
            length={6}
            validator={(input: string, index: number) => {
              return /\d/.test(input);
            }}
            onChange={async (codeArray: any) => {
              let payNum: string = codeArray.join('');
              if (payNum.length >= 6) {
                const res = await validatePayCode(payNum);
                if (res.infoCode === 10000) {
                  props.onOk();
                } else {
                  message.error("支付密码错误，请重新输入")
                }
              }
            }}
          />
          <a onClick={()=>{setIsForgetPayNumModalVisible(true)}} style={{marginTop: '20px'}}>忘记或未注册交易码？</a>
        </div>
      </Modal>
      <ForgetPayModal onOk={() => {
        setIsForgetPayNumModalVisible(false);
      }} isForgetPayNumModalVisible={isForgetPayNumModalVisible}/>
    </div>
  );
};

export default PayModal;

