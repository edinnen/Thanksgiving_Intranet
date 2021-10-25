import React, {ReactNode, useContext, useEffect} from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';

import {setInitialPath} from '../../redux/actions';
import {matchRoutes} from 'react-router-config';
import AppContext from './AppContext';
import {useAuthToken} from './AppHooks';
import {Loader} from '../index';
import {AppState} from '../../redux/store';
import AppContextPropsType from '../../types/AppContextPropsType';

interface AuthRoutesProps {
  children: ReactNode;
}

const AuthRoutes: React.FC<AuthRoutesProps> = ({children}) => {
  const {pathname} = useLocation();
  const dispatch = useDispatch();
  const history = useHistory();
  const {routes} = useContext<AppContextPropsType>(AppContext);

  const [token, loading] = useAuthToken();
  const {initialPath} = useSelector<AppState, AppState['settings']>(
    ({settings}) => settings,
  );
  const currentRoute = matchRoutes(routes, pathname)[0].route;

  useEffect(() => {
    function setInitPath() {
      if (
        initialPath === '/' &&
        [
          '/signin',
          '/signup',
          '/confirm-signup',
          '/reset-password',
          '/forget-password',
        ].indexOf(pathname) === -1
      ) {
        dispatch(setInitialPath(pathname));
      }
    }

    setInitPath();
  }, [dispatch, initialPath, loading, pathname, token]);

  useEffect(() => {
    if (!loading) {
      if (!token && currentRoute.auth && currentRoute.auth.length >= 1) {
        history.push('/signin');
      } else if (
        (pathname === '/signin' ||
          pathname === '/signup' ||
          pathname === '/confirm-signup' ||
          pathname === '/reset-password' ||
          pathname === '/forget-password') &&
        token
      ) {
        // @ts-ignore
        if (pathname === '/') {
          history.push('/dashboards/live');
        }
        // @ts-ignore
        else if (initialPath !== '/signin') {
          history.push(initialPath);
        } else {
          history.push('/dashboards/live');
        }
      }
    }
  }, [token, loading, pathname, initialPath, currentRoute.auth, history]);

  return loading ? <Loader /> : <>{children}</>;
};

export default AuthRoutes;
