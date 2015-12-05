import React, { Component } from 'react'; // eslint-disable-line no-unused-vars

function withEnabled(ComposedComponent) {
  return class WithEnabled extends Component {

    static propTypes = {
      enabled: React.PropTypes.bool
    };

    static defaultProps = {
      enabled: true
    };

    render() {
      return <ComposedComponent {...this.props} />;
    }
  };
}

export default withEnabled;
