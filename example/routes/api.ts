import { Router, Request, Response } from '../../index.ts';

const api = Router.New();

api.Middleware('/home', function(req: Request, res: Response, proceed: any) {
  console.log('Requested received for: /api/home');
  proceed();
});

api.Get('/home', function(req: Request, res: Response) {
  res.Send('Welcome home, again!');
});

export {api as default, api};