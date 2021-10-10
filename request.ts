import { ServerRequest } from "https://deno.land/std@0.95.0/http/server.ts";
import { readAll } from 'https://deno.land/std/io/util.ts'

class Request {
  method: string;
  path: string;
  params: Params;
  headers: Headers;
  body: Body;
  hostname: string;
  cookies: Cookies;
  _req: ServerRequest;

  constructor(request: ServerRequest) {
    const method = request.method.toLowerCase();
    const separator = request.url.indexOf('?');
    const path = request.url.slice(0, separator);
    const paramsString = request.url.slice(separator, request.url.length);

    this.path = path;
    this.method = method;
    this.headers = request.headers;
    this.params = new Params(paramsString);
    this.body = new Body(request.body);
    this._req = request;
    this.hostname = (request.conn.remoteAddr as Deno.NetAddr).hostname
    this.cookies = new Cookies(request.headers.get('cookie') as string);
  }
}

class Body {
  body: Deno.Reader;

  constructor(buf: Deno.Reader) {
    this.body = buf;
  }

  async JSON(): Promise<[any, any]> {
    const buf: Uint8Array = await readAll(this.body);
    const text = new TextDecoder().decode(buf);
    try {
      return [null, JSON.parse(text)];
    } catch (e) {
      return [e, null];
    }
  }

  async Text(): Promise<string> {
    const buf: Uint8Array = await readAll(this.body);
    const text = new TextDecoder().decode(buf);
    return text;
  }

  async Form(): Promise<Form> {
    const buf: Uint8Array = await readAll(this.body);
    const text = new TextDecoder().decode(buf);
    return new Form(text);
  }
}

class Form {
  private map: Generic.KeyValue<string>;

  constructor(str: string) {
    this.map = {};

    const params = str.split('&');
    params.forEach((param: string) => {
      const [ key, val ] = param.split('=');
      this.map[key] = val;
    })
  }

  Get(key?: string) {
    return key ? this.map[key] ?? null : this.map;
  }
}

class Params {
  private map: Generic.KeyValue<string>;

  constructor(str: string) {
    this.map = {};

    const params = str.slice(1, str.length).split(/[\&]/g);
    params.forEach((param: string) => {
      const [ key,  val ] = param.split('=');
      this.map[key] = val;
    });
  }

  Get(key?: string) {
    return key ? this.map[key] ?? null : this.map;
  }
}

class Cookies {
  private map: Generic.KeyValue<string>;

  constructor(str: string) {
    this.map = {};

    if (str) {
      const cookies = str.slice(0, str.length).split(/[\;]/g);
      cookies.forEach((cookie) => {
        const equal = cookie.indexOf("=");
        const k = cookie.slice(0, equal);
        const v = cookie.slice(equal+1, cookie.length);
        this.map[k.trim()] = v.trim();
      });
    }
  }

  Get(key?: string) {
    return key ? this.map[key] ?? null : this.map;
  }
}

export { Request };