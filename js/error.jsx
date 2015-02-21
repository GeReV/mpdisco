var React = require('./vendor/react/react-with-addons.js');

var Error = React.createClass({
    render: function() {
        return
            <div id="error">
                {this.props.message}
            </div>;
    }
});

module.exports = Error;