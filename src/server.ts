import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import * as https from 'https';
import * as fs from 'fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Server, Socket } from 'socket.io';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as THREE from 'three';
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

// socket.io
const io = new Server(secureServer, {
  cors: {
    origin: '*',
  },
});

type User = {
  id: string;
  position: any;
  rotation: any;
};

const users: User[] = [];

io.on('connection', (socket: Socket) => {
  socket.on('join', (room: any) => {
    socket.join(room);
    users.push({
      id: socket.id,
      position: { },
      rotation: { },
    });
    io.to('room1').emit('updatePosition', users);
  });

  socket.on('updatePosition', (updatedUser: User) => {
    const serverUser = users.find((u) => u.id === socket.id);
    if (serverUser !== undefined) {
      if (serverUser.position.x !== updatedUser.position.x
          || serverUser.position.y !== updatedUser.position.y
          || serverUser.position.z !== updatedUser.position.z
          || serverUser.rotation.x !== updatedUser.rotation.x
            || serverUser.rotation.y !== updatedUser.rotation.y
            || serverUser.rotation.z !== updatedUser.rotation.z
      ) {
        users.splice(users.findIndex((u) => u.id === socket.id), 1, updatedUser);
        io.to('room1').emit('updatePosition', users);
      }
    }
  });

  socket.on('disconnect', () => {
    users.splice(users.findIndex((u) => u.id === socket.id), 1);
    console.log('User left:', socket.id, 'current users:', users);
    io.to('room1').emit('updatePosition', users);
  });

  socket.on('message', (message: { room: any; }) => {
    io.to(message.room).emit('message', message);
  });
});

// start the express server
secureServer.listen(httpsPort, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at https://localhost:${httpsPort}`);
});
app.listen(httpPort, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${httpPort}`);
});
