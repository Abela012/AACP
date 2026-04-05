import { IUser } from '../database/models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
