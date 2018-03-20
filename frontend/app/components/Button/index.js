/**
*
* Button
*
*/

import React, { Children } from 'react';
import PropTypes from 'prop-types';

// import styled from 'styled-components';
import RaisedButton from 'material-ui/RaisedButton';

function Button(props) {
  const transition = 'all 0.45s cubic-bezier(0.23, 1, 0.23, 1) 0ms !important';

  const style = {
    root: {
      borderRadius: 4,
      margin: 2.5,
    },
    button: {
      height: '55px',
      borderRadius: 4,
    },
    overlay: {
      height: '55px',
      paddingTop: '10px',
      fontWeight: 700,
    },
  };

  const primary = `
    #${props.id}:hover {
      background-color: #005EB8 !important;
      color: white !important;
      border: 1px solid transparent !important;
      transition: ${transition};
    }
    #${props.id} {
      background-color: transparent !important;
      color: #005EB8 !important;
      border: 1px solid #005EB8 !important;
      transition: ${transition};
    }
  `;


  const inverted = `
    #${props.id}:hover {
      background-color: transparent !important;
      color: #005EB8 !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      transition: ${transition};
    }
    #${props.id} {
      background-color: #005EB8 !important;
      color: white !important;
      border: 1px solid #005EB8 !important;
      transition: ${transition};
    }
  `;

  let theme;
  if (props.inverted) {
    theme = inverted;
  } else {
    theme = primary;
  }

  return (
    <div style={{ display: 'inline-block' }}>
      <style>
        {theme}
      </style>
      <RaisedButton id={props.id} style={style.root} buttonStyle={style.button} overlayStyle={style.overlay}>
        {Children.toArray(props.children)}
      </RaisedButton>
      {/* <RaisedButton style={style.root} buttonStyle={style.button} overlayStyle={style.overlay} rippleStyle={{height: '55px'}}>
        {Children.toArray(props.children)}
      </RaisedButton> */}
    </div>
  );
}

Button.propTypes = {
  inverted: PropTypes.bool,
  id: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button;
