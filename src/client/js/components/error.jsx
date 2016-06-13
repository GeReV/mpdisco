import React, { Component, PropTypes } from 'react';

export default class Error extends Component {
  static propTypes = {
    message: PropTypes.any
  };

  render() {
    return (
      <div id="error">
        {this.props.message}
      </div>
    );
  }
}
