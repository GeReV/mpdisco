import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import stackblur from '../vendor/StackBlur';

import withStyles from '../decorators/withStyles';

import styles from '../../sass/logo.scss';

@withStyles(styles)
export default class Logo extends Component {
  constructor() {
    super();

    this.state = {
      cover: null,
      coverKey: null
    };
  }

  componentWillUpdate(nextProps) {
    if (nextProps.cover !== this.props.cover) {
      const url = nextProps.cover;

      if (!url) {
        return;
      }

      const blurCanvas = () => {
        stackblur(this.state.cover, this.refs.cover, + this.props.blurRadius);
      };

      const image = new Image();

      const onload = () => {
        this.setState({
          cover: image,
          coverKey: url
        }, blurCanvas);
      };

      image.src = url;
      image.onload = image.load = onload;
    }
  }

  render() {

    let image;
    if (this.props.cover) {
      image = (<canvas ref="cover" key={this.state.coverKey}/>);
    }

    return (
      <hgroup id="logo">
        <ReactCSSTransitionGroup component="div"
                                 className="logo-cover"
                                 transitionName="fade"
                                 transitionEnterTimeout={4000}
                                 transitionLeaveTimeout={4000}>
          {image}
        </ReactCSSTransitionGroup>
        <h1>mpdisco</h1>
      </hgroup>
    );
  }
}
