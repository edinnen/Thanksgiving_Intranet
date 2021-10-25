import React from 'react';
import {Line, LineChart, ResponsiveContainer, Tooltip} from 'recharts';
import {makeStyles} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import {ReviewGraphData} from '../../../../types/models/CRM';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface RevenueGraphProps {
  data: ReviewGraphData[];
}

const RevenueGraph: React.FC<RevenueGraphProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    revenueChart: {
      height: '100px !important',
      [theme.breakpoints.up('sm')]: {
        height: '193px !important',
      },
      [theme.breakpoints.up('xl')]: {
        height: '216px !important',
      },
    },
  }));

  const classes = useStyles();

  return (
    <ResponsiveContainer width={400} className={classes.revenueChart}>
      <LineChart data={data} margin={{left: 10, right: 55, bottom: 10}}>
        <Line
          type='monotone'
          dataKey='revenue'
          stroke='#FFDE00'
          strokeWidth={5}
          dot={{r: 7}}
        />
        <Tooltip
          cursor={false}
          content={(data: any) => {
            return data.payload[0] ? (
              <Box component='span' p={4} color='primary.main'>
                {data.payload[0].payload.revenue}
              </Box>
            ) : null;
          }}
          wrapperStyle={{
            background: '#FFDE00',
            borderRadius: 10,
            radius: 10,
            overflow: 'hidden',
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RevenueGraph;
