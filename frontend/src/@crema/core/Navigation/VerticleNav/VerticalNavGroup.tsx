import React from 'react';
import {ListItem} from '@material-ui/core';
import clsx from 'clsx';
import VerticalCollapse from './VerticalCollapse';
import VerticalItem from './VerticalItem';
import IntlMessages from '../../../utility/IntlMessages';
import useStyles from './VerticalNavGroup.style';
import {NavItemProps} from '../../../../modules/routesConfig';

interface VerticalNavGroupProps {
  item: NavItemProps;
  level: number;
}

const VerticalNavGroup: React.FC<VerticalNavGroupProps> = ({item, level}) => {
  const classes = useStyles({level});

  return (
    <>
      <ListItem
        component='li'
        className={clsx(classes.navItem, 'nav-item nav-item-header')}>
        {<IntlMessages id={item.messageId} />}
      </ListItem>

      {item.children && Array.isArray(item.children) && (
        <>
          {item.children.map((item: any) => (
            <React.Fragment key={item.id}>
              {item.type === 'group' && (
                <NavVerticalGroup item={item} level={level} />
              )}

              {item.type === 'collapse' && (
                <VerticalCollapse item={item} level={level} />
              )}

              {item.type === 'item' && (
                <VerticalItem item={item} level={level} />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </>
  );
};

const NavVerticalGroup = VerticalNavGroup;

export default NavVerticalGroup;
