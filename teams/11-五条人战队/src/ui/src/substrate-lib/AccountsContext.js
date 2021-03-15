import React, { useState, useContext, createContext } from 'react';

const AccountsContext = createContext();

const AccountsContextProvider = (props) => {
    const [account, setAccount] = useState(null);

    return (
        <AccountsContext.Provider value={{account, setAccount}}>
            {props.children}
        </AccountsContext.Provider>
    );
};

const useAccounts = () => ({ ...useContext(AccountsContext) });

export {
    AccountsContextProvider,
    useAccounts
}