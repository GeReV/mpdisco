var React = require('./vendor/react/react-with-addons.js');

var Scrubber = React.createClass({
    render: function() {
        var progress = 0;

        if (this.props.progress && this.props.total) {
            progress = +this.props.progress / +this.props.total * 100;

            if (progress > 100) {
                progress = 100;
            }
        }

        var style = {
            width: progress + '%'
        };

        return (
            <div id="scrubber">
                <div className="progress" style={style} />
            </div>
        );
    }
});

module.exports = Scrubber;