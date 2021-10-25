import React from 'react';
import {Card} from '@material-ui/core';
import EarningGraph from './EarningGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import Categories from './Categories';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {EarningInMonthData} from '../../../../types/models/Metrics';

interface EarningInMonthProps {
  data: EarningInMonthData[];
}

const EarningInMonth: React.FC<EarningInMonthProps> = ({data}) => {
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
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.earningInMonth' />
        </Box>
        <Box
          my={3}
          display='flex'
          flex='1'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'>
          <EarningGraph data={data} />
        </Box>
        <Categories data={data} />
      </Card>
    </Box>
  );
};

export default EarningInMonth;
