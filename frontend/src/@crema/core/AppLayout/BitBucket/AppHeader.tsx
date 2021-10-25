import React from 'react';
import clsx from 'clsx';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import {toggleNavCollapsed} from '../../../../redux/actions';
import {useDispatch} from 'react-redux';
import Hidden from '@material-ui/core/Hidden';
import Box from '@material-ui/core/Box';
import SearchBar from '../../SearchBar';
import useStyles from './AppHeader.style';

interface AppHeaderProps {}

const AppHeader: React.FC<AppHeaderProps> = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  return (
    <Hidden lgUp>
      <Box
        bgcolor='white'
        display='flex'
        alignItems='center'
        className={clsx(classes.bitBucketResHeader, 'bitBucketResHeader')}>
        <IconButton
          edge='start'
          className={classes.menuButton}
          color='inherit'
          aria-label='open drawer'
          onClick={() => dispatch(toggleNavCollapsed())}>
          <MenuIcon className={classes.menuIcon} />
        </IconButton>
        <SearchBar borderLight placeholder='Search…' align='left' />
      </Box>
    </Hidden>
  );
};
export default AppHeader;
