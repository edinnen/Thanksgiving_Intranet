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
      height: 48,
      paddingLeft:
        theme.direction === 'ltr'
          ? (props: {level: number}) => 17 + 50 * props.level
          : 17,
      paddingRight:
        theme.direction === 'rtl'
          ? (props: {level: number}) => 17 + 50 * props.level
          : 17,
      width: '100%',

      [theme.breakpoints.up('xl')]: {
        height: 64,
        paddingLeft:
          theme.direction === 'ltr'
            ? (props: {level: number}) => 24 + 50 * props.level
            : 24,
        paddingRight:
          theme.direction === 'rtl'
            ? (props: {level: number}) => 24 + 50 * props.level
            : 24,
      },

      '& .nav-item-text': {
        fontFamily: Fonts.REGULAR,
        fontSize: 16,
        color: theme.palette.sidebar.textColor,

        [theme.breakpoints.up('xl')]: {
          fontSize: 18,
        },
      },

      '& .nav-item-icon': {
        color: theme.palette.sidebar.textColor,
      },

      '& .nav-item-icon-arrow': {
        color: theme.palette.sidebar.textColor,
      },

      '&.open, &:hover, &:focus': {
        '& .nav-item-text': {
          fontFamily: Fonts.MEDIUM,
          color: themeMode === ThemeMode.LIGHT ? '#313541' : '#fff',
        },

        '& .nav-item-icon': {
          color: themeMode === ThemeMode.LIGHT ? '#313541' : '#fff',
        },

        '& .nav-item-icon-arrow': {
          color: themeMode === ThemeMode.LIGHT ? '#313541' : '#fff',
        },
      },
    },
    listItemText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    listIcon: {
      fontSize: 18,
      [theme.breakpoints.up('xl')]: {
        fontSize: 20,
      },
    },
  };
});
export default useStyles;
