export class AccountAlreadyExistsException extends Error {
  body: string;

  constructor() {
    super();
    this.body = "account already exists";
  }
}
