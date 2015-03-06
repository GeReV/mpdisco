var React = require('react/addons');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Logo = React.createClass({
    getInitialState: function() {
        return {
            cover: "images/noise.png"
        };
    },

    componentDidMount: function() {
        this.props.model.on('cover', function(url) {
            this.setState({
                cover: url
            });
        }.bind(this));
    },

    render: function() {
        return (
            <hgroup id="logo">
                <ReactCSSTransitionGroup component="div" className="logo-cover" transitionName="fade">
                    <img src={this.state.cover} alt="Cover" key={this.state.cover} />
                </ReactCSSTransitionGroup>
                <h1>mpdisco</h1>
            </hgroup>
        );
    }
});

module.exports = Logo;
