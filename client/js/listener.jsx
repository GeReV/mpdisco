var React = require('react/addons');

var cx = React.addons.classSet;

var trim = function(s) {
    return s.replace(/^\s+|\s+$/g, '');
};

var Listener = React.createClass({
    propTypes: {
        onIdentify: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            logging: false
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.listener.logged) {
            this.setState({
                logging: false
            });
        }
    },

    render: function() {
        var listener = this.props.listener;

        var classes = cx({
            listener: true,
            anonymous: !listener.logged,
            you: this.props.you
        });

        if (!listener.logged && this.state.logging) {
            return this.loginView(classes);
        }

        if (!listener.logged) {
            return this.anonymousView(classes);
        }

        return this.loggedInView(classes, listener);
    },

    anonymousView: function(classes) {
        var name = this.props.you ?
            <span>You <a href="#" onClick={this.showLogin}>Login?</a></span> :
            <span>Anonymous Listener</span>;

        return (
            <li className={classes}>
                {name}
            </li>
        );
    },

    loginView: function(classes) {
        return (
            <li className={classes}>
                <input type="text" ref="login" onKeyUp={this.handleLoginKeyup} placeholder="E-mail or nickname" />
                <a href="#" onClick={this.handleLogin}>Login</a>
            </li>
        );
    },

    loggedInView: function(classes, listener) {
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
    },

    showLogin: function(e) {
        this.setState({
            logging: true
        });

        e.preventDefault();
    },

    hideLogin: function(e) {
        this.setState({
            logging: false
        });

        e.preventDefault();
    },

    handleLogin: function(e) {
        var name = trim(this.refs.login.getDOMNode().value);

        if (!name) {
            this.hideLogin(e);
            return;
        }

        this.props.onIdentify(name);

        e.preventDefault();
    },

    handleLoginKeyup: function(e) {
        if (e.key === 'Enter') {
            this.handleLogin(e);
        } else if (e.key === 'Escape') {
            this.hideLogin(e);
        }
    }
});

module.exports = Listener;
