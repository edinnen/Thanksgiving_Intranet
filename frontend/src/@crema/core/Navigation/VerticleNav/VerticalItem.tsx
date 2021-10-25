import React from 'react';
import {Icon, ListItem, ListItemText} from '@material-ui/core';
import clsx from 'clsx';
import {Badge, NavLink} from '../../../index';
import Box from '@material-ui/core/Box';
import IntlMessages from '../../../utility/IntlMessages';
import useStyles from './VerticalItem.style';
import {NavItemProps} from '../../../../modules/routesConfig';
import {RouteComponentProps, withRouter} from 'react-router-dom';

interface VerticalItemProps extends RouteComponentProps<any> {
  item: NavItemProps;
  level: number;
}

const VerticalItem: React.FC<VerticalItemProps> = ({
  item,
  location,
  match,
  history,
  level,
}) => {
  const classes = useStyles({level});

  const getUrl = () => {
    if (item.url) return item.url;
    return '/';
  };
  return (
    <ListItem
      button
      to={getUrl()}
      component={NavLink}
      className={clsx(classes.navItem, 'nav-item', {
        active: item.url === location.pathname,
      })}>
      {item.icon && (
        <Box component='span' mr={6}>
          <Icon
            className={clsx(classes.listIcon, 'nav-item-icon')}
            color='action'>
            {item.icon}
          </Icon>
        </Box>
      )}
      <ListItemText
        primary={<IntlMessages id={item.messageId} />}
        classes={{primary: 'nav-item-text'}}
      />
      {item.count && (
        <Box mr={4} clone>
          <Badge count={item.count} color={item.color} />
        </Box>
      )}
    </ListItem>
  );
};

export default withRouter(VerticalItem);
