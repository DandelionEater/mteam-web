import { Request } from 'express';

export interface AuthedRequest extends Request {
  user?: any;
}
