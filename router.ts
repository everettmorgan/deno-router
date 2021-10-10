import Generic from './generic.d.ts';
import {Request, Response} from './index.ts';
import {Routes, Methods, Method} from './route.ts';
import {ServerRequest} from "https://deno.land/std@0.95.0/http/server.ts";

interface Middleware {
  all: Array<any>;
  routes: Generic.KeyValue<any>;
}

class router {
  routes: Routes;
  middleware: Middleware;

  constructor() {
    this.routes = {};
    this.middleware = { all: [], routes: {} };
  }

  private addRoute(method: Method, route: string, cb: any) {
    if (!this.routes[route]) {
      this.routes[route] = <Methods>{};
    }
    this.routes[route][method] = cb;
  }

  Import(_base: string | router, _router?: router) {
    const base: string = _router ? _base as string : '';
    const router: router = _router ?? <router>_base;

    this.middleware.all = this.middleware.all.concat(router.middleware.all);

    Reflect.ownKeys(router.middleware.routes).forEach((route) => {
      this.middleware.routes[`${base}${route as string}`] = router.middleware.routes[route as string];
    });

    Reflect.ownKeys(router.routes).forEach((_route) => {
      const route = router.routes[_route as string];
      Reflect.ownKeys(route).forEach((_method) => {
        const method = _method as keyof Methods;
        if (!this.routes[`${base}${_route as string}`]) {
          this.routes[`${base}${_route as string}`] = <Methods>{};
        }
        this.routes[`${base}${_route as string}`][method] = route[method];
      })
    });
  }

  async Handle(method: Method, path: string, req: ServerRequest) {
    if (this.routes[path] && this.routes[path][method]) {
      const request = new Request(req);
      const response = new Response(request);

      const toMerge = this.middleware.routes[path] ? this.middleware.routes[path] : [];
      const middleware = [...this.middleware.all, ...toMerge];

      for (const fn of middleware) {
        let next = false;
        await fn(request, response, function() {
          next = true;
        });

        if (!next) {
          return;
        }
      }

      this.routes[path][method](request, response);
    } else {
      req.respond({
        status: 404,
        body: `Cannot ${method} ${path}`
      });
    }
  }

  Middleware(route: string | any, fn?: any) {
    if (!fn && typeof route === 'function') {
      this.middleware.all.push(route);
    }

    if (fn && typeof route === 'string') {
      if (!this.middleware.routes[route]) {
        this.middleware.routes[route] = [];
      }
      this.middleware.routes[route].push(fn);
    }
  }

  Get(route: string, cb: any) {
    this.addRoute('get', route, cb);
  }

  Put(route: string, cb: any) {
    this.addRoute('put', route, cb);
  }

  Post(route: string, cb: any) {
    this.addRoute('post', route, cb);
  }

  Del(route: string, cb: any) {
    this.addRoute('delete', route, cb);
  }
}

abstract class Router {
  static New () {
    return new router();
  }
}

export { Router, router };