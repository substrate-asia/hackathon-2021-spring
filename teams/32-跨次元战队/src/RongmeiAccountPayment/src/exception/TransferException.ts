export class TransferException extends Error {
  body: string;

  constructor() {
    super();
    this.body = "transfer failed";
  }
}