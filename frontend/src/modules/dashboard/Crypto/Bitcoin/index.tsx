import React, {useCallback, useEffect, useState} from 'react';
import Card from '@material-ui/core/Card';
import Select from '@material-ui/core/Select';
import BitcoinGraph from './BitcoinGraph';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {useIntl} from 'react-intl';
import {Box, makeStyles} from '@material-ui/core';
import {green, indigo} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CoinGraphData} from '../../../../types/models/Crypto';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface BitcoinProps {
  coinGraphData: CoinGraphData;
}

const Bitcoin: React.FC<BitcoinProps> = ({coinGraphData}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    selectBox: {
      fontSize: 18,
      fontFamily: Fonts.LIGHT,
      cursor: 'pointer',
      [theme.breakpoints.up('sm')]: {
        fontSize: 20,
      },
      [theme.breakpoints.up('md')]: {
        marginRight: 8,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 24,
      },
      '& .MuiSelect-select': {
        paddingLeft: 10,
        paddingRight: 24,
      },
      '& .MuiSelect-icon': {
        width: 34,
        height: 34,
        fontSize: '2rem',
        top: 'calc(50% - 17px)',
      },
    },
    selectBoxOption: {
      cursor: 'pointer',
      padding: 12,
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
    muiTabsRoot: {
      position: 'relative',
      '& .Mui-selected': {
        fontFamily: Fonts.LIGHT,
      },
    },
    muiTab: {
      fontSize: 16,
      textTransform: 'capitalize',
      padding: 0,
      marginLeft: 4,
      marginRight: 4,
      minWidth: 10,
      [theme.breakpoints.up('sm')]: {
        marginLeft: 8,
        marginRight: 8,
        fontSize: 16,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
        marginLeft: 20,
        marginRight: 20,
      },
    },
  }));

  const classes = useStyles();

  const onGetCoinData = useCallback(
    (coin) => {
      switch (coin) {
        case 'Bitcoin': {
          return coinGraphData.bitcoin;
        }
        case 'Litecoin': {
          return coinGraphData.litecoin;
        }
        case 'Ripple': {
          return coinGraphData.ripple;
        }
        default:
          return coinGraphData.bitcoin;
      }
    },
    [coinGraphData],
  );

  const [graphType, setGraphType] = useState(0);
  const [coinType, setCoinType] = useState('Bitcoin');
  const [coinData, setCoinData] = useState(onGetCoinData(coinType));

  useEffect(() => {
    setCoinData(onGetCoinData(coinType));
  }, [coinType, onGetCoinData]);

  const handleChange = (e: React.ChangeEvent<{}>, newValue: number) => {
    setGraphType(newValue);
  };

  const handleSelectValue = (event: React.ChangeEvent<{value: unknown}>) => {
    setCoinType(event.target.value as string);
  };

  const {messages} = useIntl();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card>
        <Box
          mt={-2}
          display='flex'
          flexDirection={{xs: 'column', md: 'row'}}
          alignItems={{md: 'center'}}>
          <Box ml={-3} flex='1' display='flex' alignItems='center'>
            <Box display='inline-block'>
              <Select
                value={coinType}
                disableUnderline={true}
                onChange={handleSelectValue}
                className={classes.selectBox}>
                <option value='Bitcoin' className={classes.selectBoxOption}>
                  {messages['dashboard.bitcoin']}
                </option>
                <option value='Litecoin' className={classes.selectBoxOption}>
                  {messages['dashboard.litecoin']}
                </option>
                <option value='Ripple' className={classes.selectBoxOption}>
                  {messages['dashboard.ripple']}
                </option>
              </Select>
            </Box>
            <Box display='flex' alignItems='center'>
              <Box
                component='h3'
                mx={2}
                fontFamily={Fonts.LIGHT}
                color={indigo[700]}
                fontSize={{xs: 18, sm: 18, lg: 20, xl: 24}}>
                $7280.45
              </Box>
              <Box
                component='span'
                mt={1}
                fontFamily={Fonts.MEDIUM}
                color={green[600]}
                fontSize={{xs: 16, xl: 18}}>
                0.8%
              </Box>
            </Box>
          </Box>
          <Box ml={{md: 'auto'}}>
            <Tabs
              className={classes.muiTabsRoot}
              value={graphType}
              onChange={handleChange}
              indicatorColor='primary'
              textColor='primary'>
              <Tab
                className={classes.muiTab}
                label={<IntlMessages id='common.yearly' />}
              />
              <Tab
                className={classes.muiTab}
                label={<IntlMessages id='common.monthly' />}
              />
              <Tab
                className={classes.muiTab}
                label={<IntlMessages id='common.weekly' />}
              />
              <Tab
                className={classes.muiTab}
                label={<IntlMessages id='common.today' />}
              />
            </Tabs>
          </Box>
        </Box>

        <Box ml={-3}>
          {graphType === 0 && (
            <BitcoinGraph data={coinData.yearlyData} value={graphType} />
          )}
          {graphType === 1 && (
            <BitcoinGraph data={coinData.monthlyData} value={graphType} />
          )}
          {graphType === 2 && (
            <BitcoinGraph data={coinData.weeklyData} value={graphType} />
          )}
          {graphType === 3 && (
            <BitcoinGraph data={coinData.dailyData} value={graphType} />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default Bitcoin;
