import React from 'react';
import {Redirect, Route} from 'react-router-dom';
import Box from '@material-ui/core/Box';
import PropTypes from 'prop-types';

const ProtectedRoute = ({
  component: Component,
  isAuthenticated,
  isVerifying,
  ...rest
}: any) => (
  <Route
    {...rest}
    render={(props) =>
      isVerifying ? (
        <Box />
      ) : isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: {from: props.location},
          }}
        />
      )
    }
  />
);
export default ProtectedRoute;

ProtectedRoute.prototype = {
  component: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isVerifying: PropTypes.bool.isRequired,
};
