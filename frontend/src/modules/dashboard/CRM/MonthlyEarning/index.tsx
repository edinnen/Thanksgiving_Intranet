import React from 'react';
import Card from '@material-ui/core/Card';
import EarningGraph from './EarningGraph';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import Categories from './Categories';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {EarningGraphData} from '../../../../types/models/CRM';

interface MonthlyEarningProps {
  earningGraphData: EarningGraphData[];
}

export const MonthlyEarning: React.FC<MonthlyEarningProps> = ({
  earningGraphData,
}) => {
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height='100%'
      clone>
      <Card>
        <Box width={1}>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}
            textAlign='center'>
            <IntlMessages id='dashboard.earningInMonth' />
          </Box>
          <EarningGraph earningGraphData={earningGraphData} />
          <Divider />
          <Box pt={3}>
            <List>
              {earningGraphData.map((category) => {
                if (category.name !== '') {
                  return <Categories category={category} key={category.name} />;
                }
                return null;
              })}
            </List>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default MonthlyEarning;
