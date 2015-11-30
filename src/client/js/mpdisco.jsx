
import 'babel-core/polyfill';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';

import Network from './network.js';

import BasicMode from './components/basic_mode.jsx';
import MasterMode from './components/master_mode.jsx';

import MPDiscoModel from './mpdisco_model.js';
import MPDiscoController from './mpdisco_controller.js';

const network = new Network(window.location.hostname, 3000);

MPDiscoModel.init(network);

const controller = new MPDiscoController(network);

const MPDisco = MasterMode;


let cssContainer = document.getElementById('css');

const appContainer = document.getElementById('app');

const context = {
  onSetTitle: value => document.title = value,
  onSetMeta: (name, content) => {
    // Remove and create a new <meta /> tag in order to make it work
    // with bookmarks in Safari
    const elements = document.getElementsByTagName('meta');
    [].slice.call(elements).forEach((element) => {
      if (element.getAttribute('name') === name) {
        element.parentNode.removeChild(element);
      }
    });
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document.getElementsByTagName('head')[0].appendChild(meta);
  }
};

function render(component) {
  ReactDOM.render(component, appContainer, () => {
    // Remove the pre-rendered CSS because it's no longer used
    // after the React app is launched
    if (cssContainer) {
      cssContainer.parentNode.removeChild(cssContainer);
      cssContainer = null;
    }
  });
}

function run() {
  // Make taps on links and buttons work fast on mobiles
  FastClick.attach(document.body);

  render(<MPDisco controller={controller} network={network} />)
}

// Run the application when both DOM is ready and page content is loaded
if (['complete', 'loaded', 'interactive'].includes(document.readyState) && document.body) {
  run();
} else {
  document.addEventListener('DOMContentLoaded', run, false);
}
