import React, { Component } from 'react';

import cx from 'classnames';

import AnonymousListener from './anonymous_listener.jsx';

export default class MasterModeListener extends Component {
  static propTypes = {
    onIdentify: React.PropTypes.func.isRequired,
    listener: React.PropTypes.object.isRequired,
    you: React.PropTypes.bool,
    next: React.PropTypes.bool,
    master: React.PropTypes.bool
  };

  render() {
    const listener = this.props.listener;

    if (!listener.get('logged')) {
      return (<AnonymousListener {...this.props}/>);
    }

    const classes = cx('listener', {
      'listener-you': this.props.you,
      'listener-master': this.props.master,
      'listener-up-next': this.props.next
    });

    const thumbnailUrl = `${listener.get('thumbnailUrl') || 'http://www.gravatar.com/avatar/00000000000000000000000000000000'}?s=48`;
    const displayName = listener.get('displayName') || 'Listener';
    const name = listener.get('name') ?
      `${listener.getIn(['name', 'givenName'])} ${listener.getIn(['name', 'familyName'])}`
      : displayName;

    return (
      <li className={classes}>
        <img src={thumbnailUrl} alt={displayName}/>
        <span>{name}</span>
      </li>
    );
  }
}
