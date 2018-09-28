import React, { Component } from 'react'
import ReactDom from 'react-dom'
import axios from 'axios'
import * as Bulma from 'reactbulma'
import QrReader from 'react-qr-scanner'
import { mergeDeep } from '../modules/util'

// https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
function flattenObj (data) {
  var result = {}
  function recurse (cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur
    } else if (Array.isArray(cur)) {
      for(var i=0, l=cur.length; i<l; i++)
        recurse(cur[i], prop + "[" + i + "]")
      if (l === 0)
        result[prop] = []
    } else {
      var isEmpty = true
      for (var p in cur) {
        isEmpty = false
        recurse(cur[p], prop ? prop+"-"+p : p)
      }
      if (isEmpty && prop)
        result[prop] = {}
    }
  }
  recurse(data, "")
  return result
}

function updatePassportFailed (errMsg) {
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
              Failed to update user passport. Please try again later.{errMsg}
            </Bulma.Content>
          </Bulma.Message.Body>
        </Bulma.Message>,
        document.getElementById('messages')
      )
    }
  }
}

class Scanner extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: {
        id: '',
      },
      tracker: {},
      active: 'registered',
      delay: 500,
      processing: []
    }

    this.state.tracker = flattenObj({
      registered: false,
      meals: {
        fri: {
          dinner: false,
          midnight: false,
        },
        sat: {
          breakfast: false,
          lunch: false,
          dinner: false,
          midnight: false,
        },
        sun: {
          breakfast: false,
        }
      },
      events: {},
    })

    this.handleScan = this.handleScan.bind(this)
  }

  handleScan (data) {
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
          <Bulma.Content>QR Code Scanned Data: {data}</Bulma.Content>
        </Bulma.Message.Body>
      </Bulma.Message>,
      document.getElementById('info')
    )

    if (data && data !== '') {
      this.state.processing.push(data)

      ReactDom.render(
        <div>
          <div>List of processing Ids</div>
          <ul>
            {this.state.processing.map((item) => (
              <li>{item}</li>
            ))}
          </ul>
        </div>,
        document.getElementById('processing')
      )

      axios.get(`api/passport/${data}`)
        .then((passport) => {
          if (passport) {
            this.setState({
              tracker: mergeDeep(Object.assign({}, this.state.tracker), passport.state)
            })
          }

          this.setState({
            tracker: {
              ...this.state.tracker,
              [this.state.active]: true,
            }
          }, () => {
            // ReactDom.render(
            //   <Bulma.Message success id='form-success-msg'>
            //     <Bulma.Message.Header>
            //       <p style={{margin: 0}}>Info</p>
            //       <Bulma.Delete
            //         onClick={() => {
            //           document
            //             .getElementById('form-success-msg')
            //             .setAttribute('style', 'display: none')
            //         }}
            //       />
            //     </Bulma.Message.Header>
            //     <Bulma.Message.Body>
            //       <Bulma.Content>{JSON.stringify(this.state.tracker)}</Bulma.Content>
            //     </Bulma.Message.Body>
            //   </Bulma.Message>,
            //   document.getElementById('dump')
            // )

            axios.post(`api/passport/${data}`, this.state.tracker)
              .then((updated) => {
                const messages = document.getElementById('messages')
                const successMsg = document.getElementById('form-success-msg')

                this.setState({
                  processing: this.state.processing.filter(item => item !== data)
                })

                ReactDom.render(
                  <div>
                    <div>List of processing Ids</div>
                    <ul>
                      {this.state.processing.map((item) => (
                        <li>{item}</li>
                      ))}
                    </ul>
                  </div>,
                  document.getElementById('processing')
                )

                if (messages) {
                  if (updated) {
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
                          <Bulma.Content>{updated}</Bulma.Content>
                        </Bulma.Message.Body>
                      </Bulma.Message>,
                      document.getElementById('dump')
                    )
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
                            <Bulma.Content>Successfully updated user passport.</Bulma.Content>
                          </Bulma.Message.Body>
                        </Bulma.Message>,
                        document.getElementById('messages')
                      )
                    }
                  } else {
                    updatePassportFailed()
                  }
                }
              })
              .catch(error => updatePassportFailed())
          })
        })
        .catch(error => updatePassportFailed('Failed to get user data.'))
    }
  }

  handleError(err){
    console.error(err)
  }

  render () {
    const previewStyle = {
      height: 400,
      width: 400,
    }

    return (
      <div>
        <div id='info' />
        <div id='dump' />
        <div id='messages' />
        <form id='app-form' className='js-form'>
          <legend>
            Scanner
          </legend>

          <div className='label'>Current Event</div>
          <select
            onChange={
              (event) => {
                this.setState({
                  active: event.target.value
                })
              }
            }>
            {Object.keys(this.state.tracker).map((key, index, arr) => (
              <option value={key} key={index}>{key.replace(/\./g, ' ')}</option>
            ))}
          </select>

          <QrReader
            delay={this.state.delay}
            style={previewStyle}
            onError={this.handleError}
            onScan={this.handleScan}
          />
        </form>
        <div id='processing' />
      </div>
    )
  }
}

export default Scanner
