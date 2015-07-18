var React = require('react/addons');

var cx = React.addons.classSet;

var AnonymousListener = require('./anonymous_listener.jsx');

var Listener = React.createClass({
    propTypes: {
        onIdentify: React.PropTypes.func.isRequired,
        listener: React.PropTypes.object.isRequired,
        you: React.PropTypes.bool
    },

    render: function() {
        var listener = this.props.listener;

        if (!listener.logged) {
            return (
                <AnonymousListener {...this.props} />
            );
        }

        var classes = cx({
            'listener': true,
            'listener-you': this.props.you
        });

        var thumbnailUrl = (listener.thumbnailUrl || 'http://www.gravatar.com/avatar/00000000000000000000000000000000') + '?s=48';
        var displayName = listener.displayName || 'Listener';
        var name =
            listener.name ?
                (listener.name.givenName + ' ' + listener.name.familyName) :
                displayName;

        return (
            <li className={classes}>
                <img src={thumbnailUrl} alt={displayName} />
                <span>{name}</span>
            </li>
        );
    }
});

module.exports = Listener;
