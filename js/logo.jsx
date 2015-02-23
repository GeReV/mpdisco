var React = require('./vendor/react/react-with-addons.js');

var Logo = React.createClass({
    render: function() {
        return (
            <hgroup id="logo">
                <h1>mpdisco</h1>
            </hgroup>
        );
    }
});

module.exports = Logo;
