import React from 'react';
import InputBase from '@material-ui/core/InputBase';
import {makeStyles} from '@material-ui/core/styles';
import {Box, fade} from '@material-ui/core';
import clsx from 'clsx';
import SearchIcon from '@material-ui/icons/Search';
import {Fonts} from '../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../types/AppContextPropsType';

const useStyles = makeStyles((theme: CremaTheme) => ({
  root: {
    display: 'flex',
    marginRight: 20,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    marginLeft: (props: {borderLight: boolean; align: string}) =>
      props.align === 'right' ? 'auto' : 0,
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&.right': {
      left: 'auto',
      right: 0,
      '& + $inputRoot $inputInput': {
        paddingLeft: theme.spacing(2),
        paddingRight: `calc(1em + ${theme.spacing(4)}px)`,
      },
    },
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(2, 2, 2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: 162,
    height: 35,
    borderRadius: 4,
    boxSizing: 'border-box',
    '&:focus': {
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderColor: theme.palette.primary,
      width: 235,
    },
  },
  inputBase: {
    backgroundColor: 'transparent',
    fontFamily: Fonts.MEDIUM,
    border: '1px solid',
    borderColor: (props: {borderLight: boolean; align: string}) =>
      props.borderLight ? '#efefef' : theme.palette.text.hint,
    color: 'black',
    borderRadius: 4,

    '& > .Mui-focused': {
      borderColor: 'red',
    },
  },
  searchIconBox: {
    position: 'relative',
    '& $inputInput': {
      width: 35,
      borderRadius: 50,
      paddingLeft: 27,
      '&:focus': {
        width: 235,
        borderRadius: 4,
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      },
    },
    '& $searchIcon': {
      paddingLeft: 6,
      paddingRight: 6,
    },
  },
}));

interface AppSearchProps {
  placeholder?: string;
  iconPosition?: string;
  align?: string;
  borderLight?: boolean;
  onlyIcon?: boolean;
  containerStyle?: any;
  inputStyle?: any;
  iconStyle?: any;

  [x: string]: any;
}

const AppSearch: React.FC<AppSearchProps> = ({
  placeholder,
  iconPosition,
  align = 'left',
  borderLight = false,
  onlyIcon,
  containerStyle,
  inputStyle,
  iconStyle,
  ...rest
}) => {
  const classes = useStyles({borderLight, align});
  return (
    <Box className={classes.root} style={containerStyle}>
      <Box
        className={clsx(
          classes.search,
          onlyIcon ? classes.searchIconBox : null,
        )}>
        <Box
          className={clsx(classes.searchIcon, {
            right: iconPosition === 'right',
          })}
          style={iconStyle}>
          <SearchIcon />
        </Box>
        <InputBase
          {...rest}
          placeholder={placeholder || 'Search…'}
          className={clsx(classes.inputBase, 'crAppsSearch')}
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{'aria-label': 'search'}}
        />
      </Box>
    </Box>
  );
};

export default AppSearch;
