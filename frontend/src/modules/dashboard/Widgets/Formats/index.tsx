import React from 'react';
import {Card, makeStyles} from '@material-ui/core';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from 'shared/constants/AppEnums';
import {FormatList} from '../../../../types/models/Widgets';
import {CremaTheme} from '../../../../types/AppContextPropsType';

interface FormatsProps {
  data: FormatList[];
}

const Formats: React.FC<FormatsProps> = ({data}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    radioLabelGroup: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginLeft: '-25px',
      marginRight: '-15px',
    },

    radioLabel: {
      width: '50%',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '15px',
      paddingRight: '15px',
      marginLeft: 0,
      marginRight: 0,
      marginBottom: 2,

      '& .MuiTypography-body1': {
        fontSize: 18,
        fontFamily: `${Fonts.LIGHT} !important`,
        color: '#A8A8A8',
        marginLeft: 10,
        marginBottom: 6,
        [theme.breakpoints.up('xl')]: {
          fontSize: 20,
        },
      },
    },
  }));

  const classes = useStyles();

  return (
    <Box py={{xs: 5, sm: 5, xl: 5}} px={{xs: 6, sm: 6, xl: 6}} height='1' clone>
      <Card>
        <Box
          component='h3'
          mb={5}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.formats' />
        </Box>

        <RadioGroup className={classes.radioLabelGroup}>
          {data.map((item) => {
            return (
              <FormControlLabel
                key={item.id}
                value={item.name}
                control={<Radio />}
                label={item.name}
                className={classes.radioLabel}
              />
            );
          })}
        </RadioGroup>
      </Card>
    </Box>
  );
};

export default Formats;
