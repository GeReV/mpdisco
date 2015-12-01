/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React from 'react';
import Router from 'react-routing/src/Router';
//import NotFoundPage from './components/NotFoundPage';
//import ErrorPage from './components/ErrorPage';

const router = new Router(on => {
  on('*', async (state, next) => {
    return null;
  });

  //on('error', (state, error) => state.statusCode === 404 ?
  //    <App context={state.context} error={error}><NotFoundPage /></App> :
  //    <App context={state.context} error={error}><ErrorPage /></App>
  //);
});

export default router;
