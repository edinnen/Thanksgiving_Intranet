import React from 'react';
import {Card, makeStyles} from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {Favorite, FavoriteBorder} from '@material-ui/icons';
import Avatar from '@material-ui/core/Avatar';
import VisibilityIcon from '@material-ui/icons/Visibility';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ChatIcon from '@material-ui/icons/Chat';
import clsx from 'clsx';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface WallPaperProps {}

const WallPaper: React.FC<WallPaperProps> = () => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    imageCard: {
      backgroundImage: `url(/images/widgets/latestpost.png)`,
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
    textUppercase: {
      textTransform: 'uppercase',
    },
    avatar: {
      width: 70,
      height: 70,
    },
    textRes: {
      fontSize: 14,
      [theme.breakpoints.up('sm')]: {
        fontSize: 16,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
    textLg: {
      fontSize: 20,
      lineHeight: 1.25,
      [theme.breakpoints.up('sm')]: {
        fontSize: 24,
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: 30,
      },
    },
    marginRight: {
      marginRight: 0,
    },
    middleRoot: {
      display: 'block',
      [theme.breakpoints.up('sm')]: {
        verticalAlign: 'middle',
        display: 'inline-block',
      },
    },
  }));

  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card className={classes.imageCard}>
        <Box display='flex' alignItems='center' mb={{xs: 4, lg: 6}}>
          <Box
            component='p'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 16, xl: 18}}
            className={classes.textUppercase}>
            <IntlMessages id='dashboard.latestPost' />
          </Box>
          <Box ml='auto' mr={-3}>
            <FormControlLabel
              className={classes.marginRight}
              label=''
              control={
                <Checkbox
                  icon={<FavoriteBorder style={{color: 'white'}} />}
                  checkedIcon={<Favorite />}
                />
              }
            />
          </Box>
        </Box>

        <Box pt={10}>
          <Box mb={6}>
            <Avatar
              className={classes.avatar}
              src={require('assets/images/avatar/A1.jpg')}
            />
          </Box>

          <Box
            component='h1'
            fontFamily={Fonts.LIGHT}
            className={classes.textLg}>
            <IntlMessages id='dashboard.hdColorful' />
          </Box>
          <Box
            component='h1'
            fontFamily={Fonts.LIGHT}
            className={classes.textLg}>
            <IntlMessages id='dashboard.wallpaperFree' />
          </Box>

          <Box display='flex' alignItems='flex-end'>
            <Box
              component='h1'
              fontFamily={Fonts.LIGHT}
              className={classes.textLg}>
              <IntlMessages id='common.download' />
            </Box>
            <Box
              ml='auto'
              mr={-3}
              fontFamily={Fonts.LIGHT}
              display='flex'
              className={clsx(classes.textRes, classes.textUppercase)}>
              <Box component='span' display='block' px={3}>
                <VisibilityIcon className={classes.middleRoot} /> 11.7 K
              </Box>
              <Box component='span' display='block' px={3}>
                <FavoriteIcon className={classes.middleRoot} /> 2.6 K
              </Box>
              <Box component='span' display='block' px={3}>
                <ChatIcon className={classes.middleRoot} /> 345
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default WallPaper;
