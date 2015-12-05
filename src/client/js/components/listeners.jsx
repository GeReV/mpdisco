import React from 'react';

import withStyles from '../decorators/withStyles';

import styles from '../../sass/listeners.scss';

import ListenersMixin from '../mixins/listeners_mixin.js';

import Listener from './listener.jsx';

// @withStyles(styles)
export default React.createClass({
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
