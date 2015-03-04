var React = require('react/addons');

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
            <div id="scrubber" onClick={this.scrub}>
                <div className="progress" style={style} />
            </div>
        );
    },

    scrub: function(e) {
        var percent = (e.nativeEvent.offsetX / this.getDOMNode().offsetWidth);

        if (this.props.onScrub) {
            this.props.onScrub(percent);
        }
    }
});

module.exports = Scrubber;