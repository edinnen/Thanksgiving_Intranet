import React, {useContext, useEffect, useState} from 'react';
import {
  Collapse,
  Icon,
  IconButton,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import clsx from 'clsx';
import VerticalItem from './VerticalItem';
import AppContext from '../../../utility/AppContext';
import Box from '@material-ui/core/Box';
import IntlMessages from '../../../utility/IntlMessages';
import useStyles from './VerticalCollapase.style';
import AppContextPropsType from '../../../../types/AppContextPropsType';
import {NavItemProps} from '../../../../modules/routesConfig';
import {RouteComponentProps, withRouter} from 'react-router-dom';

const needsToBeOpened = (pathname: string, item: NavItemProps): boolean => {
  if (pathname) {
    return isUrlInChildren(item, pathname);
  }
  return false;
};

const isUrlInChildren = (parent: any, url: string) => {
  if (!parent.children) {
    return false;
  }

  for (let i = 0; i < parent.children.length; i++) {
    if (parent.children[i].children) {
      if (isUrlInChildren(parent.children[i], url)) {
        return true;
      }
    }

    if (
      parent.children[i].url === url ||
      url.includes(parent.children[i].url)
    ) {
      return true;
    }
  }

  return false;
};

interface VerticalCollapseProps extends RouteComponentProps<any> {
  item: NavItemProps;
  level: number;
}

const VerticalCollapse: React.FC<VerticalCollapseProps> = ({
  item,
  location,
  match,
  history,
  level,
}) => {
  const classes = useStyles({level});
  const {theme} = useContext<AppContextPropsType>(AppContext);
  const {pathname} = location;
  const [open, setOpen] = useState(() => needsToBeOpened(pathname, item));

  useEffect(() => {
    if (needsToBeOpened(pathname, item)) {
      setOpen(true);
    }
  }, [pathname, item]);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem
        button
        component='li'
        className={clsx(classes.navItem, open && 'open')}
        onClick={handleClick}>
        {item.icon && (
          <Box component='span' mr={6}>
            <Icon
              color='action'
              className={clsx('nav-item-icon', classes.listIcon)}>
              {item.icon}
            </Icon>
          </Box>
        )}
        <ListItemText
          classes={{primary: clsx('nav-item-text', classes.listItemText)}}
          primary={<IntlMessages id={item.messageId} />}
        />
        <Box p={0} clone>
          <IconButton disableRipple>
            <Icon className='nav-item-icon-arrow' color='inherit'>
              {open
                ? 'expand_more'
                : theme.direction === 'ltr'
                ? 'chevron_right'
                : 'chevron_left'}
            </Icon>
          </IconButton>
        </Box>
      </ListItem>

      {item.children && Array.isArray(item.children) && (
        <Collapse in={open} className='collapse-children'>
          {item.children.map((item) => (
            <React.Fragment key={item.id}>
              {item.type === 'collapse' && (
                <VerticalCollapse
                  location={location}
                  match={match}
                  history={history}
                  item={item}
                  level={level + 1}
                />
              )}

              {item.type === 'item' && (
                <VerticalItem item={item} level={level + 1} />
              )}
            </React.Fragment>
          ))}
        </Collapse>
      )}
    </>
  );
};

export default withRouter(VerticalCollapse);
