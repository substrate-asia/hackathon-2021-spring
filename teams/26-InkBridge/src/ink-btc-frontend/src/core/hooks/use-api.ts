import { useContext } from 'react';
import { ApiContext } from '../context/api-context';
import { ApiProps } from '../types/api';

export function useApi(): ApiProps {
  return useContext(ApiContext);
}
