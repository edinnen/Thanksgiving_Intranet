import React from 'react';
import {Card, makeStyles} from '@material-ui/core';
import {Form, Formik, useField} from 'formik';
import InputBase from '@material-ui/core/InputBase';
import * as yup from 'yup';
import Button from '@material-ui/core/Button';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {useDispatch} from 'react-redux';
import {showMessage} from '../../../../redux/actions';
import IntlMessages from '../../../../@crema/utility/IntlMessages';
import {useIntl} from 'react-intl';
import Box from '@material-ui/core/Box';
import {red} from '@material-ui/core/colors';
import {Fonts} from '../../../../shared/constants/AppEnums';
import {CremaTheme} from '../../../../types/AppContextPropsType';

const MyTextField = (props: any) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : '';
  return <InputBase {...props} {...field} error={!!errorText} />;
};

const validationSchema = yup.object({
  email: yup.string().email('Invalid Format').required('Email required'),
});

interface SubscribeProps {}

const Subscribe: React.FC<SubscribeProps> = () => {
  const dispatch = useDispatch();

  const {messages} = useIntl();

  const useStyles = makeStyles((theme: CremaTheme) => ({
    crInput: {
      width: '100%',
      height: '100%',
      '& input[type="text"]': {
        borderRadius: theme.overrides.MuiCard.root.borderRadius,
        backgroundColor: 'white',
        color: 'black',
        padding: '12px 16px',
        [theme.breakpoints.up('xl')]: {
          padding: '20px',
        },
      },

      '& .MuiFormHelperText-root.Mui-error': {
        color: 'white',
      },
    },
    crBtn: {
      width: '100%',
    },
  }));

  const classes = useStyles();

  return (
    <Box
      py={{xs: 5, sm: 5, xl: 5}}
      px={{xs: 6, sm: 6, xl: 6}}
      height='1'
      style={{backgroundColor: red[600], color: 'white'}}
      clone>
      <Card>
        <Box
          component='h3'
          mb={4}
          fontFamily={Fonts.LIGHT}
          fontSize={{xs: 18, sm: 20, xl: 22}}>
          <IntlMessages id='dashboard.subscribe' />
        </Box>
        <Box component='p' mb={6} pr={4} fontSize={{xs: 16, xl: 18}}>
          <IntlMessages id='dashboard.subscribeContent' />
        </Box>
        <Formik
          validateOnChange={true}
          initialValues={{
            email: '',
          }}
          validationSchema={validationSchema}
          onSubmit={(data, {setSubmitting, resetForm}) => {
            setSubmitting(true);
            dispatch(showMessage('Thank you for subscription'));
            setSubmitting(false);
            resetForm();
          }}>
          {({isSubmitting}) => (
            <Box textAlign='left' mt={8} clone>
              <Form>
                <Box display='flex'>
                  <Box width='75%'>
                    <MyTextField
                      placeholder={messages['common.email']}
                      name='email'
                      label={<IntlMessages id='common.emailAddress' />}
                      inputProps={{
                        'aria-label': 'naked',
                      }}
                      className={classes.crInput}
                    />
                  </Box>
                  <Box
                    ml={5}
                    width={80}
                    height={{xl: 64}}
                    color='primary.contrastText'>
                    <Button
                      variant='contained'
                      color='primary'
                      disabled={isSubmitting}
                      className={classes.crBtn}
                      type='submit'>
                      <Box fontSize={{xs: 30, xl: 48}} clone>
                        <ChevronRightIcon />
                      </Box>
                    </Button>
                  </Box>
                </Box>
              </Form>
            </Box>
          )}
        </Formik>
      </Card>
    </Box>
  );
};

export default Subscribe;
