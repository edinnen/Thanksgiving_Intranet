import React, {useState} from 'react';
import {Card, makeStyles} from '@material-ui/core';
import DealsTable from './DealsTable';
import Select from '@material-ui/core/Select';
import Link from '@material-ui/core/Link';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {useIntl} from 'react-intl';
import Box from '@material-ui/core/Box';
import {grey} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {DealsTableData} from '../../../../types/models/CRM';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface DealsProps {
  dealsTableData: DealsTableData[];
}

const Deals: React.FC<DealsProps> = ({dealsTableData}) => {
  const [dealValue, setDealValue] = useState('allDeals');
  const [tableData, setTableData] = useState(dealsTableData);

  const handleChange = (event: React.ChangeEvent<{value: unknown}>) => {
    setDealValue(event.target.value as string);
    if (event.target.value === 'allDeals') {
      setTableData(dealsTableData);
    } else if (event.target.value === 'completed') {
      setTableData(
        dealsTableData.filter((data) => data.progress === 'Approved'),
      );
    } else {
      setTableData(
        dealsTableData.filter((data) => data.progress === 'Pending'),
      );
    }
  };

  const {messages} = useIntl();

  const useStyles = makeStyles((theme: CremaTheme) => ({
    selectBox: {
      cursor: 'pointer',
      color: grey[500],
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
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
    link: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));
  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height={1} clone>
      <Card>
        <Box mb={4} display='flex' alignItems='center'>
          <Box
            mr={{xs: 3, lg: 8}}
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.deals' />
          </Box>
          <Box mt={{xl: 1}}>
            <Select
              className={classes.selectBox}
              value={dealValue}
              onChange={handleChange}
              disableUnderline={true}>
              <option value='allDeals' className={classes.selectOption}>
                {messages['dashboard.allDeals']}
              </option>
              <option value='completed' className={classes.selectOption}>
                {messages['todo.completed']}
              </option>
              <option value='pending' className={classes.selectOption}>
                {messages['common.pending']}
              </option>
            </Select>
          </Box>
          <Box component='span' ml='auto'>
            <Link
              color='secondary'
              component='button'
              underline='none'
              className={classes.link}>
              <IntlMessages id='common.viewAll' />
            </Link>
          </Box>
        </Box>
        <DealsTable dealsTableData={tableData} />
      </Card>
    </Box>
  );
};

export default Deals;
