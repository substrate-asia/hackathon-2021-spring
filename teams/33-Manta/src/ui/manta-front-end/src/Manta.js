import React, { useEffect, useState } from 'react';
import { Form, Input, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

function base64ToArray(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // The transaction submission status
  const [status, setStatus] = useState(null);
  
  const initFormState = {
    palletRpc: 'mantaDap',
    callable: 'init',
    inputParams: []
  }
  
  const [formState, setFormState] = useState(initFormState);
  const [inputParamMetas, setInputParamMetas] = useState([]);
  const [paramFields, setParamFields] = useState([]);
  const { palletRpc, callable, inputParams } = formState;

  const updateInputParamMetas = () => {
    let inputParamMetas = [];
    if (callable === "init") {
      inputParamMetas = [{
        name: "init basecoin (supply)",
        state: "init",
        jstype: "number",
        type: "u64"
      }];
    } else if (callable === "mint") {
      inputParamMetas = [{
        name: "mint amount",
        state: "amount", 
        jstype: "number",
        type: "u64"
      }, {
        name: "k",
        state: "k",
        jstype: "text",
        type: "base64 string"
      }, {
        name: "s",
        state: "s",
        jstype: "text",
        type: "base64 string"
      }, {
        name: "commitment",
        state: "cm",
        jstype: "text",
        type: "base64 string"
      }];
    } else if (callable === "mantaTransfer"){
      inputParamMetas = [
      {
        name: "merkle root",
        state: "merkle_root", 
        type: "base64 string",
        jstype: "text",
        value: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
      },{
        name: "old sn",
        state: "sn_old",
        type: "base64 string"
      }, {
        name: "old k",
        state: "k_old",
        jstype: "text",
        type: "base64 string"
      }, {
        name: "new k",
        state: "k_new",
        jstype: "text",
        type: "base64 string"
      }, {
        name: "new commitment",
        state: "cm_new",
        jstype: "text",
        type: "base64 string"
      }, {
        name: "encrypted transfer amount",
        state: "enc_amount", 
        jstype: "text",
        type: "base64 string"
      }, {
        name: "proof",
        state: "proof",
        jstype: "text",
        type: "base64 string"
      }];
    } else if (callable === "forfeit") {
      inputParamMetas = [
        {
          name: "forfeit amount",
          state: "amount", 
          jstype: "number",
          type: "u64"
        },
        {
          name: "merkle root",
          state: "merkle_root", 
          type: "base64 string",
          jstype: "text",
          value: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="
        },{
          name: "old sn",
          state: "sn_old",
          type: "base64 string"
        }, {
          name: "old k",
          state: "k_old",
          jstype: "text",
          type: "base64 string"
        }, {
          name: "proof",
          state: "proof",
          jstype: "text",
          type: "base64 string"
        }];
    }
    setInputParamMetas(inputParamMetas);
    let paramFields = [];
    paramFields = inputParamMetas.map((_, ind) => true);
    setParamFields(paramFields);
  };

  useEffect(updateInputParamMetas, [api, callable]);

  const onCallableParamChange = (_, data) => {
    setFormState(formState => {
      let { state, value } = data;
      const { ind, paramMeta } = state;
      value = paramMeta.type === "base64 string" ? base64ToArray(value) : value;
      const inputParams = [...formState.inputParams];
      inputParams[ind] = value;
      return { ...formState, inputParams };
    });
  };

  const onCallableChange = (_, data) => {
    const formState = { ...initFormState, callable: data.value };
    setFormState(formState);
  };

  return (
    <Grid.Column width={8}>
      <h1> Manta DAP</h1>
      <Form>
        <Form.Group style={{ overflowX: 'auto' }} inline>
          <label>Interaction Type</label>
          <Form.Radio
            label='Init'
            name='callable'
            value='init'
            checked={callable === 'init'}
            onChange={onCallableChange}
          />
          <Form.Radio
            label='Mint'
            name='callable'
            value='mint'
            checked={callable === 'mint'}
            onChange={onCallableChange}
          />
          <Form.Radio
            label='Private Transfer'
            name='callable'
            value='mantaTransfer'
            checked={callable === 'mantaTransfer'}
            onChange={onCallableChange}
          />
          <Form.Radio
            label='Forfeit'
            name='callable'
            value='forfeit'
            checked={callable === 'forfeit'}
            onChange={onCallableChange}
          />
        </Form.Group>
        {inputParamMetas.map((paramMeta, ind) =>
          <Form.Field key={`${paramMeta.name}-${paramMeta.type}`}>
            <Input
              placeholder={paramMeta.type}
              fluid
              type={paramMeta.jstype}
              label={paramMeta.name}
              state={{ ind, paramMeta }}
              onChange={onCallableParamChange}
            />        
          </Form.Field>
        )}
        <Form.Field style={{ textAlign: 'center' }}>
          
        <TxButton
          accountPair={accountPair}
          setStatus={setStatus}
          label='Submit'
          type='SIGNED-TX'
          attrs={{ 
            palletRpc: palletRpc, 
            callable: callable,  
            inputParams: inputParams, 
            paramFields: paramFields 
          }}
        />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  );
}

export default function Manta (props) {
  const { api } = useSubstrate();
  return api.tx.mantaDap ? <Main {...props} /> : null;
}
