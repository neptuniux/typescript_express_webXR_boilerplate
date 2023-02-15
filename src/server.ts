import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import * as https from 'https';
import * as fs from 'fs';
import * as routes from './routes/general_routes';

dotenv.config();
const httpPort = process.env.SERVER_PORT;
const httpsPort = process.env.SECURE_SERVER_PORT;
const app = express();

const secureServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, '..', 'security', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, '..', 'security', 'server.cert')),
}, app);

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// routes
routes.default(app);

// start the express server
secureServer.listen(httpsPort, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at https://localhost:${httpsPort}`);
});
app.listen(httpPort, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${httpPort}`);
});
