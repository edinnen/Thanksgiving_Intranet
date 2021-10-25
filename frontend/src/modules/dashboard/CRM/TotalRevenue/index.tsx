import React from 'react';
import {Card} from '@material-ui/core';
import RevenueGraph from './RevenueGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {indigo} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {RevenueData} from '../../../../types/models/CRM';

interface TotalRevenueProps {
  revenueData: RevenueData;
}

const TotalRevenue: React.FC<TotalRevenueProps> = ({revenueData}) => {
  return (
    <>
      <Box
        component='h2'
        color='text.primary'
        fontSize={{xs: 18, sm: 20, xl: 22}}
        mb={{xs: 4, sm: 4, xl: 6}}
        fontFamily={Fonts.LIGHT}>
        <IntlMessages id='dashboard.totalRevenue' />
      </Box>
      <Box
        py={{xs: 5, sm: 5, xl: 5}}
        px={{xs: 6, sm: 6, xl: 6}}
        style={{backgroundColor: indigo[700]}}
        clone>
        <Card>
          <Box display='flex' flexDirection={{xs: 'column', sm: 'row'}}>
            <Box mr={{xs: 2, xl: 10}} display='flex' flexDirection='column'>
              <Box mb={4}>
                <Box
                  component='h3'
                  mb={1}
                  color='primary.contrastText'
                  fontFamily={Fonts.LIGHT}
                  fontSize={{xs: 18, sm: 20, xl: 22}}>
                  {revenueData.ytdRevenue}
                </Box>
                <Box
                  component='p'
                  mb={0}
                  fontSize={{xs: 16, xl: 18}}
                  color={indigo[200]}>
                  <IntlMessages id='dashboard.ytdRevenue' />
                </Box>
              </Box>
              <Box mt='auto' mx={{xs: -2, xl: -5}} mb={1} display='flex'>
                <Box px={{xs: 2, xl: 5}}>
                  <Box
                    mb={1}
                    component='h3'
                    color='primary.contrastText'
                    fontFamily={Fonts.LIGHT}
                    fontSize={{xs: 18, sm: 20, xl: 22}}>
                    {revenueData.clients}
                  </Box>
                  <Box
                    component='p'
                    mb={0}
                    fontSize={{xs: 16, xl: 18}}
                    color={indigo[200]}>
                    <IntlMessages id='dashboard.clients' />
                  </Box>
                </Box>

                <Box px={{xs: 2, xl: 5}}>
                  <Box
                    mb={1}
                    component='h2'
                    color='primary.contrastText'
                    fontFamily={Fonts.LIGHT}
                    fontSize={{xs: 18, sm: 20, xl: 22}}>
                    {revenueData.countries}
                  </Box>
                  <Box
                    component='p'
                    mb={0}
                    fontSize={{xs: 16, xl: 18}}
                    color={indigo[200]}>
                    <IntlMessages id='dashboard.countries' />
                  </Box>
                </Box>
              </Box>
            </Box>
            <Box ml='auto' mb={{xs: -6, xl: -2}}>
              <RevenueGraph data={revenueData.revenueGraphData} />
            </Box>
          </Box>
        </Card>
      </Box>
    </>
  );
};

export default TotalRevenue;
