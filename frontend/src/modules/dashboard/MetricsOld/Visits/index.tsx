import React, {useState} from 'react';
import {Card} from '@material-ui/core';
import VisitsGraph from './VisitsGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {useIntl} from 'react-intl';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import AppSelect from '../../../../@crema/core/AppSelect';
import {VisitsData} from '../../../../types/models/Metrics';

interface VisitsProps {
  data: VisitsData;
}

const Visits: React.FC<VisitsProps> = ({data}) => {
  const [graphData, setGraphData] = useState(data.graphData.dataOne);

  const handleWeekChange = (value: string) => {
    switch (value) {
      case 'This Week':
        setGraphData(data.graphData.dataTwo);
        break;
      case 'Last Weeks':
        setGraphData(data.graphData.dataOne);
        break;
      case 'Last Month':
        setGraphData(data.graphData.dataThree);
        break;
      default:
        setGraphData(data.graphData.dataOne);
    }
  };

  const {messages} = useIntl();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height={1} clone>
      <Card>
        <Box
          mb={6}
          display='flex'
          alignItems='center'
          justifyContent='space-between'>
          <Box
            component='h3'
            color='text.primary'
            fontSize={{xs: 18, sm: 20, xl: 22}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='dashboard.visits' />
          </Box>
          <Box textAlign='right'>
            <AppSelect
              menus={[
                messages['dashboard.thisWeek'],
                messages['dashboard.lastWeeks'],
                messages['dashboard.lastMonth'],
              ]}
              defaultValue={messages['dashboard.thisWeek']}
              onChange={handleWeekChange}
            />
          </Box>
        </Box>

        <VisitsGraph data={graphData} />

        <Box
          mb={1}
          display='flex'
          alignItems='center'
          fontFamily={Fonts.LIGHT}
          justifyContent='space-between'
          style={{textTransform: 'uppercase'}}>
          <Box component='p' color='text.primary' fontSize={{xs: 16, xl: 18}}>
            <IntlMessages id='common.new' />
            <Box ml={2} component='span' color='primary.main'>
              {data.new}
            </Box>
          </Box>
          <Box component='p' color='text.primary' fontSize={{xs: 16, xl: 18}}>
            <IntlMessages id='common.returning' />
            <Box ml={2} component='span' color='primary.main'>
              {data.returning}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Visits;
