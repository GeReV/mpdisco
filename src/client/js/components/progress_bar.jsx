import React, {Component, PropTypes} from 'react';

export default class ProgressBar extends Component {
  static propTypes = {
    percentage: PropTypes.number.isRequired
  };

  render () {
    const style = {
      width: (this.props.percentage * 100) + '%'
    };

    return (
      <span className={this.props.className || 'progress-bar'}>
        <span className="progress" style={style}/>
      </span>
    );
  }
}
