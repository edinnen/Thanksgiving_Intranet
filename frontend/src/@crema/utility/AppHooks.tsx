import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useState} from 'react';
// import {auth as firebaseAuth} from '../services/auth/firebase/firebase';
import {AppState} from '../../redux/store';
import {UPDATE_FIREBASE_USER} from '../../types/actions/Auth.actions';

export const useAuthToken = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const { user } = useSelector<AppState, AppState['auth']>(({auth}) => auth);
  let authUser = user;

  useEffect(() => {
      let storedUser;
      // Check if we have stored some login data an a user's device previously
      if (!authUser) {
        storedUser = localStorage.getItem('user');
        if (storedUser) {
          // User data found in device storage. Apply the token and log them in
          const user = JSON.parse(storedUser);
          if (user && user.token) setToken(user.token);
          dispatch({
            type: UPDATE_FIREBASE_USER,
            payload: user,
          });
        }
      }

      // We have a user, but no token has been set.
      if (authUser && authUser.token && !token) {
        // Store token in application state and user data in device storage
        setToken(authUser.token);
        if (!storedUser) {
          localStorage.setItem('user', JSON.stringify(authUser));
        }
      }

      setLoading(false);
  }, [authUser, token, dispatch])

  // Ensure token is set for different authUser states
  useEffect(() => {
    if (!authUser) {
      setToken(null);
    }
    if (authUser && authUser.token) {
      setToken(authUser.token);
    }
  }, [authUser]);

  return [token, loading];
};

export const useAuthUser = () => {
  const {user} = useSelector<AppState, AppState['auth']>(({auth}) => auth);
  if (user) {
    return user;
  }
  return null;
};
