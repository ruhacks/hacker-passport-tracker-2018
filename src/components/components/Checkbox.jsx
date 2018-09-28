import React from 'react'

function Checkbox (props) {
  return (
    <label
      htmlFor={props.id.replace(/\s/g, '-').toLowerCase()}
      className={`radio tag is-medium ${
        props.state === true
          ? 'is-primary'
          : ''
      }`}
    >
      <input
        id={props.id.replace(/\s/g, '-').toLowerCase()}
        type='checkbox'
        value={props.value.replace(/\s/g, '-').toLowerCase()}
        name={props.name}
        checked={props.state === true}
        required
        onChange={props.updateState}
      />
      {props.value}
    </label>
  )
}

export default Checkbox
