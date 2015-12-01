import React, { Component } from 'react';
import cx from 'classnames';

import EnabledMixin from './../mixins/enabled_mixin.js';

export default React.createClass({
    mixins: [EnabledMixin],

    propTypes: {
        onShuffle: React.PropTypes.func.isRequired,
        onRepeat: React.PropTypes.func.isRequired,
        onRemove: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            status: {
                random: 0,
                repeat: 0,
                single: 0
            }
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.status) {
            this.setState({
                status: nextProps.status
            });
        }
    },

    render: function() {
        var shuffleClasses = cx({
            shuffle: true,
            active: +this.state.status.random,
            disabled: !this.enabled()
        });

        var repeatClasses = cx({
            repeat: true,
            active: +this.state.status.repeat,
            single: +this.state.status.single,
            disabled: !this.enabled()
        });

        var removeClasses = cx({
            remove: true,
            disabled: !this.enabled() // || (this.state.selectedItems.length <= 0)
        });

        return (
            <div className="playlist-controls">
                <a className={shuffleClasses} href="#" onClick={this.toggleShuffle}><i className="icon-random"></i></a>
                <a className={repeatClasses} href="#" onClick={this.toggleRepeat}><i className="icon-refresh"></i></a>
                <span className="separator"></span>
                <a className={removeClasses} href="#" onClick={this.remove}><i className="icon-trash"></i></a>
            </div>
        );
    },

    toggleShuffle: function(e) {
        if (!this.enabled()) {
            return;
        }

        var random = (~this.state.status.random & 1);

        this.props.onShuffle(random);

        e.preventDefault();
    },

    toggleRepeat: function(e) {
        if (!this.enabled()) {
            return;
        }

        var repeat = +this.state.status.repeat,
            single = +this.state.status.single;

        // Note single cannot be on without repeat.

        this.props.onRepeat(repeat, single);

        e.preventDefault();
    },

    remove: function(e) {
        if (!this.enabled()) {
            return;
        }

        this.props.onRemove();

        e.preventDefault();
    }
});
