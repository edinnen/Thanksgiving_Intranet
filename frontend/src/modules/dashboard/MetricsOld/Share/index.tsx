import React from 'react';
import Box from '@material-ui/core/Box';
import {Card, makeStyles} from '@material-ui/core';
import {blue, grey, indigo, pink, red, teal} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {ShareData} from '../../../../types/models/Metrics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface ShareProps {
  data: ShareData;
}

const Share: React.FC<ShareProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    shareitem: {
      width: 65,
      color: theme.palette.primary.contrastText,
      padding: '6px 5px',
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height={1} clone>
      <Card>
        <Box
          component='h3'
          color='text.primary'
          mb={3}
          fontSize={{xs: 18, sm: 20, xl: 22}}
          fontFamily={Fonts.LIGHT}>
          Share
        </Box>
        <Box mx={-1} display='flex' flexWrap='wrap'>
          <Box
            mb={2}
            mx={1}
            bgcolor={indigo[700]}
            className={classes.shareitem}>
            <i className='zmdi zmdi-facebook' />
            <Box component='span' ml={1}>
              {data.facebook}
            </Box>
          </Box>
          <Box mb={2} mx={1} bgcolor={blue[700]} className={classes.shareitem}>
            <i className='zmdi zmdi-twitter' />
            <Box component='span' ml={1}>
              {data.twitter}
            </Box>
          </Box>
          <Box mb={2} mx={1} bgcolor={pink[400]} className={classes.shareitem}>
            <i className='zmdi zmdi-dribbble' />
            <Box component='span' ml={1}>
              {data.bitbucket}
            </Box>
          </Box>
          <Box mb={2} mx={1} bgcolor={teal[700]} className={classes.shareitem}>
            <i className='zmdi zmdi-vimeo' />
            <Box component='span' ml={1}>
              198
            </Box>
          </Box>
          <Box mb={2} mx={1} bgcolor={teal[900]} className={classes.shareitem}>
            <i className='zmdi zmdi-tumblr' />
            <Box component='span' ml={1}>
              25
            </Box>
          </Box>
          <Box mb={2} mx={1} bgcolor={red[600]} className={classes.shareitem}>
            <i className='zmdi zmdi-youtube' />
            <Box component='span' ml={1}>
              41
            </Box>
          </Box>
          <Box mb={2} mx={1} bgcolor={blue[500]} className={classes.shareitem}>
            <i className='zmdi zmdi-linkedin' />
            <Box component='span' ml={1}>
              {data.linkedin}
            </Box>
          </Box>
          <Box mb={2} mx={1} bgcolor={grey[900]} className={classes.shareitem}>
            <i className='zmdi zmdi-google' />
            <Box component='span' ml={1}>
              {data.google}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Share;
