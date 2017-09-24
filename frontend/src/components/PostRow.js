import React, { Component, PropTypes } from 'react';
import { Button, Modal } from 'react-bootstrap/lib';
import axios from 'axios';
import Urls from '../util/Urls.js';

class PostRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: [],
      isDeleteDisabled: false,
      isDeleteLoading: false,
      showModal: false,
      //isEditDisabled: false,
    };
  }

  close() {
    this.setState({ showModal: false });
  }

  open() {
    this.setState({ showModal: true });
  }

  resetButtonsState() {
    this.setState({
      isDeleteLoading: false,
      isDeleteDisabled: false,
      showModal: false,
      //isEditDisabled: false,
    });
  }

  deletePost() {
    const { removePost, index, post, addError, clearErrors } = this.props;
    clearErrors();
    this.setState({
      //isEditDisabled: true,
      isDeleteLoading: true,
      isDeleteDisabled: false,
      showModal: false,
    });
    axios.delete(`${Urls.api}/posts/${post.ID}`)
      .then(() => {
        removePost(index);
        this.resetButtonsState();
      },
    )
      .catch((err) => {
        addError(err.message);
        this.resetButtonsState();
      },
    );
  }

  makeDeleteButton() {
    const { isDeleteLoading, isDeleteDisabled } = this.state;
    if (isDeleteLoading) {
      return <Button bsStyle="danger" disabled>Deleting...</Button>;
    } else if (isDeleteDisabled) {
      return <Button bsStyle="danger" disabled>Delete</Button>;
    }

    return <Button bsStyle="danger" onClick={this.open.bind(this)}>Delete</Button>;
  }

  makeEditButton() {
    const { isEditDisabled } = this.state;
    const buttonStyle = { marginRight: '10px' };
    // edit not fully implemented yet
    return <Button style={buttonStyle} disabled>{isEditDisabled ? 'Editing...' : 'Edit'}</Button>;
  }

  render() {
    const { post } = this.props;
    const { showModal, isDeleteLoading } = this.state;
    return (
      <tr>
        <td>{post.Members}</td>
        <td>{post.Entry}</td>
        <td>{post.Datetime}</td>
        <td>
          {/*this.makeEditButton()*/}
          {this.makeDeleteButton()}
        </td>
        <Modal show={showModal} onHide={this.close.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Delete Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h2>Are you sure?</h2>
            <h4>This is not reversible!</h4>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close.bind(this)}>No</Button>
            <Button
              onClick={this.deletePost.bind(this)}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? 'Deleting...' : 'Yes'}
            </Button>
          </Modal.Footer>
        </Modal>
      </tr>
    );
  }
}

PostRow.propTypes = {
  post: PropTypes.shape({
    Members: PropTypes.string.isRequired,
    Entry: PropTypes.string.isRequired,
    Datetime: PropTypes.string.isRequired,
    ID: PropTypes.number.isRequired,
  }),
  removePost: PropTypes.func.isRequired,
  addError: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default PostRow;
