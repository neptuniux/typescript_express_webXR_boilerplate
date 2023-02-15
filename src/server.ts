import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import * as routes from './routes/general_routes';

dotenv.config();
const port = process.env.SERVER_PORT;
const app = express();

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// routes
routes.default(app);

// start the express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
