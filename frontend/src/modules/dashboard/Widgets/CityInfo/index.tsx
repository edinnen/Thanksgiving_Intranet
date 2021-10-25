import React from 'react';
import Slider from 'react-slick';
import Card from '@material-ui/core/Card';
import {makeStyles} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CityData} from '../../../../types/models/Widgets';
import {CremaTheme} from '../../../../types/AppContextPropsType';

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

interface CityInfoProps {
  cityData: CityData[];
}

const CityInfo: React.FC<CityInfoProps> = ({cityData}) => {
  const useStyles = makeStyles((theme: CremaTheme) => ({
    imageCardSlide: {
      position: 'relative',
      paddingBottom: 0,
      height: '100%',

      '& .slick-list, & .slick-track, & .slick-slide > div': {
        height: '100%',
      },

      '& .slick-dots': {
        bottom: 30,
      },

      '& .slick-dots li': {
        marginLeft: 6,
        marginRight: 6,
      },

      '& .slick-dots li button': {
        width: 10,
        height: 10,
        [theme.breakpoints.up('xl')]: {
          width: 14,
          height: 14,
        },
      },

      '& .slick-dots li button:before': {
        color: 'transparent',
        border: 'solid 2px #fff',
        opacity: 1,
        borderRadius: '50%',
        width: 10,
        height: 10,
        [theme.breakpoints.up('xl')]: {
          width: 14,
          height: 14,
        },
      },

      '& .slick-dots li.slick-active button:before': {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
      },

      '& .slick-prev': {
        top: 36,
        left: 36,
        zIndex: 3,
      },

      '& .slick-next': {
        top: 36,
        right: 36,
        zIndex: 3,
      },
    },

    imageSlide: {
      position: 'relative',
      textAlign: 'center',
      fontSize: 20,
      height: '100%',
      [theme.breakpoints.up('xl')]: {
        fontSize: 24,
      },
    },

    imageSlideFull: {
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: -1,
      width: '100% !important',
      height: '100% !important',
      objectFit: 'cover',
    },

    imageSlideContent: {
      width: '100%',
      height: '100%',
      color: 'white',
      padding: '20px 20px 60px',
      display: 'flex',
      flexDirection: 'column',

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
    widthFull: {
      width: '100%',
    },
  }));

  const classes = useStyles();

  return (
    <Box height='1' clone>
      <Card>
        <Slider className={classes.imageCardSlide} {...settings}>
          {cityData.map((city) => {
            return (
              <Box key={city.id} className={classes.imageSlide}>
                <img
                  className={classes.imageSlideFull}
                  src={city.image}
                  alt='building'
                />
                <Box className={classes.imageSlideContent}>
                  <Box
                    component='h3'
                    mb={4}
                    fontFamily={Fonts.LIGHT}
                    fontSize={{xs: 18, sm: 20, xl: 22}}>
                    {city.name}
                  </Box>

                  <Box mt='auto'>
                    <Typography component='p'>{city.desc}</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Slider>
      </Card>
    </Box>
  );
};

export default CityInfo;
