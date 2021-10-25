import {makeStyles} from '@material-ui/core/styles';
import {useContext} from 'react';
import AppContext from '../../../utility/AppContext';
import {Fonts, ThemeMode} from '../../../../shared/constants/AppEnums';
import AppContextPropsType, {
  CremaTheme,
} from '../../../../types/AppContextPropsType';

const useStyles = makeStyles((theme: CremaTheme) => {
  const {themeMode} = useContext<AppContextPropsType>(AppContext);
  return {
    navItem: {
      height: 64,
      fontWeight: 700,
      cursor: 'pointer',
      textDecoration: 'none !important',
      paddingLeft:
        theme.direction === 'ltr'
          ? (props: {level: number}) => 24 + 50 * props.level
          : 12,
      paddingRight:
        theme.direction === 'rtl'
          ? (props: {level: number}) => 24 + 50 * props.level
          : 12,
      '&.nav-item-header': {
        textTransform: 'uppercase',
      },
      '&.active': {
        backgroundColor: 'rgba(0,0,0,.08)',
        pointerEvents: 'none',
        transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
        '& .nav-item-text': {
          color: theme.palette.primary.main + '!important',
          fontFamily: `${Fonts.LIGHT} !important`,
        },
        '& .nav-item-icon': {
          color: theme.palette.primary.main + '!important',
        },
      },

      '&:hover, &:focus': {
        '& .nav-item-text': {
          fontFamily: Fonts.MEDIUM,
          color:
            themeMode === ThemeMode.LIGHT ? theme.palette.primary.main : '#fff',
        },

        '& .nav-item-icon': {
          color:
            themeMode === ThemeMode.LIGHT ? theme.palette.primary.main : '#fff',
        },

        '& .nav-item-icon-arrow': {
          color:
            themeMode === ThemeMode.LIGHT ? theme.palette.primary.main : '#fff',
        },
      },
      '& .nav-item-icon': {
        color: theme.palette.sidebar.textColor,
      },
      '& .nav-item-text': {
        color: theme.palette.sidebar.textColor,
        fontSize: 18,
      },
    },
    '@media (max-width: 1919px)': {
      navItem: {
        height: 48,
        paddingLeft:
          theme.direction === 'ltr'
            ? (props: {level: number}) => 17 + 50 * props.level
            : 12,
        paddingRight:
          theme.direction === 'rtl'
            ? (props: {level: number}) => 17 + 50 * props.level
            : 12,

        '& .nav-item-text': {
          fontSize: 16,
        },
      },
    },
    listIcon: {
      fontSize: 18,
      [theme.breakpoints.up('xl')]: {
        fontSize: 20,
      },
    },
    listItemText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontFamily: Fonts.REGULAR,
    },
  };
});
export default useStyles;
