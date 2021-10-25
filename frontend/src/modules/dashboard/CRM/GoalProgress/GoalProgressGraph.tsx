import React from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {makeStyles} from '@material-ui/core';
import {ProgressGraphData} from '../../../../types/models/CRM';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface GoalProgressGraphProps {
  progressGraphData: ProgressGraphData[];
}

const GoalProgressGraph: React.FC<GoalProgressGraphProps> = ({
  progressGraphData,
}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    goalChart: {
      height: '300px !important',
      [theme.breakpoints.up('xl')]: {
        height: '400px !important',
      },
    },
  }));

  const classes = useStyles();

  return (
    <ResponsiveContainer className={classes.goalChart}>
      <BarChart
        barGap={5}
        barSize={25}
        data={progressGraphData}
        margin={{top: 50}}>
        <XAxis dataKey='name' axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip />
        <Bar dataKey='progress' stackId='a' fill='#3182CE' />
        <Bar dataKey='actual' stackId='a' fill='#E53E3E' />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GoalProgressGraph;
