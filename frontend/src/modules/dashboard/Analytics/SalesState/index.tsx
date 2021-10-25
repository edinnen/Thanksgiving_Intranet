import React from 'react';
import Box from '@material-ui/core/Box';
import {Fonts} from 'shared/constants/AppEnums';
import IconButton from '@material-ui/core/IconButton';
import GridContainer from '../../../../@crema/core/GridContainer';
import Grid from '@material-ui/core/Grid';
import AppCard from '../../../../@crema/core/AppCard';
import AppSelect from '../../../../@crema/core/AppSelect';
import {useIntl} from 'react-intl';
import {ChartData, SalesStateData} from '../../../../types/models/Analytics';

interface SalesStateProps {
  salesState: SalesStateData[];
  chartData: ChartData[];
}

const SalesState: React.FC<SalesStateProps> = ({salesState, chartData}) => {
  const handleSelectionType = (data: any) => {
    console.log('data: ', data);
  };
  const {messages} = useIntl();
  return (
    <AppCard
      title={messages['dashboard.analytics.salesState']}
      height={1}
      action={
        <AppSelect
          menus={[
            messages['dashboard.thisWeek'],
            messages['dashboard.lastWeeks'],
            messages['dashboard.lastMonth'],
          ]}
          defaultValue={messages['dashboard.thisWeek']}
          onChange={handleSelectionType}
        />
      }>
      <Box
        textAlign={{xs: 'center', sm: 'left'}}
        component='p'
        color='grey.400'
        mb={{xs: 1, md: 3, lg: 5}}>
        1343 {messages['dashboard.analytics.salesThisWeek']}
      </Box>

      <GridContainer>
        <Grid item xs={12} sm={5}>
          <Box
            width={1}
            height={1}
            display='flex'
            flexDirection='column'
            justifyContent='center'
            alignItems={{xs: 'center', sm: 'flex-start'}}>
            {/*<ReactSvgPieChart expandSize={5} data={chartData} expandOnHover/>*/}
          </Box>
        </Grid>

        <Grid item xs={12} sm={7}>
          <Box
            width={1}
            ml={2}
            display='flex'
            flexDirection='column'
            alignItems='flex-start'>
            {salesState.map((item: SalesStateData, index: number) => (
              <Box
                key={'salesState-' + index}
                pl={{xl: 6}}
                display='flex'
                alignItems='center'>
                <Box p={3} fontSize={{xs: 30, md: 48}} clone>
                  <IconButton size='medium'>
                    <img alt='' style={{maxWidth: 50}} src={item.icon} />
                  </IconButton>
                </Box>

                <Box position='relative' ml={{xs: 3, xl: 6}}>
                  <Box
                    component='h3'
                    display='inline-block'
                    fontFamily={Fonts.LIGHT}
                    mb={1}
                    fontSize={{xs: 18, sm: 20, xl: 22}}>
                    ${item.amount}
                  </Box>
                  <Box
                    component='p'
                    color='grey.500'
                    fontSize={{xs: 16, xl: 18}}>
                    {item.type}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </GridContainer>
    </AppCard>
  );
};
export default SalesState;
