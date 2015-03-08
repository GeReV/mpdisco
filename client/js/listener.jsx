var React = require('react/addons');

var cx = React.addons.classSet;

var Listener = React.createClass({
    render: function() {
        var listener = this.props.listener;

        var classes = cx({
            listener: true,
            anonymous: !listener.logged,
            you: this.props.you
        });

        if (!listener.logged) {
            var name = this.props.you ?
                <span>You <a href="#">Login?</a></span> :
                <span>Anonymous Listener</span>;

            return (
                <li className={classes}>
                    {name}
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
            <li className={classes}>
                <img src={thumbnailUrl} alt={displayName} />
                <span>{name}</span>
            </li>
        );
    }
});

module.exports = Listener;
