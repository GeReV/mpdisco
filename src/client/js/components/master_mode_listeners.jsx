import React from 'react';

import actions from '../actions';

import withStyles from '../decorators/withStyles';

import styles from '../../sass/listeners.scss';

import Listeners from './listeners.jsx';
import MasterModeListener from './master_mode_listener.jsx';

@withStyles(styles)
export default class MasterModeListeners extends Listeners {

  constructor() {
    super();

    this.state = {
      master: null
    };
  }
  componentDidMount() {
    actions.fetchListeners();
  }

  render() {
    const {
      me,
      master
    } = this.props;

    const listeners = this.props.listeners
      .map(listener => {
        const userId = listener.get('userid')
        const isMe = (userId === me.get('userid'));
        const isMaster = (master === userId);
        const isNextMaster = false;

        return (
          <MasterModeListener
              key={userId}
              listener={listener}
              you={isMe}
              master={isMaster}
              next={isNextMaster}
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
