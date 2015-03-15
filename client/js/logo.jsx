var React = require('react/addons');

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var stackblur = require('./vendor/StackBlur');

var LOGO_EMPTY = "images/noise.png";

var Logo = React.createClass({
    getInitialState: function() {
        return {
            cover: null
        };
    },

    componentDidMount: function() {
        this.props.model.on('cover', function(url) {
            var blurCanvas = function() {
                var canvas = this.refs.cover.getDOMNode();

                stackblur(this.state.cover, canvas, +this.props.blurRadius);
            }.bind(this);

            var onload = function() {
                this.setState({
                    cover: image,
                    coverKey: url
                }, blurCanvas);
            }.bind(this);

            var image = new Image();
            image.src = url;
            image.onload = image.load = onload;
        }.bind(this));
    },

    render: function() {

        var image;
        if (this.state.cover) {
            image = (
                <canvas ref="cover" key={this.state.coverKey} />
            );
        }

        return (
            <hgroup id="logo">
                <ReactCSSTransitionGroup component="div" className="logo-cover" transitionName="fade">
                    {image}
                </ReactCSSTransitionGroup>
                <h1>mpdisco</h1>
            </hgroup>
        );
    }
});

module.exports = Logo;
