import { Request, Response } from "./index.ts";

interface Routes {
  [key: string]: Methods;
}

interface RouteHandler {
  (req: Request, res: Response): void;
}

interface Methods {
  get: RouteHandler;
  put: RouteHandler;
  post: RouteHandler;
  delete: RouteHandler;
}

type Method = keyof Methods;

export default Routes;
export type {Routes, Method, Methods};