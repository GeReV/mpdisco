import React from 'react';

import cx from 'classnames';

import FileUploadMixin from '../mixins/file_upload_mixin';

import ProgressBar from './progress_bar.jsx';

export default React.createClass({
  mixins: [FileUploadMixin],

  getInitialState() {
    return {
      percentage: 0
    };
  },

  componentDidMount() {
    this.uploadFile(this.props.file, '/upload');
  },

  render() {
    const classes = cx({
      done: this.state.done,
      failed: this.state.failed
    });

    return (
      <li className={classes}>
        <span className="filename">{this.props.file.name}</span>
        <ProgressBar percentage={this.state.percentage} />
      </li>
    );
  }
});
