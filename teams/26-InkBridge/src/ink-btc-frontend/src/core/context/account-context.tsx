import React from 'react';
import type { AccountProps } from '../types/account';

const AccountContext: React.Context<AccountProps> = React.createContext(({} as unknown) as AccountProps);

export { AccountContext };
