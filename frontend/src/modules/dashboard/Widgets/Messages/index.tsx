import React from 'react';
import {Card} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import MessageItem from '../../../../@crema/core/HeaderMessages/MessageItem';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from 'shared/constants/AppEnums';
import {MessagesData} from '../../../../types/models/Widgets';

interface MessagesProps {
  data: MessagesData[];
}

const Messages: React.FC<MessagesProps> = ({data}) => {
  const useStyles = makeStyles(() => ({
    pointer: {
      cursor: 'pointer',
    },
    messList: {
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
        <Box mb={2} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.messages' />
          </Box>
          <Box component='span' ml='auto' mt={1.5}>
            <CloseIcon className={classes.pointer} />
          </Box>
        </Box>
        <List className={classes.messList}>
          {data.map((item) => {
            return <MessageItem key={item.id} item={item} />;
          })}
        </List>
      </Card>
    </Box>
  );
};

export default Messages;
