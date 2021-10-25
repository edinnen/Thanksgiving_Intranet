import React, {useState} from 'react';
import {Card} from '@material-ui/core';
import SubscriptionGraph from './SubscriptionGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {useIntl} from 'react-intl';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import AppSelect from '../../../../@crema/core/AppSelect';
import {SubscriptionData} from '../../../../types/models/Metrics';

interface SubscriptionsProps {
  data: SubscriptionData;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({data}) => {
  const [graphData, setGraphData] = useState(data.dataOne);

  const handleYearChange = (value: number) => {
    switch (value) {
      case 2017:
        setGraphData(data.dataTwo);
        break;
      case 2018:
        setGraphData(data.dataThree);
        break;
      case 2019:
        setGraphData(data.dataOne);
        break;
      default:
        setGraphData(data.dataOne);
    }
  };

  const handleMonthChange = (value: string) => {
    switch (value) {
      case 'June':
        setGraphData(data.dataTwo);
        break;
      case 'July':
        setGraphData(data.dataThree);
        break;
      case 'August':
        setGraphData(data.dataOne);
        break;
      default:
        setGraphData(data.dataThree);
    }
  };

  const {messages} = useIntl();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height={1} clone>
      <Card>
        <Box height={1}>
          <Box
            display='flex'
            flexDirection={{xs: 'column', sm: 'row'}}
            alignItems={{xs: 'center'}}
            justifyContent={{sm: 'space-between'}}
            mb={3}>
            <Box
              component='h3'
              color='text.primary'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, sm: 20, xl: 22}}>
              <IntlMessages id='dashboard.subscriptions' />
            </Box>
            <Box textAlign={{sm: 'right'}}>
              <AppSelect
                menus={[2019, 2018, 2017]}
                defaultValue={2019}
                onChange={handleYearChange}
              />
              <AppSelect
                menus={[
                  messages['common.june'],
                  messages['common.july'],
                  messages['common.august'],
                ]}
                defaultValue={messages['common.june']}
                onChange={handleMonthChange}
              />
            </Box>
          </Box>

          <SubscriptionGraph data={graphData} />
        </Box>
      </Card>
    </Box>
  );
};

export default Subscriptions;
