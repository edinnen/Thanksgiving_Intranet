import React, {useContext} from 'react';
import Avatar from '@material-ui/core/Avatar';
import {useDispatch} from 'react-redux';
import {onSignOutFirebaseUser} from '../../../redux/actions';
import {useAuthUser} from '../../../@crema/utility/AppHooks';
import AppContext from '../../../@crema/utility/AppContext';
import clsx from 'clsx';
import {makeStyles} from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Box from '@material-ui/core/Box';
import {grey, orange} from '@material-ui/core/colors';
import {Fonts} from '../../constants/AppEnums';
import AppContextPropsType, {
  CremaTheme,
} from '../../../types/AppContextPropsType';

const UserInfo = (props: any) => {
  const {themeMode} = useContext<AppContextPropsType>(AppContext);
  const dispatch = useDispatch();
  const user = useAuthUser();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getUserAvatar = () => {
    if (user && user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
  };

  const useStyles = makeStyles((theme: CremaTheme) => {
    return {
      crUserInfo: {
        backgroundColor: 'rgba(0,0,0,.08)',
        paddingTop: 9,
        paddingBottom: 9,
        minHeight: 56,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        [theme.breakpoints.up('sm')]: {
          paddingTop: 10,
          paddingBottom: 10,
          minHeight: 70,
        },
      },
      profilePic: {
        height: 40,
        width: 40,
        fontSize: 24,
        backgroundColor: orange[500],
        [theme.breakpoints.up('xl')]: {
          height: 45,
          width: 45,
        },
      },
      userInfo: {
        width: 'calc(100% - 75px)',
      },
      userName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: 18,
        fontFamily: Fonts.MEDIUM,
        [theme.breakpoints.up('xl')]: {
          fontSize: 20,
        },
        color: themeMode === 'light' ? '#313541' : 'white',
      },
      designation: {
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      pointer: {
        cursor: 'pointer',
      },
      adminRoot: {
        color: grey[500],
        fontSize: 16,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    };
  });

  const classes = useStyles(props);

  const userTypes: { [key: string]: string } = {
    admin: "System Manager",
    guest: "Troglodyte"
  };

  return (
    <Box
      px={{xs: 4, xl: 7}}
      className={clsx(classes.crUserInfo, 'cr-user-info')}>
      <Box display='flex' alignItems='center'>
        {user && user.photoURL ? (
          <Avatar className={classes.profilePic} src={user.photoURL} />
        ) : (
          <Avatar className={classes.profilePic}>{getUserAvatar()}</Avatar>
        )}
        <Box ml={4} className={clsx(classes.userInfo, 'user-info')}>
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'>
            <Box mb={0} className={clsx(classes.userName)}>
              {user ? (user.name ? user.name : 'Admin User') : "Guest"}
            </Box>
            <Box
              ml={3}
              className={classes.pointer}
              color={themeMode === 'light' ? '#313541' : 'white'}>
              <Box component='span' onClick={handleClick}>
                <ExpandMoreIcon />
              </Box>
              <Menu
                id='simple-menu'
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}>
                <MenuItem>My account</MenuItem>
                <MenuItem
                  onClick={() => {
                    if (user) {
                      dispatch(onSignOutFirebaseUser());
                    }
                  }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Box>
          <Box color={grey.A200} className={classes.designation}>
            {user && user.type === 'admin' ? userTypes.admin : userTypes.guest}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserInfo;
