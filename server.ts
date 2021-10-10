import {Method} from './route.ts';
import Generic from './generic.d.ts';
import {Router, router} from './router.ts';
import {serve, Server as _Server} from "https://deno.land/std@0.95.0/http/server.ts";

interface ServerConstructor {
  port: number;
}

class server {
  private port: number;
  server: _Server;
  router: router;

  constructor(opts: ServerConstructor) {
    this.port = opts.port;
    this.server = <_Server>{};
    this.router = Router.New();
  }

  async Start(afterStart?: Generic.Function<void>) {
    this.server = await serve({ port: this.port });
    
    if (afterStart) {
      afterStart();
    }
    
    for await (const req of this.server) {
      const method = <Method> req.method.toLowerCase();
      const path = req.url.slice(0, req.url.indexOf('?'));
      this.router.Handle(method, path, req);
    }
  }
}

abstract class Server {
  static New(opts: any): Generic.KeyValue<any> {
    const _server = new server(opts);
    return { server: _server, router: _server.router };
  }
}

export {Server, server};