import { SubmittableResult } from '@polkadot/api';
import type { AccountId, Address, DispatchError } from '@polkadot/types/interfaces';
import type { ITuple } from '@polkadot/types/types';

interface StatusCount {
  count: number;
  status: ActionStatusPartial;
}

const EVENT_MESSAGE = 'extrinsic event';

export type Actions = 'create' | 'edit' | 'restore' | 'forget' | 'backup' | 'changePassword' | 'transfer';

export interface ActionStatusBase {
  account?: AccountId | Address | string;
  message?: string;
  status: 'error' | 'event' | 'queued' | 'received' | 'success';
  result: SubmittableResult;
}

export interface ActionStatusPartial extends ActionStatusBase {
  action: Actions | string;
}

export interface ActionStatus extends ActionStatusBase {
  action: Actions | string | string[];
}

export function mergeStatus(status: ActionStatusPartial[]): ActionStatus[] {
  let others: ActionStatus | null = null;

  const initial = status
    .reduce((result: StatusCount[], status): StatusCount[] => {
      const prev = result.find(({ status: prev }) => prev.action === status.action && prev.status === status.status);

      if (prev) {
        prev.count++;
      } else {
        result.push({ count: 1, status });
      }

      return result;
    }, [])
    .map(
      ({ count, status }): ActionStatusPartial =>
        count === 1 ? status : { ...status, action: `${status.action} (x${count})` }
    )
    .filter((status): boolean => {
      if (status.message !== EVENT_MESSAGE) {
        return true;
      }

      if (others) {
        if (status.action.startsWith('system.ExtrinsicSuccess')) {
          (others.action as string[]).unshift(status.action);
        } else {
          (others.action as string[]).push(status.action);
        }
      } else {
        others = {
          ...status,
          action: [status.action]
        };
      }

      return false;
    });

  return others ? initial.concat(others) : initial;
}

export function extractEvents(result: SubmittableResult): ActionStatus[] {
  return mergeStatus(
    ((result && result.events) || [])
      // filter events handled globally, or those we are not interested in, these are
      // handled by the global overview, so don't add them here
      .filter((record): boolean => !!record.event && record.event.section !== 'democracy')
      .map(
        ({ event: { data, method, section } }): ActionStatusPartial => {
          if (section === 'system' && method === 'ExtrinsicFailed') {
            const [dispatchError] = (data as unknown) as ITuple<[DispatchError]>;
            let message = dispatchError.type;

            if (dispatchError.isModule) {
              try {
                const mod = dispatchError.asModule;
                const error = dispatchError.registry.findMetaError(mod);

                message = `${error.section}.${error.name}`;
              } catch (error) {
                // swallow
              }
            }

            return {
              action: `${section}.${method}`,
              message,
              status: 'error',
              result
            };
          } else if (section === 'contracts') {
            if (method === 'ContractExecution' && data.length === 2) {
              // see if we have info for this contract
              // const [accountId, encoded] = data;
              // try {
              //   const abi = getContractAbi(accountId.toString());
              //   if (abi) {
              //     const decoded = abi.decodeEvent(encoded as Bytes);
              //     return {
              //       action: decoded.event.identifier,
              //       message: 'contract event',
              //       status: 'event'
              //     };
              //   }
              // } catch (error) {
              //   // ABI mismatch?
              //   console.error(error);
              // }
            } else if (method === 'Evicted') {
              return {
                action: `${section}.${method}`,
                message: 'contract evicted',
                status: 'error',
                result
              };
            }
          }

          return {
            action: `${section}.${method}`,
            message: EVENT_MESSAGE,
            status: 'event',
            result
          };
        }
      )
  );
}

const NOOP = () => void 0;

type TxStatus =
  | 'future'
  | 'ready'
  | 'finalized'
  | 'finalitytimeout'
  | 'usurped'
  | 'dropped'
  | 'inblock'
  | 'invalid'
  | 'broadcast'
  | 'cancelled'
  | 'completed'
  | 'error'
  | 'incomplete'
  | 'queued'
  | 'qr'
  | 'retracted'
  | 'sending'
  | 'signing'
  | 'sent'
  | 'blocked';

type Callbacks = {
  txFailedCb?: (result: ActionStatus[]) => void;
  txSuccessCb?: (result: ActionStatus[]) => void;
  txUpdateCb?: (result: ActionStatus[]) => void;
};

export function handleTxResults(
  handler: 'send' | 'signAndSend',
  { txFailedCb = NOOP, txSuccessCb = NOOP, txUpdateCb = NOOP }: Callbacks,
  unsubscribe: () => void
): (result: SubmittableResult) => void {
  return (result: SubmittableResult): void => {
    if (!result || !result.status) {
      return;
    }

    txUpdateCb(extractEvents(result));

    if (result.status.isFinalized || result.status.isInBlock) {
      result.events
        .filter(({ event: { section } }) => section === 'system')
        .forEach(({ event: { method } }): void => {
          if (method === 'ExtrinsicFailed') {
            txFailedCb(extractEvents(result));
          } else if (method === 'ExtrinsicSuccess') {
            txSuccessCb(extractEvents(result));
          }
        });
    } else if (result.isError) {
      txFailedCb(result as any);
    }

    if (result.isCompleted) {
      unsubscribe();
    }
  };
}
