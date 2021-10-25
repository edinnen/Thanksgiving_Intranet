import {AppActions} from '../../types';
import {UPDATE_FIREBASE_USER} from '../../types/actions/Auth.actions';
import {AuthUser} from '../../types/models/AuthUser';

const INIT_STATE: {user: AuthUser | null} = {
  user: null,
};

export default (state = INIT_STATE, action: AppActions) => {
  switch (action.type) {
    case UPDATE_FIREBASE_USER: {
      return {
        ...state,
        user: action.payload,
      };
    }
    default:
      return state;
  }
};
