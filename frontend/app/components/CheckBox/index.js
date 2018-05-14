/**
*
* CheckBox
*
*/

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';
import Checkbox from 'material-ui/Checkbox';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';

const styles = {
  block: {
    maxWidth: 150,
  },
  checkbox: {
    marginBottom: 16,
  },
};

class CheckBox extends React.Component { // eslint-disable-line react/prefer-stateless-function
  state = {
    checked: false,
  }
  updateCheck = this.updateCheck.bind(this);

  updateCheck() {
    this.setState((oldState) => ({
      return: {
        checked: !oldState.checked,
      },
    }));
    this.props.callback(this.props.id);
  }

  render() {
    let box;
    if (this.props.visibility) {
      box = (
        <Checkbox
          checkedIcon={<Visibility />}
          uncheckedIcon={<VisibilityOff />}
          onCheck={this.updateCheck}
          label={this.props.label}
          style={styles.checkbox}
        />
      );
    } else if (this.props.heart) {
      box = (
        <Checkbox
          checkedIcon={<ActionFavorite />}
          uncheckedIcon={<ActionFavoriteBorder />}
          onCheck={this.updateCheck}
          label={this.props.label}
          style={styles.checkbox}
        />
      );
    } else {
      box = (
        <Checkbox
          label={this.props.label}
          onCheck={this.updateCheck}
          style={styles.checkbox}
        />
      );
    }

    return (
      <div id={this.props.id} style={styles.block}>
        {box}
      </div>
    );
  }
}

CheckBox.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired,
  heart: PropTypes.bool,
  visibility: PropTypes.bool,
};

export default CheckBox;
