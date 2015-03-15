var React = require('react/addons');

var Error = React.createClass({
    render: function() {
        return
            <div id="error">
                {this.props.message}
            </div>;
    }
});

module.exports = Error;