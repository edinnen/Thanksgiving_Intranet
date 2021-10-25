import React from 'react';
import Card from '@material-ui/core/Card';
import TicketSupportTable from './TicketSupportTable';
import Link from '@material-ui/core/Link';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {TicketSupportDataProps} from '../../../../types/models/CRM';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface TicketSupportProps {
  ticketSupportData: TicketSupportDataProps[];
}

const TicketSupport: React.FC<TicketSupportProps> = ({ticketSupportData}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    link: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));

  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} clone>
      <Card>
        <Box mb={4} display='flex' alignItems='center'>
          <Box
            component='h2'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='dashboard.latestTicketSupport' />
          </Box>
          <Box component='span' ml='auto' display='flex' alignItems='center'>
            <Link
              color='secondary'
              component='button'
              underline='none'
              className={classes.link}>
              <IntlMessages id='common.viewAll' />
            </Link>
          </Box>
        </Box>
        <TicketSupportTable ticketSupportData={ticketSupportData} />
      </Card>
    </Box>
  );
};

export default TicketSupport;
