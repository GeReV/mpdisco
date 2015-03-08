var React = require('react/addons');

var Listener = require('./listener.jsx');

var Listeners = React.createClass({
    getInitialState: function() {
        return {
            listeners: this.props.model.listeners || []
        }
    },

    componentDidMount: function() {
        var updateList = function(listeners, me) {
            this.setState({
                listeners: listeners,
                me: me
            });
        }.bind(this);

        this.props.model.on('clientslist', updateList);

        this.props.model.fetchListeners();
    },

    render: function() {
        var me = this.state.me;
        var listeners = this.state.listeners.map(function(listener) {
            var isMe = (listener.userid === me.userid);

            return (
                <Listener key={listener.userid} listener={listener} you={isMe} />
            );
        });

        return (
            <section id="listeners">
                <header>Listeners</header>
                <ul className="content">
                    {listeners}
                </ul>
            </section>
        );
    }
});

module.exports = Listeners;
