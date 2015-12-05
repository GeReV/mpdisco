
import 'babel-core/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';

import BasicMode from './components/basic_mode.jsx';
import MasterMode from './components/master_mode.jsx';

import reactor from './reactor.js';
import network from './network.js';
import actions from './actions.js';
import receiver from './receiver.js';

const MPDisco = MasterMode;


let cssContainer = document.getElementById('css');

const appContainer = document.getElementById('mpdisco');

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

  const app = (
    <MPDisco reactor={reactor}
             context={context}
             network={network} />
  );

  render(app);
}

// Run the application when both DOM is ready and page content is loaded
if (['complete', 'loaded', 'interactive'].includes(document.readyState) && document.body) {
  run();
} else {
  document.addEventListener('DOMContentLoaded', run, false);
}
