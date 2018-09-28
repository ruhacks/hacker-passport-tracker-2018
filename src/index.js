import React from 'react'
import ReactDom from 'react-dom'
import { Router, Route, browserHistory } from 'react-router'

import App from './components/App'

let routes = ['/app', '/tracker', '/raffle', '/config']
if (routes.indexOf(window.location.pathname) < 0) {
  browserHistory.push('/app')
}

ReactDom.render(
  <Router path='/' history={browserHistory}>
    <Route path='/app' component={App} />
    <Route path='/tracker' component={App} />
    <Route path='/raffle' component={App} />
    <Route path='/config' component={App} />
  </Router>,
  document.getElementById('root')
)
