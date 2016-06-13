import React, {Component} from 'react';

import cx from 'classnames';

function trim(s) {
  return s.replace(/^\s+|\s+$/g, '');
}

export default class AnonymousListener extends Component {
  static propTypes = {
    onIdentify: React.PropTypes.func.isRequired,
    you: React.PropTypes.bool
  };

  state = {
    logging: false
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.listener.get('logged')) {
      this.setState({logging: false});
    }
  }

  render() {
    const listener = this.props.listener;

    const classes = cx('listener', {
      'listener-anonymous': !listener.logged,
      'listener-you': this.props.you
    });

    if (this.state.logging) {
      return this.loginView(classes);
    }

    return this.anonymousView(classes);
  }

  anonymousView = classes => {
    const name = this.props.you ?
    (
      <span>
        <span>You</span>
        <a href="#" className="listener-login" onClick={this.showLogin}>Login?</a>
      </span>
    ) :
    (<span>Anonymous Listener</span>);

    return (
      <li className={classes}>
        {name}
      </li>
    );
  };

  loginView = classes => {
    return (
      <li className={classes}>
        <input type="text" ref="login" onKeyUp={this.handleLoginKeyup} placeholder="E-mail or nickname"/>
        <a href="#" onClick={this.handleLogin}>Login</a>
      </li>
    );
  }

  showLogin = e => {
    this.setState({logging: true});

    e.preventDefault();
  };

  hideLogin = e => {
    this.setState({logging: false});

    e.preventDefault();
  }

  handleLogin = e => {
    const name = trim(this.refs.login.value);

    if (!name) {
      this.hideLogin(e);
      return;
    }

    this.props.onIdentify(name);

    e.preventDefault();
  };

  handleLoginKeyup = e => {
    if (e.key === 'Enter') {
      this.handleLogin(e);
    } else if (e.key === 'Escape') {
      this.hideLogin(e);
    }
  };
}
