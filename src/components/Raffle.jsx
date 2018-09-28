import React, { Component } from 'react'
import ReactDom from 'react-dom'
import axios from 'axios'
import * as Bulma from 'reactbulma'
import Checkbox from './components/Checkbox'
import { mergeDeep } from '../modules/util'

function Meals (props) {
  const meals = props.app.state.tracker.meals
  const mealsEl = [];

  Object.keys(meals).forEach((day, indexD) => {
    Object.keys(meals[day]).forEach((meal, indexM) => {
      const val = `${day} ${meal}`

      mealsEl.push(
        <Checkbox
          id={val}
          name={val}
          key={`${indexD}${indexM}`}
          value={val}
          state={props.app.state.tracker.meals[day][meal]}
          updateState={event => {
            console.log(props)
            props.app.setState((prevState, sprops) => {
              return {
                tracker: {
                  ...prevState.tracker,
                  meals: {
                    ...prevState.tracker.meals,
                    [day]: {
                      ...prevState.tracker.meals[day],
                      [meal]: !prevState.tracker.meals[day][meal]
                    }
                  }
                }
              }
            })
          }}
        />
      )
    })
  })

  return mealsEl.length > 0 ? mealsEl : null
}

function updatePassportFailed () {
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
              Failed to update user passport. Please try again later.
            </Bulma.Content>
          </Bulma.Message.Body>
        </Bulma.Message>,
        document.getElementById('messages')
      )
    }
  }
}

class Raffle extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: {
        id: props.app.location.query.uid || '',
        name: '',
      },
      tracker: {
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
        workshops: 0,
      }
    }

    if (this.state.user.id !== '') {
      axios.get(`/api/passport/${this.state.user.id}`)
        .then((passport) => {
          if (passport) {
            this.setState({
              user: {
                ...this.state.user,
                name: passport.name,
              },
              tracker: mergeDeep(Object.assign({}, this.state.tracker), passport.state)
            })
          } else {
            console.log('User passport cannot be found')
          }
        })
        .catch((error) => {
          console.log('Request failed to get user passport', error)
        })
    }
  }

  submit () {
    if (this.state.user.id !== '') {
      axios.post(`api/passport/${this.state.user.id}`, this.state.tracker)
        .then((updated) => {
          const messages = document.getElementById('messages')
          const successMsg = document.getElementById('form-success-msg')

          if (messages) {
            if (updated) {
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
            <Bulma.Content>No user passport currently active.</Bulma.Content>
          </Bulma.Message.Body>
        </Bulma.Message>,
        document.getElementById('messages')
      )
    }
  }

  render () {
    return (
      <div>
        <div id='messages' />
        <form id='app-form' className='js-form'>
          <fieldset>
            <legend>
              Passport {
                this.state.user.name !== ''
                  ? `for ${this.state.user.name}`
                  : ''
              }
            </legend>

            <div className='label'>Registered</div>
            <Checkbox
              id='registered'
              name='registered'
              value='Registered'
              state={this.state.tracker.registered}
              updateState={event => {
                this.setState((prevState, props) => {
                  return {
                    tracker: {
                      ...prevState.tracker,
                      registered: !prevState.tracker.registered,
                    }
                  }
                })
              }}
            />

            <div className='label'>Meals</div>
            <Meals app={this} />

            <label htmlFor='workshops' className='label'>Workshops</label>
            <div className='field'>
              <div className='control'>
                <input
                  id='workshops'
                  type='number'
                  value={this.state.tracker.workshops}
                  name='workshops'
                  min={0}
                  required
                  onChange={event =>
                    this.setState({
                      tracker: {
                        ...this.state.tracker,
                        workshops: parseInt(event.target.value, 10)
                      }
                    })
                  }
                />
              </div>
            </div>
          </fieldset>

          <Bulma.Button
            className='button is-link'
            onClick={event => {
              event.preventDefault()
              this.submit()
            }}
          >
            Submit
          </Bulma.Button>
        </form>
      </div>
    )
  }
}

export default Raffle
