import { getTimestamp } from '../api/polka';

export const queryTimestamp = async () => {
  const res = await getTimestamp();
  // console.log(res);
  return res;
};

export const queryItem = () => {
  return '';
};
