import React, { Component } from 'react'
import * as Bulma from 'reactbulma'

import Scanner from './Scanner'
import Tracker from './Tracker'
import Raffle from './Raffle'
import Config from './Config'

function PanelLink (props) {
  let attr = {}

  if (props.id) attr.id = props.id
  if (props.className) attr.className = props.className

  if (props.external) {
    attr.target = '_blank'
    attr.rel = 'noopener noreferrer'
  }

  return (
    <Bulma.Panel.Block as='a' href={props.link} title={props.title || props.label} {...attr}>
      <Bulma.Panel.Icon>
        <i className={`fa fa-${props.icon}`} />
      </Bulma.Panel.Icon>
      {props.label}
    </Bulma.Panel.Block>
  )
}

function GetView (props) {
  const location = props.app.location.pathname.toLowerCase()

  if (location.indexOf('/app') === 0) {
    return (<Scanner app={props.app} />)
  } else if (location.indexOf('/tracker') === 0) {
    return (<Tracker app={props.app} />)
  } else if (location.indexOf('/raffle') === 0) {
    return (<Raffle app={props.app} />)
  } else if (location.indexOf('/config') === 0) {
    return (<Config app={props.app} />)
  }

  return (null)
}

class App extends Component {
  constructor (props) {
    super(props)

    this.state = {
      activeTab: props.location.pathname === '/app' ? 'scanner' : props.location.pathname.substr(1, props.location.pathname.length - 1)
    }

    this.location = props.location
  }

  render () {
    return (
      <div className='columns'>
        <div className='column is-one-fifth'>
          <div id='sticky-sidebar'>
            <Bulma.Panel id='app-sidebar'>
              <Bulma.Panel.Heading>Navigation</Bulma.Panel.Heading>
              <PanelLink link='/app' icon='qrcode' title='Scanner' label='Scanner' className={this.state.activeTab === 'scanner' ? 'is-active' : ''} />
              <PanelLink link='/tracker' icon='tachometer' title='Tracker' label='Tracker (WIP)' className={this.state.activeTab === 'tracker' ? 'is-active' : ''} />
              <PanelLink link='/raffle' icon='random' title='Raffle' label='Raffle (WIP)' className={this.state.activeTab === 'raffle' ? 'is-active' : ''} />
              <PanelLink link='/config' icon='cog' title='Passport Config' label='Passport Config' className={this.state.activeTab === 'config' ? 'is-active' : ''} />
            </Bulma.Panel>
            <Bulma.Content id='messages' />
          </div>
        </div>
        <div id='app-content' className='column is-four-fifths'>
          <div id='view' className='box'>
            <GetView app={this} />
          </div>
        </div>
      </div>
    )
  }
}

export default App
