import React from 'react';
import {Box} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

const AppLogoWhite = () => {
  const useStyles = makeStyles(() => ({
    logoRoot: {
      display: 'flex',
      flexDirection: 'row',
      cursor: 'pointer',
      alignItems: 'center',
    },
    logo: {
      height: 36,
      marginRight: 10,
    },
  }));
  const classes = useStyles();
  return (
    <Box className={classes.logoRoot}>
      <img
        className={classes.logo}
        src={require('assets/images/logo-white-with-name.png')}
        alt='crema-logo'
      />
    </Box>
  );
};

export default AppLogoWhite;
