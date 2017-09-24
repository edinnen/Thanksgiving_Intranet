import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import { Button, Modal, FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap/lib';
import Urls from '../util/Urls.js';

class CreatePostButton extends Component {
  constructor(props) {
    super(props);
    var d = new Date();
    this.state = { showModal: false, members: '', entry: '', datetime: d.toLocaleDateString(), isLoading: false, errors: [] };
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  handleChange(key, e) {
    const newState = {};
    newState[key] = e.target.value;
    this.setState(newState);
  }

  checkInput() {
    const errors = [];
    if (this.state.members.length === 0) {
      errors.push('Members field cannot be blank.');
    }

    if (this.state.entry.length === 0) {
      errors.push('Entry cannot be blank.');
    }

    return errors;
  }

  createPost() {
    const { members, entry, datetime } = this.state;
    this.setState({ isLoading: true, errors: [] });
    const errors = this.checkInput();
    var d = new Date();
    if (errors.length === 0) {
      axios.post(`${Urls.api}/posts`, {
        Members: members,
        Entry: entry,
        Datetime: datetime,
      })
        .then((res) => {
          this.props.addPost(res.data);
          this.setState({ isLoading: false, members: '', entry: '', datetime: d.toLocaleDateString(), showModal: false, errors: [] });
        },
      )
        .catch((err) => {
          this.setState({ isLoading: false, errors: [err.message] });
        },
      );
    } else {
      this.setState({ isLoading: false, errors });
    }
  }

  makeModalErrors() {
    const { errors } = this.state;
    if (errors.length > 0) {
      return (
        <Alert bsStyle="warning">
          {this.state.errors.join('\n')}
        </Alert>
      );
    }

    return <div />;
  }

  render() {
    const { showModal, isLoading } = this.state;
    return (
      <div>
        <Button bsStyle="primary" onClick={this.open.bind(this)}>Add Log Entry</Button>
        <Modal show={showModal} onHide={this.close.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Create Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.makeModalErrors()}
            <form>
              <FormGroup>
                <ControlLabel>Members</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.members}
                  placeholder="Enter members name to display"
                  onChange={this.handleChange.bind(this, 'members')}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Entry</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.entry}
                  placeholder="Enter entry to display"
                  onChange={this.handleChange.bind(this, 'entry')}
                />
              </FormGroup>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.createPost.bind(this)}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

CreatePostButton.propTypes = {
  addPost: PropTypes.func.isRequired,
};

export default CreatePostButton;
