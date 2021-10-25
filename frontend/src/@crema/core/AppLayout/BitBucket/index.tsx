import React, {ReactNode, useContext, useState} from 'react';
import AppSidebar from './AppSidebar';
import {AppContext, ContentView} from '../../../index';
import Hidden from '@material-ui/core/Hidden';
import Box from '@material-ui/core/Box';
import AppHeader from './AppHeader';
import clsx from 'clsx';
import useStyles from './index.style';
import {LayoutType} from '../../../../shared/constants/AppEnums';
import AppContextPropsType from '../../../../types/AppContextPropsType';

interface BitBucketProps {
  children: ReactNode;
}

const BitBucket: React.FC<BitBucketProps> = (props) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const {layoutType} = useContext<AppContextPropsType>(AppContext);
  const classes = useStyles(props);

  return (
    <Box
      className={clsx(
        classes.appMain,
        layoutType === LayoutType.BOXED ? classes.boxedLayout : '',
        {
          bitBucketCollapsed: isCollapsed,
        },
      )}>
      <Hidden lgUp>
        <AppHeader />
      </Hidden>
      <AppSidebar isCollapsed={isCollapsed} setCollapsed={setCollapsed} />
      <Box className={classes.mainContent}>
        <Hidden mdDown>
          <Box className={classes.mainContainer}>
            <ContentView>{props.children}</ContentView>
          </Box>
        </Hidden>

        <Hidden lgUp>
          <Box className={classes.mainContainerFull}>
            <ContentView>{props.children}</ContentView>
          </Box>
        </Hidden>
      </Box>
    </Box>
  );
};

export default BitBucket;
