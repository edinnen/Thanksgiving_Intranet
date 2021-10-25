import {makeStyles} from '@material-ui/core';
import {useContext} from 'react';
import AppContext from '../../../utility/AppContext';
import {ThemeMode} from '../../../../shared/constants/AppEnums';
import AppContextPropsType, {
  CremaTheme,
} from '../../../../types/AppContextPropsType';

const useStyles = makeStyles((theme: CremaTheme) => {
  const {themeMode} = useContext<AppContextPropsType>(AppContext);
  return {
    container: {
      width: '19rem',
      maxHeight: '100vh',
      [theme.breakpoints.up('xl')]: {
        width: '21.6rem',
      },
    },
    sidebarBg: {
      backgroundColor:
        themeMode === ThemeMode.SEMI_DARK
          ? theme.palette.sidebar.bgColor
          : themeMode === ThemeMode.LIGHT
          ? 'white'
          : '#313541',
    },
    scrollAppSidebar: {
      paddingTop: 8,
      paddingBottom: 20,
    },
    drawerScrollAppSidebar: {
      paddingTop: 8,
      paddingBottom: 20,
    },
    sidebarStandard: {
      height: '100%',
      width: '100%',
      color: 'white',
      overflow: 'hidden',
    },
  };
});
export default useStyles;
