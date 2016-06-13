import React, { Component } from 'react';

import withStyles from '../decorators/withStyles';

import actions from '../actions';

import styles from '../../sass/listeners.scss';

import Listener from './listener.jsx';

@withStyles(styles)
export default class Listeners extends Component {
  componentDidMount() {
    actions.fetchListeners();
  }

  render() {
    const me = this.props.me;
    const listeners = this.props.listeners
      .map(listener => {
        const isMe = (listener.get('userid') === me.get('userid'));

        return (
          <Listener key={listener.get('userid')}
                    listener={listener}
                    you={isMe}
                    onIdentify={this.handleIdentify}
                    />
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

  handleIdentify(name) {
    actions.listenerIdentify(name);
  }
}
