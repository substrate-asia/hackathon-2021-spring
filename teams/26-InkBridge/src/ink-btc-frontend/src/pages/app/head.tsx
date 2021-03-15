import { FC, ReactElement } from 'react';
import './head.css';
import Logo from '../../assets/logo.webp';
import { useAccount } from '../../core/hooks/use-account';
export const Head: FC = (): ReactElement => {
  const { accounts, setCurrentAccount, currentAccount } = useAccount();

  console.log(accounts[0].meta)
  return (
    <div className="head">
        <img src={ Logo } alt="" />
        <select value={ currentAccount?.address } onChange={ e => {
          const account = accounts.find(_account => _account.address === e.target.value);
          account && setCurrentAccount(account);
        } }>
          {
            accounts.map(account =>
              <option key={account.address} style={{ height: '3rem' }} value={account.address}>
                { account.meta.name as any }
              </option>)
          }
        </select>

    </div>
  );
};