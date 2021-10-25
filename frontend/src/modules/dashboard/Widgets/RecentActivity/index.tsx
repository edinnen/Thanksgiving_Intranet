import React from 'react';
import {Box, Card, makeStyles} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import NotificationItem from '../../../../@crema/core/Notifications/NotificationItem';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {RecentActivityData} from '../../../../types/models/Widgets';

interface RecentActivityProps {
  data: RecentActivityData[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({data}) => {
  const useStyles = makeStyles(() => ({
    pointer: {
      cursor: 'pointer',
    },
    notiList: {
      paddingTop: 0,
      paddingBottom: 0,
      '& .paddingX': {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
  }));

  const classes = useStyles();
  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card>
        <Box mb={4} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontSize={{xs: 18, sm: 20, xl: 22}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='dashboard.recentActivity' />
          </Box>
          <Box component='span' ml='auto' mt={1.5}>
            <CloseIcon className={classes.pointer} />
          </Box>
        </Box>
        <List className={classes.notiList}>
          {data.map((item) => {
            return (
              <NotificationItem
                listStyle='paddingX'
                item={item}
                key={item.id}
              />
            );
          })}
        </List>
      </Card>
    </Box>
  );
};

export default RecentActivity;
