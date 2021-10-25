import React, {useContext} from 'react';
import {useSelector} from 'react-redux';
import {useLocation} from 'react-router-dom';
import {matchRoutes} from 'react-router-config';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';

import AppContext from '../../utility/AppContext';
import Layouts from './Layouts';
import {ContentView} from '../../index';
import useStyles from '../../../shared/jss/common/common.style';
import AppContextPropsType from '../../../types/AppContextPropsType';
import {AppState} from '../../../redux/store';
import BG from '../../../assets/images/auth-background.jpg';

const useStyle = makeStyles(() => ({
  appAuth: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    height: '100vh',
    backgroundColor: '#f3f4f6',
    background: `url(${BG}) no-repeat center center`,
    backgroundSize: 'cover',

    '& .scrollbar-container': {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
    '& .main-content-view': {
      padding: 20,
    },
    '& .footer': {
      marginRight: 0,
      marginLeft: 0,
    },
  },
}));

interface CremaLayoutProps {}

const CremaLayout: React.FC<CremaLayoutProps> = () => {
  useStyles();

  // Detect our current path to ensure we don't show the auth background for
  // routes which do not require auth
  const {pathname} = useLocation();
  const {routes} = useContext<AppContextPropsType>(AppContext);
  const currentRoute = matchRoutes(routes, pathname)[0].route;

  const {navStyle} = useContext<AppContextPropsType>(AppContext);
  const {user} = useSelector<AppState, AppState['auth']>(({auth}) => auth);
  const AppLayout = Layouts[navStyle];

  const classes = useStyle();
  return (
    <>
      {user || !currentRoute.auth || !currentRoute.auth.length ? (
        <AppLayout />
      ) : (
        <Box className={classes.appAuth}>
          <ContentView />
        </Box>
      )}
    </>
  );
};

export default React.memo(CremaLayout);
