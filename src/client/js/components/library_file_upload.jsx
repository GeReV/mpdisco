import React from 'react';

import cx from 'classnames';

import FileUploadMixin from '../mixins/file_upload_mixin';

import ProgressBar from './progress_bar.jsx';

export default React.createClass({
    mixins: [FileUploadMixin],

    getInitialState: function() {
        return {
            percentage: 0
        };
    },

    componentDidMount: function() {
        this.uploadFile(this.props.file, '/upload');
    },

    render: function() {
        var classes = cx({
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
