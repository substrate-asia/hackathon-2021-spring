export class SMSException extends Error {
  body: string;

  constructor() {
    super();
    this.body = "message send failed";
  }
}