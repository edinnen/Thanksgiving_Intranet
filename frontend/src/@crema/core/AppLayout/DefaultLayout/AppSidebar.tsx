import React, {useContext} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import clsx from 'clsx';
import UserInfo from '../../../../shared/components/UserInfo';
import Navigation from '../../Navigation/VerticleNav';
import {toggleNavCollapsed} from '../../../../redux/actions';
import {useDispatch, useSelector} from 'react-redux';
import Box from '@material-ui/core/Box';
import AppContext from '../../../utility/AppContext';
import useStyles from './AppSidebar.style';
import {ThemeStyle} from '../../../../shared/constants/AppEnums';
import AppContextPropsType from '../../../../types/AppContextPropsType';
import {AppState} from '../../../../redux/store';

interface AppSidebarProps {
  position?: 'left' | 'bottom' | 'right' | 'top' | undefined;
}

const AppSidebar: React.FC<AppSidebarProps> = ({position = 'left'}) => {
  const {themeStyle} = useContext<AppContextPropsType>(AppContext);

  const dispatch = useDispatch();
  const {navCollapsed} = useSelector<AppState, AppState['settings']>(
    ({settings}) => settings,
  );

  const handleToggleDrawer = () => {
    dispatch(toggleNavCollapsed());
  };

  const classes = useStyles();
  let sidebarClasses = classes.sidebarModern;
  if (themeStyle === ThemeStyle.STANDARD) {
    sidebarClasses = classes.sidebarStandard;
  }

  return (
    <React.Fragment>
      <Hidden lgUp>
        <Drawer
          anchor={position}
          open={navCollapsed}
          onClose={() => handleToggleDrawer()}
          style={{position: 'absolute'}}>
          <Box height='100%' className={classes.drawerContainer}>
            <Box
              height='100%'
              width='100%'
              color='primary.contrastText'
              className={classes.sidebarBg}>
              <UserInfo />
              <PerfectScrollbar className={classes.drawerScrollAppSidebar}>
                <Navigation />
              </PerfectScrollbar>
              `
            </Box>
          </Box>
        </Drawer>
      </Hidden>
      <Hidden mdDown>
        <Box height='100%' className={classes.container}>
          <Box className={clsx(classes.sidebarBg, sidebarClasses)}>
            <UserInfo />
            <PerfectScrollbar
              className={clsx(classes.scrollAppSidebar, 'scrollAppSidebar')}>
              <Navigation />
            </PerfectScrollbar>
          </Box>
        </Box>
      </Hidden>
    </React.Fragment>
  );
};

export default AppSidebar;
