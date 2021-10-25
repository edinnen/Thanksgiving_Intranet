import React from 'react';
import {Card} from '@material-ui/core';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import GraphFile from './GraphFile';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {green} from '@material-ui/core/colors';
import {SalesData} from '../../../../types/models/Metrics';

interface FloatingGraphsProps {
  data: SalesData;
  title: any;
}

const FloatingGraphs: React.FC<FloatingGraphsProps> = ({data, title}) => {
  return (
    <Box textAlign='center' p={{xs: 4, sm: 6, xl: 8}} height={1} clone>
      <Card>
        <Box component='p' mb={3} color='grey.500' fontSize={{xs: 16, xl: 18}}>
          {title}
        </Box>
        <Box
          component='h3'
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}
          display='flex'
          alignItems='center'
          justifyContent='center'>
          <Box component='span' px={3}>
            {data.value}
          </Box>
          {data.change > 0 ? (
            <Box
              component='span'
              display='flex'
              alignItems='center'
              color={green[500]}
              fontFamily={Fonts.LIGHT}
              mt={1}
              fontSize={{xs: 14, sm: 16, xl: 20}}>
              <Box
                component='span'
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 14, sm: 16, xl: 18}}>
                <ArrowUpwardIcon />
              </Box>
              <Box component='span' ml={1} mb={1}>
                {data.change}
              </Box>
            </Box>
          ) : (
            <Box
              component='span'
              display='flex'
              alignItems='center'
              color='secondary.main'
              fontFamily={Fonts.LIGHT}
              mt={1}
              fontSize={{xs: 14, sm: 16, xl: 20}}>
              <Box
                component='span'
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 14, sm: 16, xl: 18}}>
                <ArrowDownwardIcon />
              </Box>
              <Box component='span' ml={1} mb={1}>
                {data.change}
              </Box>
            </Box>
          )}
        </Box>
        <Box m={-8} mt={-2}>
          <GraphFile
            graphData={data.graphData}
            strokeColor={data.strokeColor}
            areaColor={data.areaColor}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default FloatingGraphs;
