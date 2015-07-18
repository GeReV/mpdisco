var React = require('react/addons');

var ListenersMixin = require('./../mixins/listeners_mixin.js');

var Listener = require('./listener.jsx');

var Listeners = React.createClass({
    mixins: [ListenersMixin],

    render: function() {
        var me = this.cursors.me;
        var listeners = this.cursors.listeners.get().map(function(listener) {
            var isMe = (listener.userid === me.userid);

            return (
                <Listener key={listener.userid} listener={listener} you={isMe} onIdentify={this.handleIdentify} />
            );
        }, this);

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
