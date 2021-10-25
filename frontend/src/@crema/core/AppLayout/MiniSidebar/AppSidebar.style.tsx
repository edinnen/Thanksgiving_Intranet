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
    miniSidebar: {
      paddingLeft: 0,
      paddingTop: 0,
      paddingBottom: 0,
      maxHeight: '100vh',
      position: 'relative',
      top: 0,
      left: 0,
      zIndex: 99999,
      width: '19rem',
      transition: 'all 0.5s ease',

      [theme.breakpoints.up('lg')]: {
        width: '4rem',
        position: 'fixed',

        '& .nav-item-text, & .nav-item-icon-arrow': {
          opecity: 0,
          visibility: 'hidden',
        },

        '& .nav-item-header, & .user-info, & .collapse-children': {
          display: 'none',
        },
      },

      [theme.breakpoints.up('xl')]: {
        width: '5rem',
      },

      '& .cr-user-info': {
        paddingLeft: '10px !important',
        paddingRight: '10px !important',
        transition: 'all 0.5s ease',

        [theme.breakpoints.up('xl')]: {
          paddingLeft: '12px !important',
          paddingRight: '12px !important',
        },
      },

      '& .nav-item-icon': {
        transition: 'all 0.5s ease',

        [theme.breakpoints.up('lg')]: {
          marginRight: '5px !important',
          marginLeft: '5px !important',
        },

        [theme.breakpoints.up('xl')]: {
          marginRight: '0 !important',
          marginLeft: '0 !important',
        },
      },

      '&:hover': {
        [theme.breakpoints.up('lg')]: {
          width: '21.6rem',

          '& .nav-item-text, & .nav-item-icon-arrow': {
            opecity: 1,
            visibility: 'visible',
          },

          '& .nav-item-header, & .user-info, & .collapse-children': {
            display: 'block',
          },

          '& .nav-item-icon': {
            marginLeft: '0 !important',
          },
        },
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
      height: 'calc(100vh - 58px) !important',

      [theme.breakpoints.up('xl')]: {
        height: 'calc(100vh - 65px) !important',
      },
    },
    drawerScrollAppSidebar: {
      paddingTop: 8,
      paddingBottom: 20,
      height: 'calc(100vh - 58px) !important',

      [theme.breakpoints.up('xl')]: {
        height: 'calc(100vh - 65px) !important',
      },
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
