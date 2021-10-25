import React, {useState} from 'react';
import {Card} from '@material-ui/core';
import StatsGraph from './StatsGraph';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {useIntl} from 'react-intl';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';
import AppSelect from '../../../../@crema/core/AppSelect';
import {StatsGraphData} from '../../../../types/models/Metrics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface StatsProps {
  data: StatsGraphData;
}

const Stats: React.FC<StatsProps> = ({data}) => {
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

  const useStyles = makeStyles((theme: CremaTheme) => ({
    selectBox: {
      marginLeft: 12,
      cursor: 'pointer',
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        marginLeft: 24,
        fontSize: 18,
      },
      '& .MuiSelect-select': {
        paddingLeft: 10,
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
    textTruncate: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      width: '100%',
    },
  }));

  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height={1} clone>
      <Card>
        <Box display='flex' flexDirection='column' height={1}>
          <Box
            mb={3}
            display='flex'
            flexDirection={{xs: 'column', sm: 'row'}}
            alignItems={{sm: 'center'}}>
            <Box
              component='h3'
              color='text.primary'
              mb={2}
              className={classes.textTruncate}
              fontSize={{xs: 18, sm: 20, xl: 22}}
              fontFamily={Fonts.LIGHT}>
              <IntlMessages id='dashboard.companyProduction' />
            </Box>
            <Box ml={{sm: 'auto'}} display='flex' alignItems='center'>
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

          <StatsGraph data={graphData} />
        </Box>
      </Card>
    </Box>
  );
};

export default Stats;
