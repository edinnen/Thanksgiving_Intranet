import React from 'react';
import {Card} from '@material-ui/core';
import IncomeGraph from './IncomeGraph';
import WebTrafficGraph from './WebTrafficGraph';
import RevenueGrowthGraph from './RevenueGrowthGraph';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {
  IncomeLastYear,
  RevenueGrowthData,
  WebsiteTrafficData,
} from '../../../../types/models/Metrics';

interface StatsCardWithGraphProps {
  data: IncomeLastYear | WebsiteTrafficData | RevenueGrowthData;
  text: any;
  bgColor: string;
  headingColor: string;
  valueColor: string;
  type: string;
}

const StatsCardWithGraph: React.FC<StatsCardWithGraphProps> = ({
  data,
  text,
  bgColor,
  headingColor,
  valueColor,
  type,
}) => {
  const onGetGraph = () => {
    switch (type) {
      case 'incomeGraph':
        return <IncomeGraph data={data.graphData} />;

      case 'trafficGraph':
        return <WebTrafficGraph data={data.graphData} />;

      case 'revenueGrowth':
        return <RevenueGrowthGraph data={data.graphData} />;

      default:
        return <IncomeGraph data={data.graphData} />;
    }
  };

  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      style={{backgroundColor: bgColor}}
      height={1}
      clone>
      <Card>
        <Box position='relative'>
          <Box position='absolute' top={0} left={0}>
            <Box
              component='p'
              color={headingColor}
              fontSize={{xs: 16, xl: 18}}
              mb={{xs: 4, md: 6}}>
              {text}
            </Box>
            <Box
              color={valueColor}
              component='h3'
              fontSize={{xs: 18, sm: 20, xl: 22}}
              fontFamily={Fonts.LIGHT}>
              {data.value}
            </Box>
          </Box>
          <Box pl={-10} mr={-8} mb={-10}>
            {onGetGraph()}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default StatsCardWithGraph;
