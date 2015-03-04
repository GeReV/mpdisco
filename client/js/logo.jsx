var React = require('react/addons');

var Logo = React.createClass({
    getInitialState: function() {
        return {
            cover: null
        };
    },

    componentWillMount: function() {
        this.props.model.on('cover', function(url) {
            this.setState({
                cover: url
            });
        }.bind(this));
    },

    render: function() {
        var style = {};

        if (this.state.cover) {
            style.backgroundImage = 'url(' + this.state.cover + ')';
        }

        return (
            <hgroup id="logo" style={style}>
                <h1>mpdisco</h1>
            </hgroup>
        );
    }
});

module.exports = Logo;
