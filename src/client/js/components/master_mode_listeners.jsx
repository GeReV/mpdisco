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
    // this.props.mastermode.on('master', this.setMaster);
  }

  render() {
    const me = this.props.me;
    const listeners = this.props.listeners
      .map(listener => {
        const userId = listener.get('userid')
        const isMe = (userId === me.get('userid'));
        const isMaster = (this.state.master === userId);
        const isNextMaster = false;

        return (
          <MasterModeListener
              key={userId}
              listener={listener}
              you={isMe}
              master={isMaster}
              next={isNextMaster}
              onIdentify={this.handleIdentify.bind(this)}
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

  setMaster(master) {
    this.setState({
      master: master
    });
  }

  handleIdentify(name) {
    actions.listenerIdentify(name);
  }
}
