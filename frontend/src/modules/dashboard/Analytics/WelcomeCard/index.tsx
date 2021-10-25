import React from 'react';
import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import {makeStyles} from '@material-ui/core';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {useIntl} from 'react-intl';
import {WelcomeCardData} from '../../../../types/models/Analytics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface WelcomeCardProps {
  data: WelcomeCardData[];
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    textRoot: {
      textTransform: 'capitalize',
    },
    graphText: {
      fontFamily: Fonts.MEDIUM,
      fontSize: 16,
      [theme.breakpoints.up('xl')]: {
        fontSize: 18,
      },
    },
    textTruncate: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    imgRoot: {
      display: 'flex',
      alignItems: 'flex-end',
      marginRight: -24,
      marginBottom: -20,
      [theme.breakpoints.up('sm')]: {
        height: 150,
      },
      [theme.breakpoints.up('xl')]: {
        height: 200,
      },
      '& img': {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
    },
    ancer: {
      cursor: 'pointer',
      borderBottom: `1px solid ${theme.palette.primary.main}`,
    },
    specialTitle: {
      position: 'relative',
      lineHeight: 1,
      marginBottom: 5,
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: -12,
        width: 3,
        backgroundColor: theme.palette.primary.main,
        borderRadius: 8,
      },
    },
  }));

  const classes = useStyles();
  const {messages} = useIntl();
  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      mb={{xs: 5, md: 8}}
      display='flex'
      clone>
      <Card>
        <Box flex={1} display='flex' flexDirection={{xs: 'column', sm: 'row'}}>
          <Box
            mr={{xs: 2, xl: 10}}
            flex={1}
            display='flex'
            flexDirection='column'
            justifyContent='space-between'>
            <Box mb={3}>
              <Box
                component='h5'
                color='text.primary'
                fontFamily={Fonts.MEDIUM}
                fontSize={{xs: 14, sm: 16, xl: 18}}>
                {messages['dashboard.analytics.welcome']}
              </Box>
              <Box
                component='h3'
                color='text.primary'
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 18, sm: 20, xl: 22}}>
                {messages['dashboard.analytics.eddieMassy']}
              </Box>
            </Box>
            <Box
              display='flex'
              flexDirection='row'
              justifyContent='space-between'>
              {data.map((item, index) => (
                <Box key={'box-' + index} pl={3} mr={3}>
                  <Box
                    className={classes.specialTitle}
                    component='h5'
                    color='text.primary'
                    fontFamily={Fonts.MEDIUM}
                    fontSize={{xs: 18, xl: 20}}>
                    {item.counts}
                  </Box>

                  <Box
                    className={classes.ancer}
                    component='a'
                    fontSize={{xs: 16, xl: 18}}
                    color='primary.main'>
                    {item.type}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
          <Box className={classes.imgRoot}>
            <img
              alt='welcome'
              src={require('assets/images/dashboard/welcomImage.png')}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default WelcomeCard;
