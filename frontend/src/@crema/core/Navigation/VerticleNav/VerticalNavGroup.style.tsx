import {makeStyles} from '@material-ui/styles';
import {useContext} from 'react';
import AppContext from '../../../utility/AppContext';
import AppContextPropsType, {
  CremaTheme,
} from '../../../../types/AppContextPropsType';

const useStyles = makeStyles((theme: CremaTheme) => {
  const {themeMode} = useContext<AppContextPropsType>(AppContext);
  return {
    navItem: {
      height: 40,
      paddingLeft:
        theme.direction === 'ltr'
          ? (props: {level: number}) => 17 + 50 * props.level
          : 12,
      paddingRight:
        theme.direction === 'rtl'
          ? (props: {level: number}) => 17 + 50 * props.level
          : 12,
      color:
        themeMode === 'light'
          ? theme.palette.text.hint
          : 'rgba(255,255,255,0.38)',
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer',
      textDecoration: 'none!important',

      [theme.breakpoints.up('xl')]: {
        height: 45,
        fontSize: 16,
        paddingLeft:
          theme.direction === 'ltr'
            ? (props: {level: number}) => 24 + 50 * props.level
            : 12,
        paddingRight:
          theme.direction === 'rtl'
            ? (props: {level: number}) => 24 + 50 * props.level
            : 12,
      },
      '&.nav-item-header': {
        textTransform: 'uppercase',
      },
    },
  };
});

export default useStyles;
