import React from 'react';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {green, red} from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import {Card, makeStyles} from '@material-ui/core';
import StatGraphs from './StatGraphs';
import {RevenueCards} from '../../../../types/models/Analytics';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface StateCardProps {
  data: RevenueCards;
}

const StateCard: React.FC<StateCardProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    statsCard: {
      borderRadius: theme.overrides.MuiCard.root.borderRadius,
      padding: '20px 24px',
    },
    icon: {
      height: 50,
      width: 50,
      marginLeft: 'auto',
      marginRight: -20,
      marginTop: -12,
    },
    statGraphs: {
      margin: '0 -24px -20px',
    },
  }));
  const classes = useStyles();

  return (
    <Card className={classes.statsCard}>
      <Box display='flex' flex={1} flexDirection='column'>
        <Box display='flex' flex={1} flexDirection='row'>
          <Box position='relative' mr={{xs: 3, xl: 6}}>
            <Box mb={1}>
              <Box
                component='h3'
                display='inline-block'
                fontFamily={Fonts.LIGHT}
                fontSize={{xs: 18, sm: 20, xl: 22}}>
                {data.value}
              </Box>
              <Box
                component='span'
                ml={3}
                fontSize={{xs: 16, xl: 18}}
                fontFamily={Fonts.MEDIUM}
                color={data.growth > 0.0 ? green[500] : red[500]}>
                {data.growth}%
              </Box>
            </Box>
            <Box
              component='p'
              fontSize={{xs: 16, xl: 18}}
              color='grey.500'
              mb={1}>
              {data.type}
            </Box>
          </Box>
          <IconButton className={classes.icon}>
            <img alt='icon' src={data.icon} />
          </IconButton>
        </Box>
        <Box className={classes.statGraphs}>
          <StatGraphs data={data.graphData} strokeColor={data.strokeColor} />
        </Box>
      </Box>
    </Card>
  );
};

export default StateCard;
