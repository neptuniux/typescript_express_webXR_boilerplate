import * as express from 'express';

const register = (app: express.Application) => {
  // home page
  app.get('/', (req: any, res) => {
    res.render('index');
  });
};
export default register;
