import React, { Component } from 'react'
import ReactDom from 'react-dom'
import axios from 'axios'
import * as Bulma from 'reactbulma'
import ReactJsonEditor from 'react-json-editor'

function updateConfigFailed (errMsg) {
  const messages = document.getElementById('messages')
  const errorMsg = document.getElementById('form-error-msg')

  if (messages) {
    if (errorMsg) {
      errorMsg.setAttribute('style', 'display: block')
    } else {
      ReactDom.render(
        <Bulma.Message danger id='form-error-msg'>
          <Bulma.Message.Header>
            <p style={{margin: 0}}>Error</p>
            <Bulma.Delete
              onClick={() => {
                document
                  .getElementById('form-error-msg')
                  .setAttribute('style', 'display: none')
              }}
            />
          </Bulma.Message.Header>
          <Bulma.Message.Body>
            <Bulma.Content>
              Failed to update passport config. Please try again later. {errMsg}
            </Bulma.Content>
          </Bulma.Message.Body>
        </Bulma.Message>,
        document.getElementById('messages')
      )
    }
  }
}

class Config extends Component {
  constructor (props) {
    super(props)
    this.state = {}

    axios.get(`/api/config/passport`)
      .then((config) => {
        if (config) {
          this.setState(config.data)
        } else {
          console.log('Passport config cannot be found')
        }
      })
      .catch((error) => {
        console.log('Request failed to get passport config', error)
      })
  }

  submit () {
    axios.post(`api/config/passport`, this.state)
      .then((updated) => {
        const messages = document.getElementById('messages')
        const successMsg = document.getElementById('form-success-msg')

        if (messages) {
          if (updated.data === true) {
            this.state.lock = ''
            if (successMsg) {
              successMsg.setAttribute('style', 'display: block')
            } else {
              ReactDom.render(
                <Bulma.Message success id='form-success-msg'>
                  <Bulma.Message.Header>
                    <p style={{margin: 0}}>Info</p>
                    <Bulma.Delete
                      onClick={() => {
                        document
                          .getElementById('form-success-msg')
                          .setAttribute('style', 'display: none')
                      }}
                    />
                  </Bulma.Message.Header>
                  <Bulma.Message.Body>
                    <Bulma.Content>Successfully updated passport config.</Bulma.Content>
                  </Bulma.Message.Body>
                </Bulma.Message>,
                document.getElementById('messages')
              )
            }
          } else {
            console.log(updated)
            updateConfigFailed(updated.data)
          }
        }
      })
      .catch(error => updateConfigFailed())
  }

  render () {
    return (
      <div>
        <div id='messages' />
        <Bulma.Button
          className='button is-link'
          onClick={event => {
            event.preventDefault()
            this.submit()
          }}
        >
          Save
        </Bulma.Button>
        <br />
        <ReactJsonEditor values={this.state.data} onChange={values => this.setState({data: values})} />
      </div>
    )
  }
}

export default Config
