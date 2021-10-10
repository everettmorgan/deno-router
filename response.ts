import {Request} from './request.ts';

class Response {
  private request: Request;
  private _status: number;
  private _sent: boolean;

  headers: Headers;

  constructor(request: Request) {
    this._status = 200;
    this._sent = false;
    this.request = request;
    this.headers = new Headers();
  }

  private respond(text?: string) {
    if (this._sent) {
      throw new Error('Attempting to respond to a request more than once.')
    }

    this.request._req.respond({
      status: this._status,
      headers: this.headers,
      body: text ?? ''
    })

    this._sent = true;
  }

  Status(code: number) {
    this._status = code;
    return this;
  }

  Send(text?: string) {
    if (text && typeof text !== 'string') {
      throw new Error(`Expected string, received ${typeof text}`)
    }
    this.respond(text);
  }

  JSON(body?: any) {
    this.respond(JSON.stringify(body ?? {}));
  }
}

export { Response };