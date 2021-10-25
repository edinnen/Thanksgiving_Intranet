import React from 'react';
import {Card} from '@material-ui/core';
import SalesGraph from './SalesGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {SalesData} from '../../../../types/models/Metrics';

interface SalesProps {
  data: SalesData;
}

const Sales: React.FC<SalesProps> = ({data}) => {
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height={1}
      display='flex'
      flexDirection='column'
      clone>
      <Card>
        <Box
          component='h3'
          color='text.primary'
          mb={3}
          fontSize={{xs: 18, sm: 20, xl: 22}}
          fontFamily={Fonts.LIGHT}>
          <IntlMessages id='dashboard.salesToday' />
        </Box>
        <Box
          component='h2'
          mb={2}
          color='grey.400'
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 36, md: 42, xl: 50}}>
          {data.salesToday}
        </Box>
        <Box component='p' color='secondary.main' fontSize={{xs: 16, xl: 18}}>
          {data.salesYesterday} <IntlMessages id='common.yesterday' />
        </Box>
        <Box mt='auto'>
          <SalesGraph data={data.salesGraphData} />
        </Box>
      </Card>
    </Box>
  );
};

export default Sales;
