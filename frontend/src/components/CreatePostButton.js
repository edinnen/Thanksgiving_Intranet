import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import { Button, Modal, FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap/lib';
import Urls from '../util/Urls.js';
import postgresArray from 'postgres-array';
import AlertContainer from 'react-alert';

class CreatePostButton extends Component {
  constructor(props) {
    super(props);
    var d = new Date();
    this.state = {
      showModal: false,
      members: '',
      entry: '',
      files: '',
      datetime: d.toLocaleDateString(),
      isLoading: false,
      errors: []
    };
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

  getBase64(file) {
    return new Promise(function(resolve) {
      var reader = new FileReader();
      reader.onloadend = function() {
        resolve(reader.result)
      }
      reader.readAsDataURL(file);
    })
  }

  async addImage(event) {
    console.log("Adding images...");
    this.uploadWait();
    var len = event.target.files.length;
    var files = event.target.files

    var parsedFiles = postgresArray.parse(this.state.files);
    var updatedFiles = "{'";

    for(var i=0; i<parsedFiles.length; i++) {
      updatedFiles += parsedFiles[i] + ",";
    }

    for(i=0; i<len; i++) {
      var b64 = '';
      // eslint does't like functions in loops, but I have no idea how to do this any other way
      // eslint-disable-next-line
      await this.getBase64(files[i]).then(function(result) {
        b64 = result;
      });
      if (i < len - 1 && len > 1) {
        updatedFiles += b64 + "','";
      } else {
        updatedFiles += b64 + "'}";
      }
    }



    this.setState({ files: updatedFiles });
    this.uploadSuccess()
    console.log("Added!")
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
    const { members, entry, files, datetime } = this.state;
    this.setState({ isLoading: true, errors: [] });
    const errors = this.checkInput();
    var d = new Date();
    if (errors.length === 0) {
      axios.post(`${Urls.api}/posts`, {
        Members: members,
        Entry: entry,
        Files: files,
        Datetime: datetime,
      })
        .then((res) => {
          this.props.addPost(res.data);
          console.log("Images: " + files)
          this.setState({ isLoading: false, members: '', entry: '', files: [], datetime: d.toLocaleDateString(), showModal: false, errors: [] });
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

  alertOptions = {
    offset: 14,
    position: 'bottom left',
    theme: 'dark',
    time: 5000,
    transition: 'scale'
  }

  uploadWait = () => {
    this.msg.show('Please wait for the upload to complete. You will be notified!', {
      time:2000,
      type: 'info'
    });
  }

  uploadSuccess = () => {
    this.msg.removeAll();
    this.msg.show('Images uploaded!', {
      time: 2000,
      type: 'success'
    });
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
              <FormGroup>
                <ControlLabel>Files</ControlLabel>
                <FormControl
                  type="file"
                  values={this.state.files}
                  multiple
                  onChange={this.addImage.bind(this)}
                />
              </FormGroup>
            </form>
            <AlertContainer ref={a => this.msg = a} {...this.alertOptions} />
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.createPost.bind(this)}
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Submit'}
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
