import React from 'react';
import {Card} from '@material-ui/core';
import FavoriteIcon from '@material-ui/icons/Favorite';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {SocialData} from '../../../../types/models/Metrics';

interface SocialDataCardPorps {
  data: SocialData;
}

const SocialDataCard: React.FC<SocialDataCardPorps> = ({data}) => {
  return (
    <Box
      py={{xs: 4, sm: 6, xl: 8}}
      px={{xs: 6, sm: 6, xl: 10}}
      height={1}
      display='flex'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      clone>
      <Card>
        <Box width='100%' py={{xs: 4, xl: 8}} display='flex' textAlign='center'>
          <Box px={3} width='50%' borderRight={4} borderColor='grey.100'>
            <Box
              color='secondary.main'
              fontSize={{xs: 24, sm: 30, xl: 36}}
              mb={2}
              clone>
              <FavoriteIcon />
            </Box>
            <Box
              component='h3'
              mb={2}
              fontSize={{xs: 18, sm: 20, xl: 22}}
              fontFamily={Fonts.LIGHT}>
              {data.likes}
            </Box>
            <Box
              component='p'
              color='grey.500'
              mb={1}
              fontSize={{xs: 16, xl: 18}}
              fontFamily={Fonts.REGULAR}>
              <IntlMessages id='common.likes' />
            </Box>
          </Box>

          <Box width='50%' px={3}>
            <Box
              color='primary.main'
              fontSize={{xs: 24, sm: 30, xl: 36}}
              mb={2}
              clone>
              <SpeakerNotesIcon />
            </Box>
            <Box
              component='h3'
              mb={2}
              fontSize={{xs: 18, sm: 20, xl: 22}}
              fontFamily={Fonts.LIGHT}>
              {data.comments}
            </Box>
            <Box
              component='p'
              color='grey.500'
              mb={1}
              fontSize={{xs: 16, xl: 18}}
              fontFamily={Fonts.REGULAR}>
              <IntlMessages id='common.comments' />
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default SocialDataCard;
