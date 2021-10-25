import React from 'react';
import UserSignin from './UserSignin';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import IntlMessages from '../../../@crema/utility/IntlMessages';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../types/AppContextPropsType';

interface SigninProps {}

const Signin: React.FC<SigninProps> = (props) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    imgRoot: {
      cursor: 'pointer',
      display: 'inline-block',
      width: 140,
    },
    cardRoot: {
      maxWidth: '36rem',
      width: '100%',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      position: 'relative',
      paddingTop: 20,
      [theme.breakpoints.up('xl')]: {
        paddingTop: 32,
      },
      '&:before': {
        content: "''",
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        width: 130,
        height: 9,
        borderBottomRightRadius: 80,
        borderBottomLeftRadius: 80,
        marginRight: 'auto',
        marginLeft: 'auto',
        backgroundColor: theme.palette.primary.main,
      },
    },
  }));
  const classes = useStyles(props);

  return (
    <Box flex={1} display='flex' flexDirection='column' justifyContent='center'>
      <Box mb={{xs: 6, md: 8, xl: 18}} textAlign='center'>
        {/* <img
          className={classes.imgRoot}
          src={require('assets/images/logo-white-with-name.png')}
          alt='crema-logo'
        /> */}
        <Box component="h1">Thanksgiving Cabin</Box>
      </Box>

      <Box
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'>
        <Card className={classes.cardRoot}>
          <Box px={{xs: 6, sm: 10, xl: 15}}>
            <Box
              component='h2'
              mb={{xs: 3, xl: 6}}
              color='text.primary'
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 24, xl: 30}}>
              <IntlMessages id='common.login' />
            </Box>
          </Box>
          <UserSignin />
        </Card>
      </Box>
    </Box>
  );
};

export default Signin;
