import React from 'react';
import {Card} from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import CloseIcon from '@material-ui/icons/Close';
import {makeStyles} from '@material-ui/core/styles';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {ProfileData} from '../../../../types/models/Widgets';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface ProfileProps {
  data: ProfileData;
}

const Profile: React.FC<ProfileProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    pointer: {
      cursor: 'pointer',
    },
    avatar: {
      width: 100,
      height: 100,
      [theme.breakpoints.up('md')]: {
        width: 120,
        height: 120,
      },
      [theme.breakpoints.up('xl')]: {
        width: 170,
        height: 170,
      },
    },
    textUppercase: {
      textTransform: 'uppercase',
    },
  }));

  const classes = useStyles();
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height='1'
      display='flex'
      flexDirection='column'
      clone>
      <Card>
        <Box mb={5} display='flex' alignItems='center'>
          <Box
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            <IntlMessages id='common.profile' />
          </Box>
          <Box component='span' ml='auto' mt={1.5}>
            <CloseIcon className={classes.pointer} />
          </Box>
        </Box>

        <Box
          mb={8}
          flex='1'
          display='flex'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          textAlign='center'>
          <Avatar className={classes.avatar} src={data.image} />
          <Box
            mt={8}
            component='h3'
            fontFamily={Fonts.LIGHT}
            fontSize={{xs: 18, sm: 20, xl: 22}}>
            {data.name}
          </Box>
        </Box>

        <Box
          display='flex'
          justifyContent='space-between'
          textAlign='center'
          mb={1}>
          <Box px={{xs: 2, xl: 4}}>
            <Box
              component='span'
              display='block'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, sm: 20, xl: 22}}>
              {data.photos}
            </Box>
            <Box
              component='span'
              color='grey.500'
              display='block'
              fontSize={{xs: 14, xl: 16}}
              className={classes.textUppercase}>
              <IntlMessages id='dashboard.photos' />
            </Box>
          </Box>
          <Box px={{xs: 2, xl: 4}}>
            <Box
              component='span'
              display='block'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, sm: 20, xl: 22}}>
              {data.followers}
            </Box>
            <Box
              component='span'
              color='grey.500'
              display='block'
              fontSize={{xs: 14, xl: 16}}
              className={classes.textUppercase}>
              <IntlMessages id='dashboard.followers' />
            </Box>
          </Box>
          <Box px={{xs: 2, xl: 4}}>
            <Box
              component='span'
              display='block'
              mb={2}
              fontFamily={Fonts.LIGHT}
              fontSize={{xs: 18, sm: 20, xl: 22}}>
              {data.following}
            </Box>
            <Box
              component='span'
              color='grey.500'
              display='block'
              fontSize={{xs: 14, xl: 16}}
              className={classes.textUppercase}>
              <IntlMessages id='dashboard.following' />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Profile;
