import React from 'react';
import Box from '@material-ui/core/Box';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types';
import {ListItem, makeStyles} from '@material-ui/core';
import {Fonts} from '../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../types/AppContextPropsType';

interface NotificationItemProps {
  item: any;
  listStyle: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  listStyle,
}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    textBase: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
    avatar: {
      width: 40,
      height: 40,
      [theme.breakpoints.up('xl')]: {
        width: 60,
        height: 60,
      },
    },
    minWidth0: {
      minWidth: 0,
    },
  }));

  const classes = useStyles();
  return (
    <ListItem className={listStyle}>
      <Box mr={4}>
        <ListItemAvatar className={classes.minWidth0}>
          <Avatar
            className={classes.avatar}
            alt='Remy Sharp'
            src={item.image}
          />
        </ListItemAvatar>
      </Box>
      <Box component='p' className={classes.textBase} color='grey.500'>
        <Box
          mr={2}
          component='span'
          display='inline-block'
          color='text.primary'
          fontFamily={Fonts.LIGHT}>
          {item.name}
        </Box>
        {item.message}
      </Box>
    </ListItem>
  );
};

export default NotificationItem;

NotificationItem.propTypes = {
  item: PropTypes.object.isRequired,
};
