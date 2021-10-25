import React from 'react';
import {Card} from '@material-ui/core';
import AccountGraph from './AccountGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {AccountData} from '../../../../types/models/Metrics';

interface YourAccountPorps {
  data: AccountData[];
}

const YourAccount: React.FC<YourAccountPorps> = ({data}) => {
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
          mb={2}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.yourAccount' />
        </Box>
        <Box mt='auto'>
          <AccountGraph data={data} />
        </Box>
      </Card>
    </Box>
  );
};

export default YourAccount;
