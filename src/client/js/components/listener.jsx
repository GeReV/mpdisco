import React, { Component } from 'react';

import cx from 'classnames';

import AnonymousListener from './anonymous_listener.jsx';

export default class Listener extends Component {
    static propTypes = {
        onIdentify: React.PropTypes.func.isRequired,
        listener: React.PropTypes.object.isRequired,
        you: React.PropTypes.bool
    }

    render() {
      const listener = this.props.listener;

      if (!listener.logged) {
        return (
          <AnonymousListener {...this.props} />
        );
      }

      const classes = cx('listener', {
        'listener-you': this.props.you
      });

      const thumbnailUrl = `${listener.get('thumbnailUrl') || 'http://www.gravatar.com/avatar/00000000000000000000000000000000'}?s=48`;
      const displayName = listener.get('displayName') || 'Listener';
      const name = listener.has('name') ?
              `${listener.getIn(['name', 'givenName'])} ${listener.getIn(['name', 'familyName'])}` :
              displayName;

      return (
        <li className={classes}>
          <img src={thumbnailUrl} alt={displayName} />
          <span>{name}</span>
        </li>
      );
    }
}
