import React, {useState} from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from 'shared/constants/AppEnums';
import {TodayTaskData} from '../../../../types/models/CRM';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface TaskListProps {
  todayTaskData: TodayTaskData[];
}

const TaskList: React.FC<TaskListProps> = ({todayTaskData}) => {
  const [taskList, handleList] = useState(todayTaskData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    task: TodayTaskData,
  ) => {
    task.isChecked = e.target.checked;
    const list = taskList.map((item) => (item.id === task.id ? task : item));
    handleList(list);
  };

  const useStyles = makeStyles((theme: CremaTheme) => ({
    listIcon: {
      marginTop: -16,
      minWidth: 0,
      width: 35,
      [theme.breakpoints.up('xl')]: {
        width: 40,
      },
    },
  }));

  const classes = useStyles();

  return (
    <List>
      {taskList.map((task) => {
        return (
          <Box pl={0} pt={0} key={task.id} clone>
            <ListItem>
              <ListItemIcon className={classes.listIcon}>
                <Box m={-2} clone>
                  <Checkbox
                    color='primary'
                    checked={task.isChecked}
                    onChange={(e) => handleChange(e, task)}
                  />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box
                    component='span'
                    fontFamily={Fonts.MEDIUM}
                    fontSize={{xs: 16, xl: 18}}
                    color={task.isChecked ? 'text.hint' : 'text.primary'}>
                    {task.task}
                  </Box>
                }
                secondary={
                  <Box component='span' fontSize={{xs: 14, xl: 16}}>
                    <IntlMessages id='common.scheduled' /> {task.date}
                  </Box>
                }
              />
            </ListItem>
          </Box>
        );
      })}
    </List>
  );
};

export default TaskList;
