import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';
import { Card, Box } from '@material-ui/core';
import { Fonts } from '../../constants/AppEnums';

interface LineChartParams {
  data: any[]
  title: string;
  lines: LineConfig[];
}

export interface LineConfig {
  key: string;
  color: string;
}

const LinePlot: React.FC<LineChartParams> = ({ data, title, lines }) => {
  return (
    <Box py={{ xs: 5, sm: 5, xl: 5 }} px={{ xs: 6, sm: 6, xl: 6 }} height='1' clone>
      <Card>
        <Box
          component='h3'
          mb={4}
          fontFamily={Fonts.LIGHT}
          fontSize={{ xs: 18, sm: 20, xl: 22 }}
        >
          {title}
        </Box>
        <ResponsiveContainer width='100%' height={350}>
          <LineChart data={data} margin={{ top: 50, right: 0, left: -35, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tickLine={true}
              axisLine={true}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <CartesianGrid stroke='#eee' horizontal={true} vertical={true} />
            {lines.map(({ key, color }) => (
              <Line
                type='monotone'
                key={key}
                dataKey={key}
                stroke={color}
                strokeWidth={5}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};
export default LinePlot;
