import {makeStyles} from '@material-ui/core';
import {useContext} from 'react';
import AppContext from '../../../utility/AppContext';
import {ThemeMode, ThemeStyle} from '../../../../shared/constants/AppEnums';
import AppContextPropsType, {
  CremaTheme,
} from '../../../../types/AppContextPropsType';

const useStyles = makeStyles((theme: CremaTheme) => {
  const {themeStyle, themeMode} = useContext<AppContextPropsType>(AppContext);
  return {
    container: {
      maxHeight: '100vh',
      paddingLeft: themeStyle === ThemeStyle.MODERN ? 30 : 0,
      paddingTop: themeStyle === ThemeStyle.MODERN ? 30 : 0,
      paddingBottom: themeStyle === ThemeStyle.MODERN ? 30 : 0,
      width: themeStyle === ThemeStyle.MODERN ? '19rem' : '19rem',
      [theme.breakpoints.up('xl')]: {
        width: themeStyle === ThemeStyle.MODERN ? '22.8rem' : '21.6rem',
      },
    },
    drawerContainer: {
      maxHeight: '100vh',
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
      width: '19rem',
      [theme.breakpoints.up('xl')]: {
        width: '21.6rem',
      },
    },
    sidebarBg: {
      overflow: 'hidden',
      backgroundColor:
        themeMode === ThemeMode.SEMI_DARK
          ? theme.palette.sidebar.bgColor
          : themeMode === ThemeMode.LIGHT
          ? 'white'
          : '#313541',
    },
    scrollAppSidebar: {
      paddingTop: 8,
      paddingBottom: 8,
      height:
        themeStyle === ThemeStyle.MODERN
          ? 'calc(100vh - 166px) !important'
          : 'calc(100vh - 116px) !important',
      [theme.breakpoints.up('xl')]: {
        height:
          themeStyle === ThemeStyle.MODERN
            ? 'calc(100vh - 190px) !important'
            : 'calc(100vh - 130px) !important',
      },
    },
    drawerScrollAppSidebar: {
      paddingTop: 8,
      paddingBottom: 20,
      height: 'calc(100vh - 58px) !important',
    },

    sidebarModern: {
      height: '100%',
      width: '100%',
      color: 'white',
      overflow: 'hidden',
      borderRadius: 30,
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
