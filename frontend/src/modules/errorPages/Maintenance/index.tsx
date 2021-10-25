import React from 'react';
import Button from '@material-ui/core/Button';
import {useHistory} from 'react-router-dom';
import IntlMessages from '../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {grey} from '@material-ui/core/colors';
import {makeStyles} from '@material-ui/core';
import {Fonts} from '../../../shared/constants/AppEnums';
import {initialUrl} from '../../../shared/constants/AppConst';
import {CremaTheme} from '../../../types/AppContextPropsType';

interface MaintenanceProps {}

const Maintenance: React.FC<MaintenanceProps> = () => {
  const history = useHistory();

  const onGoBackToHome = () => {
    history.push(initialUrl);
  };

  const useStyles = makeStyles((theme: CremaTheme) => {
    return {
      button: {
        fontFamily: Fonts.LIGHT,
        fontSize: 16,
        textTransform: 'capitalize',
        padding: '12px 32px',
        [theme.breakpoints.up('xl')]: {
          fontSize: 20,
        },
      },
    };
  });

  const classes = useStyles();

  return (
    <>
      <Box
        py={{xl: 8}}
        flex={1}
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        textAlign='center'>
        <Box mb={{xs: 8, xl: 16}}>
          <Box
            component='h3'
            mb={{xs: 4, xl: 12}}
            fontSize={{xs: 24, md: 28}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='error.mantainanceMessage1' />
          </Box>
          <Box
            mb={{xs: 5, xl: 16}}
            color={grey[600]}
            fontSize={20}
            fontFamily={Fonts.MEDIUM}>
            <Typography>
              <IntlMessages id='error.mantainanceMessage2' />
            </Typography>
            <Typography>
              <IntlMessages id='error.mantainanceMessage3' />.
            </Typography>
          </Box>
          <Button
            variant='contained'
            color='primary'
            className={classes.button}
            onClick={onGoBackToHome}>
            <IntlMessages id='error.takeMeToHome' />
          </Button>
        </Box>
        <Box mb={5} maxWidth={{xs: 300, sm: 400, xl: 672}} width='100%'>
          <img
            src={require('assets/images/errorPageImages/maintenance.png')}
            alt='404'
          />
        </Box>
      </Box>
    </>
  );
};

export default Maintenance;
