var React = require('./vendor/react/react-with-addons.js');

var Listener = React.createClass({
    render: function() {
        var listener = this.props.listener;

        if (!listener.logged) {
            return (
                <li className="listener anonymous">
                    <span>Anonymous Listener</span>
                </li>
            );
        }

        var thumbnailUrl = (this.props.listener.thumbnailUrl || 'http://www.gravatar.com/avatar/00000000000000000000000000000000') + '?s=48';
        var displayName = this.props.listener.displayName || 'Listener';
        var name =
            this.props.listener.name ?
            (this.props.listener.name.givenName + ' ' + this.props.listener.name.familyName) :
            displayName;

        return (
            <li className="listener">
                <img src={thumbnailUrl} alt={displayName} />
                <span>{name}</span>
            </li>
        );
    }
});

module.exports = Listener;
