import React, {useState} from 'react';
import Select from '@material-ui/core/Select';
import {Card} from '@material-ui/core';
import OrdersGraph from './OrdersGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {OrdersData} from '../../../../types/models/Metrics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface OrdersProps {
  data: OrdersData;
}

const Orders: React.FC<OrdersProps> = ({data}) => {
  const [weekValue, setWeekValue] = useState('Last Weeks');

  const [graphData, setGraphData] = useState(data.graphData.dataTwo);

  const handleWeekChange = (event: React.ChangeEvent<{value: unknown}>) => {
    setWeekValue(event.target.value as string);
    switch (event.target.value) {
      case 'This Week':
        setGraphData(data.graphData.dataOne);
        break;
      case 'Last Weeks':
        setGraphData(data.graphData.dataTwo);
        break;
      case 'Last Month':
        setGraphData(data.graphData.dataThree);
        break;
      default:
        setGraphData(data.graphData.dataOne);
    }
  };

  const useStyles = makeStyles((theme: CremaTheme) => ({
    root: {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
    },
    selectBox: {
      cursor: 'pointer',
      fontSize: 16,
      color: '#FFFFFF88',
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
      '& .MuiSelect-select': {
        paddingLeft: 10,
      },
      '& .MuiSelect-icon': {
        color: theme.palette.primary.contrastText,
      },
    },
    selectOption: {
      cursor: 'pointer',
      padding: 8,
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));
  const classes = useStyles();

  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height={1}
      className={classes.root}
      clone>
      <Card>
        <Box
          mb={6}
          display='flex'
          alignItems='center'
          justifyContent='space-between'>
          <Box
            component='h3'
            color='primary.contrastText'
            fontSize={{xs: 18, sm: 20, xl: 22}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='common.orders' />
          </Box>
          <Box textAlign='right'>
            <Select
              className={classes.selectBox}
              value={weekValue}
              onChange={handleWeekChange}
              disableUnderline={true}>
              <option value='This Week' className={classes.selectOption}>
                This Week
              </option>
              <option value='Last Weeks' className={classes.selectOption}>
                Last Weeks
              </option>
              <option value='Last Month' className={classes.selectOption}>
                Last Month
              </option>
            </Select>
          </Box>
        </Box>

        <OrdersGraph data={graphData} />

        <Box
          mb={1}
          mt={5}
          display='flex'
          alignItems='center'
          fontFamily={Fonts.LIGHT}
          justifyContent='space-between'
          style={{textTransform: 'uppercase'}}>
          <Box component='p' color='#FFFFFF88' fontSize={{xs: 16, xl: 18}}>
            <IntlMessages id='common.revenue' />
            <Box ml={2} component='span' color='primary.contrastText'>
              {data.revenue}
            </Box>
          </Box>
          <Box component='p' color='#FFFFFF88' fontSize={{xs: 16, xl: 18}}>
            <IntlMessages id='common.orders' />
            <Box ml={2} component='span' color='primary.contrastText'>
              {data.orders}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Orders;
