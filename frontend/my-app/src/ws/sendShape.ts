import {type  Shape } from '../authentication/types';
import { Socket } from 'socket.io-client';

export const broadcastShape = (socket: any, shape: Shape) => {
  socket.emit('shape', shape);
};

export const broadcastDelete = (socket: any, id: string) => {
  socket.emit('delete-shape', { id });
};
