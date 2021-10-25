import React from 'react';
import Button from '@material-ui/core/Button';
import {useHistory} from 'react-router-dom';
import IntlMessages from '../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core';
import {grey} from '@material-ui/core/colors';
import {Fonts} from '../../../shared/constants/AppEnums';
import {initialUrl} from '../../../shared/constants/AppConst';
import {CremaTheme} from '../../../types/AppContextPropsType';

interface MaintenanceProps {}

const Error500: React.FC<MaintenanceProps> = () => {
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
      image: {
        width: '100%',
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
        <Box
          mb={{xs: 4, xl: 8}}
          maxWidth={{xs: 200, sm: 300, xl: 624}}
          width='100%'>
          <img
            className={classes.image}
            src={require('assets/images/errorPageImages/500.png')}
            alt='500'
          />
        </Box>
        <Box mb={{xs: 4, xl: 5}}>
          <Box
            component='h3'
            mb={{xs: 3, xl: 10}}
            fontSize={{xs: 24, md: 28}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='error.500Error' />.
          </Box>
          <Box
            mb={{xs: 4, xl: 10}}
            color={grey[600]}
            fontSize={20}
            fontFamily={Fonts.MEDIUM}>
            <Typography>
              <IntlMessages id='error.500Message1' />
            </Typography>
            <Typography>
              <IntlMessages id='error.500Message2' />
            </Typography>
          </Box>
          <Button
            variant='contained'
            color='primary'
            className={classes.button}
            onClick={onGoBackToHome}>
            <IntlMessages id='error.goBackToHome' />
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Error500;
