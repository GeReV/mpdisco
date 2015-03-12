var React = require('react/addons');

var cx = React.addons.classSet;

var trim = function(s) {
    return s.replace(/^\s+|\s+$/g, '');
};

var AnonymousListener = React.createClass({
    propTypes: {
        onIdentify: React.PropTypes.func.isRequired,
        you: React.PropTypes.bool,
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
            'listener-anonymous': !listener.logged,
            'listener-you': this.props.you
        });

        if (this.state.logging) {
            return this.loginView(classes);
        }

        return this.anonymousView(classes);
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

module.exports = AnonymousListener;
