import React from 'react';
import Card from '@material-ui/core/Card';
import TaskList from './TaskList';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import DateSelector from './DateSelector';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Hidden from '@material-ui/core/Hidden';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core';
import {grey} from '@material-ui/core/colors';
import clsx from 'clsx';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {TodayTaskData} from '../../../../types/models/CRM';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface TodayTasksProps {
  todayTaskData: TodayTaskData[];
}

const TodayTasks: React.FC<TodayTasksProps> = ({todayTaskData}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    link: {
      fontSize: 16,
      paddingLeft: 8,
      paddingRight: 8,
      [theme.breakpoints.up('sm')]: {
        paddingLeft: 20,
        paddingRight: 20,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
    linkGrey: {
      color: grey[500],
    },
  }));

  const classes = useStyles();

  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height='100%'
      clone>
      <Card>
        <Box mb={3} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.todayTasks' />
          </Box>

          <Box ml='auto' display='flex' alignItems='center'>
            <Hidden xsDown>
              <Link
                className={clsx(classes.link, classes.linkGrey)}
                component='button'
                underline='none'>
                <IntlMessages id='common.createTask' />
              </Link>
            </Hidden>
            <Link
              color='secondary'
              className={classes.link}
              component='button'
              underline='none'>
              <IntlMessages id='common.viewAll' />
            </Link>
          </Box>
        </Box>

        <Grid container spacing={5}>
          <Grid item xs={12} md={6} xl={7}>
            <TaskList todayTaskData={todayTaskData} />
          </Grid>

          <Grid item xs={12} md={6} xl={5}>
            <DateSelector />
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

export default TodayTasks;
