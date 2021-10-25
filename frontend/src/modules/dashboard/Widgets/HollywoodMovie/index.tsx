import React from 'react';
import clsx from 'clsx';
import {Card, makeStyles} from '@material-ui/core';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface HollywoodMovieProps {}

const HollywoodMovie: React.FC<HollywoodMovieProps> = () => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    imageCard: {
      backgroundImage: `url(/images/widgets/movie.png)`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      color: 'white',
      position: 'relative',
      minHeight: 300,

      '&:before': {
        content: '""',
        position: 'absolute',
        left: '0',
        top: '0',
        zIndex: 1,
        width: '100%',
        height: '100%',
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
      },

      '& > *': {
        position: 'relative',
        zIndex: 3,
      },
    },
    pointer: {
      cursor: 'pointer',
    },
    avatar: {
      width: 50,
      height: 50,
      [theme.breakpoints.up('sm')]: {
        width: 70,
        height: 70,
      },
      [theme.breakpoints.up('md')]: {
        width: 90,
        height: 90,
      },
      [theme.breakpoints.up('xl')]: {
        width: 110,
        height: 110,
      },
    },
    textLg: {
      fontSize: 20,
      [theme.breakpoints.up('sm')]: {
        fontSize: 24,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 30,
      },
    },
  }));

  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card className={classes.imageCard}>
        <Box height='100%' display='flex' flexDirection='column'>
          <Box
            flex={1}
            display='flex'
            alignItems='center'
            justifyContent='center'>
            <Box
              component='span'
              className={clsx(classes.pointer, classes.avatar)}>
              <img src={require('assets/images/playbutton.png')} alt='play' />
            </Box>
          </Box>
          <Box mt={3}>
            <Box
              component='h1'
              color='primary.contrastText'
              fontFamily={Fonts.LIGHT}
              className={classes.textLg}>
              <IntlMessages id='dashboard.hollywoodMovie' />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default HollywoodMovie;
