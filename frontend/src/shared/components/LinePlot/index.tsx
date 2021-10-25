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
  primaryKey: string;
  secondaryKey?: string;
  tertiaryKey?: string;
  quatrinaryKey?: string;
  primaryColor: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  quatrinaryColor?: string;
}

const LinePlot: React.FC<LineChartParams> = ({ data, title, primaryKey, secondaryKey, tertiaryKey, quatrinaryKey, primaryColor, secondaryColor, tertiaryColor, quatrinaryColor }) => {
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
            <Line
              type='monotone'
              dataKey={primaryKey}
              stroke={primaryColor}
              strokeWidth={5}
              isAnimationActive={false}
            />
            {secondaryColor && secondaryKey ? <Line
              type='monotone'
              dataKey={secondaryKey}
              stroke={secondaryColor}
              strokeWidth={5}
              isAnimationActive={false}
            /> : ""}
            {tertiaryColor && tertiaryKey ? <Line
              type='monotone'
              dataKey={tertiaryKey}
              stroke={tertiaryColor}
              strokeWidth={5}
              isAnimationActive={false}
            /> : ""}
            {quatrinaryColor && quatrinaryKey ? <Line
              type='monotone'
              dataKey={quatrinaryKey}
              stroke={quatrinaryColor}
              strokeWidth={5}
              isAnimationActive={false}
            /> : ""}
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
};
export default LinePlot;
