import React from 'react';
import type { ApiProps } from '../types/api';

const ApiContext: React.Context<ApiProps> = React.createContext(({} as unknown) as ApiProps);

export { ApiContext };
  