var React = require('react/addons');

var cx = React.addons.classSet;

var FileUploadMixin = require('./../mixins/file_upload_mixin');

var ProgressBar = require('./progress_bar.jsx');

var LibraryFileUpload = React.createClass({
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

module.exports = LibraryFileUpload;