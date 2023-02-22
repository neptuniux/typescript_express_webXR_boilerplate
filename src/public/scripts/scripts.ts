// eslint-disable-next-line import/no-extraneous-dependencies
import { io, Socket } from 'socket.io-client';
import TestScene from './testScene';

type User = {
  id: string;
  position: any;
  rotation: any;
};

// please note that the types are reversed
const socket: Socket = io();

const scene = new TestScene(socket);
scene.render();
scene.animate();

socket.on('connect', () => {
  socket.emit('join', 'room1');
});

socket.on('disconnect', () => {
  console.log('Disconnected');
  socket.emit('disconnect');
});

socket.on('message', (message: string) => {
  console.log(message);
});

socket.on('updatePosition', (users: User[]) => {
  if (scene.users !== users) {
    scene.users = users;
    // scene.updatePositions(users);
    // console.log('Updated positions:', scene.users);
  }
});
