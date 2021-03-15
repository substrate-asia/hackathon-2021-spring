import React, { useState, useEffect } from 'react';

import { Menu, Dropdown, Modal } from 'semantic-ui-react';

import { useSubstrate } from '../../substrate-lib';
import {
  StyledContainer,
  StyledLabel,
  StyledTitle,
  StyledButton
} from './styled';

import { icons } from '../../icons/icons';

function exampleReducer (state, action) {
  switch (action.type) {
    case 'close':
      return { open: false };
    case 'open':
      return { open: true, size: action.size };
    default:
      throw new Error('Unsupported action...');
  }
}

function Main (props) {
  const { keyring } = useSubstrate();
  const { setAccountAddress } = props;
  const [accountSelected, setAccountSelected] = useState('');
  const [state, dispatch] = React.useReducer(exampleReducer, {
    open: false,
    size: undefined
  });
  const { open, size } = state;

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase()
    // color: "violet",
  }));

  const initialAddress =
    keyringOptions.length > 0 ? keyringOptions[0].value : '';

  // Set the initial address
  useEffect(() => {
    setAccountAddress(initialAddress);
    setAccountSelected(initialAddress);
  }, [setAccountAddress, initialAddress]);

  const onChange = (address) => {
    // Update state with new account address
    setAccountAddress(address);
    setAccountSelected(address);
  };
  return (
    <>
      <Menu
        attached="top"
        tabular
        style={{
          // backgroundColor: theme.colors.primaryBackground,
          borderColor: 'rgb(25, 32, 37, 0)',
          borderSize: '0px',
          paddingTop: '1.5em',
          paddingBottom: '1em'
        }}
      >
        <StyledContainer fluid={true}>
          <Menu.Menu position="left" style={{ alignItems: 'center' }}>
            {/* <Logo href="http://localhost:8000/">Parallel Finance</Logo> */}
            {icons.Logo}
          </Menu.Menu>
          <Menu.Menu position="right" style={{ alignItems: 'center' }}>
            {!accountSelected
              ? (
              <span>
                Add your account with the{' '}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/polkadot-js/extension"
                >
                  Polkadot JS Extension
                </a>
              </span>
                )
              : null}

            <StyledLabel
              onClick={() => dispatch({ type: 'open', size: 'tiny' })}
            >
              {accountSelected.substr(0, 5)}...{accountSelected.substr(43, 5)}
            </StyledLabel>
          </Menu.Menu>
        </StyledContainer>
      </Menu>
      <Modal
        size={size}
        open={open}
        onClose={() => dispatch({ type: 'close' })}
      >
        <Modal.Content>
          <StyledTitle>Select Your Wallet:</StyledTitle>
          <Dropdown
            search
            selection
            placeholder="Select an account"
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value);
            }}
            value={accountSelected}
          />
          <StyledButton
            primary
            floated="right"
            onClick={() => dispatch({ type: 'close' })}
          >
            Confirm
          </StyledButton>
        </Modal.Content>
        <Modal.Actions></Modal.Actions>
      </Modal>
    </>
  );
}

export default function AccountSelector (props) {
  const { api, keyring } = useSubstrate();
  return keyring.getPairs && api.query ? <Main {...props} /> : null;
}
