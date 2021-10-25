import React from 'react';
import {Card} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import List from '@material-ui/core/List';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import TaskItem from './TaskItem';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from 'shared/constants/AppEnums';
import {TaskListData} from '../../../../types/models/Widgets';

interface TaskListProps {
  data: TaskListData[];
}

const TaskList: React.FC<TaskListProps> = ({data}) => {
  const useStyles = makeStyles(() => ({
    pointer: {
      cursor: 'pointer',
    },
  }));

  const classes = useStyles();
  return (
    <Box
      pt={{xs: 4, sm: 6, xl: 8}}
      pb={{xs: 4, sm: 4, xl: 6}}
      px={{xs: 6, sm: 8, xl: 10}}
      height='1'
      clone>
      <Card>
        <Box mb={2} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.taskList' />
          </Box>
          <Box component='span' ml='auto' mt={1.5}>
            <CloseIcon className={classes.pointer} />
          </Box>
        </Box>
        <List>
          {data.map((item) => {
            return <TaskItem key={item.id} item={item} />;
          })}
        </List>
      </Card>
    </Box>
  );
};

export default TaskList;
