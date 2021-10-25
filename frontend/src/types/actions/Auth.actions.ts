import {AuthUser} from '../models/AuthUser';

export const UPDATE_FIREBASE_USER = 'UPDATE_FIREBASE_USER';

export interface UpdateAuthUserActions {
  type: typeof UPDATE_FIREBASE_USER;
  payload: AuthUser | null;
}

export type AuthActions = UpdateAuthUserActions;
