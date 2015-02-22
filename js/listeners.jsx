var React = require('./vendor/react/react-with-addons.js');

var Listener = require('./listener.jsx');

var Listeners = React.createClass({
    getInitialState: function() {
        return {
            listeners: this.props.model.listeners || []
        }
    },

    componentWillMount: function() {
        var updateList = function(listeners) {
            this.setState({
                listeners: listeners
            });
        }.bind(this);

        this.props.model.on('clientslist', updateList);

        this.props.model.fetchListeners();
    },

    render: function() {
        var listeners = this.state.listeners.map(function(listener) {
            return (
                <Listener key={listener.userid} listener={listener} />
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
