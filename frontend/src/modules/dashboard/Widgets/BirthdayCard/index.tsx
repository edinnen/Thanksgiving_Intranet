import React from 'react';
import {Box, Card, makeStyles} from '@material-ui/core';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {blue} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface BirthdayCardProps {}

const BirthdayCard: React.FC<BirthdayCardProps> = () => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    textBase: {
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
  }));

  const classes = useStyles();
  return (
    <Box display='flex' flexDirection='column' p={0} height='1' clone>
      <Card>
        <Box
          p={{xs: 5, xl: 8}}
          color='primary.contrastText'
          textAlign='center'
          bgcolor={blue[700]}>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            Sunday, 07 July 1991
          </Box>
        </Box>
        <Box px={{xs: 6, sm: 8, xl: 10}} py={{xs: 5, sm: 7, xl: 8}}>
          <Box
            py={{xs: 4, lg: 6, xl: 10}}
            flex={1}
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'>
            <img src={require('assets/images/cakeicon.png')} alt='cake' />
          </Box>
          <Box mb={{xl: 5}} textAlign='center'>
            <Box component='p' className={classes.textBase}>
              <IntlMessages id='dashboard.antonBirthday' />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default BirthdayCard;
