import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {useDispatch} from 'react-redux';
import {Form, Formik, useField} from 'formik';
import * as yup from 'yup';
import {showMessage} from '../../../redux/actions';
import InfoView from '../../../@crema/core/InfoView';
import IntlMessages from '../../../@crema/utility/IntlMessages';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import {grey} from '@material-ui/core/colors';
import {makeStyles} from '@material-ui/core';
import {Fonts} from '../../../shared/constants/AppEnums';

interface ComingSoonProps {}

const MyTextField = (props: any) => {
  const [field, meta] = useField(props);
  const errorText = meta.error && meta.touched ? meta.error : '';
  return (
    <TextField
      {...props}
      {...field}
      helperText={errorText}
      error={!!errorText}
    />
  );
};

const validationSchema = yup.object({
  email: yup
    .string()
    .email('The Email you entered is not a valid format!')
    .required('Please enter Email Address!'),
});

const ComingSoon: React.FC<ComingSoonProps> = () => {
  const dispatch = useDispatch();

  const useStyles = makeStyles(() => {
    return {
      form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 12,
      },
      textField: {
        width: '100%',
        marginBottom: 20,
      },
      button: {
        fontFamily: Fonts.LIGHT,
        fontSize: 20,
        textTransform: 'capitalize',
        padding: '8px 32px',
      },
    };
  });

  const classes = useStyles();

  return (
    <>
      <Box
        py={{xl: 8}}
        flex={1}
        display='flex'
        flexDirection='column'
        justifyContent='center'
        alignItems='center'
        textAlign='center'>
        <Box>
          <Box
            component='h3'
            mb={{xs: 4, xl: 10}}
            fontSize={{xs: 24, md: 28}}
            fontFamily={Fonts.LIGHT}>
            <IntlMessages id='error.comingSoon' />!
          </Box>
          <Box
            mb={{xs: 5, xl: 12}}
            color={grey[600]}
            fontFamily={Fonts.MEDIUM}
            fontSize={20}>
            <Typography>
              <IntlMessages id='error.comingSoonMessage1' />
            </Typography>
            <Typography>
              <IntlMessages id='error.comingSoonMessage2' />
            </Typography>
          </Box>
          <Box mx='auto' mb={5} maxWidth={384}>
            <Formik
              validateOnChange={true}
              initialValues={{
                email: '',
              }}
              validationSchema={validationSchema}
              onSubmit={(data, {resetForm}) => {
                dispatch(showMessage('Thank you for submitting the email!'));
                resetForm();
              }}>
              {() => (
                <Form className={classes.form}>
                  <MyTextField
                    placeholder='Email'
                    name='email'
                    label={<IntlMessages id='common.emailAddress' />}
                    className={classes.textField}
                    variant='outlined'
                  />

                  <Button
                    variant='contained'
                    color='primary'
                    type='submit'
                    className={classes.button}>
                    <IntlMessages id='error.notifyMe' />
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
          <Box mb={5} maxWidth={{xs: 300, sm: 400, xl: 672}} width='100%'>
            <img
              src={require('assets/images/errorPageImages/comingsoon.png')}
              alt='404'
            />
          </Box>
        </Box>
        <InfoView />
      </Box>
    </>
  );
};

export default ComingSoon;
