import { Request, Response, App } from '../index.ts';

const { server, router } = App.New({ port: 8000 });

router.Middleware(function(req: Request, res: Response, proceed: any) {
  console.log(req.method, req.path);
  proceed();
});

router.Middleware('/home', function(req: Request, res: Response, proceed: any) {
  console.log('Request received for /home.');
  proceed();
})

router.Get('/home', function(req: Request, res: Response) {
  res.Send('Welcome home!');
})

router.Post('/home', async function(req: Request, res: Response) {
  const [err, body] = await req.body.JSON();
  if (err) {
    return res.Status(500).Send(err.toString());
  }

  res.Status(200).JSON(body);
})

router.Import('/api', await import('./routes/api.ts'));

await server.Start(function() {
  console.log('server started');
});