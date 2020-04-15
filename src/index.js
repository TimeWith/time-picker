import React, { Component } from 'react'
import {
  addMinutes,
  differenceInMinutes,
  format as formatTime,
  isEqual,
  isBefore,
  isAfter,
  set
} from 'date-fns'
import TimeField from 'react-simple-timefield'
import styled from '@emotion/styled'
import { tablet_max, phablet_max, phone_max } from '@time-with/media-queries'


class TimePicker extends Component {
  constructor(props) {
    super(props)
    // generate options
    const options = this.generateOptions()
    this.state = { options, drawerOpen: false }
    this.inputRef = React.createRef()
  }


  componentDidMount() {
    // used to capture clicks outside the component
    window.addEventListener('mousedown', this.handleMouseOutside)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleMouseOutside)
  }

  componentDidUpdate(prevProps) {
    const inputsHaveFocus = this.inputRef.current === document.activeElement
    const limitsChanged = differenceInMinutes(this.props.minTime, prevProps.minTime) !== 0
      || differenceInMinutes(this.props.maxTime, prevProps.maxTime) !== 0

    if (!inputsHaveFocus && limitsChanged) {
      this.validateAndUpdateValues()
    }
  }

  validateAndUpdateValues = () => {
    // update time if out of bounds
    if (isBefore(this.state.time, this.props.minTime)) this.setTime(this.props.minTime)
    else if (isAfter(this.state.time, this.props.maxTime)) this.setTime(this.props.maxTime)
    // generate select options based on new bounds
    this.setState({ options: this.generateOptions() })
  }

  generateOptions() {
    const {
      minTime,
      maxTime,
      step,
      format
    } = this.props
    const minutesStep = step || 15
    let timesArray = []
    let time = minTime
    while (isBefore(time, maxTime) || isEqual(time, maxTime)) {
      timesArray.push(time)
      time = addMinutes(time, minutesStep)
    }
    const selectOptions = timesArray.map((timeOption) => (
      <SelectOption
        key={timeOption.toString()}
        onClick={() => this.setState({ drawerOpen: false }, () => this.setTime(timeOption))}
        className='tw-time-picker-custom-option'
      >
        <PSmall>{formatTime(timeOption, format || 'HH:mm')}</PSmall>
      </SelectOption>
    ))
    return {
      selectOptions: selectOptions,
      times: timesArray,
    }
  }

  handleMouseOutside = (e) => {
    // close the drawer when clicking outside the component
    const { drawerOpen } = this.state
    const clickedNodeCL = e.target.classList ? e.target.classList.value : null
    const clickedNodeParentCL = e.target.parentNode.classList ? e.target.parentNode.classList.value : null
    if (drawerOpen && !(clickedNodeCL.indexOf('tw-time-picker') > -1
        || clickedNodeParentCL.indexOf('tw-time-picker') > -1)) {
      this.setState({ drawerOpen: false })
    }
  }

  handleInputFocus = () => {
    // select hours content when clicking the hours input
    this.setState({ drawerOpen: true })
  }

  handleTimeUpdate = (_, time) => {
    const timeParts = time.split(':')
    const newTime = set(this.props.value, { hours: timeParts[0], minutes: timeParts[1] })
    this.setTime(newTime)
  }

  setTime = time => this.props.onChange && this.props.onChange(time)

  render () {
    const {
      drawerOpen,
      options,
    } = this.state

    return(
      <RootDiv className='tw-time-picker-root'>
        <InputsRoot active={drawerOpen}>
          <TimeField
            value={formatTime(this.props.value || options.times[0], this.props.format || 'HH:mm')}
            onChange={this.handleTimeUpdate}
            input={
              <Input
                onBlur={this.validateAndUpdateValues}
                onFocus={this.handleInputFocus}
                ref={this.inputRef}
              />
            }
          />
        </InputsRoot>
        <SelectRoot
          numItems={options.selectOptions.length}
          active={drawerOpen}
          className='tw-time-picker-select-root'
        >
          {options.selectOptions}
        </SelectRoot>
      </RootDiv>
    )
  }
}

export default TimePicker

const RootDiv = styled.div({
  position: 'relative',
  height: '45px',
  width: '82px',
  marginBottom: '30px',
  [tablet_max]: {
    marginTop: '20px',
    marginBottom: '30px',
    height: '40px',
  },
})

const SelectRoot = styled.div(props => ({
  position: 'absolute',
  top: '47px',
  left: '0',
  background: 'white',
  maxHeight: '200px',
  width: props.numItems > 4 ? '95px' : '80px',
  flexDirection: 'column',
  overflow: 'hidden',
  overflowY: props.numItems > 4 ? 'scroll' : 'hidden',
  boxShadow: '0 1px 4px 0 rgba(0,0,0,0.40)',
  display: props.active ? 'block' : 'none',
  zIndex: '60',
  [tablet_max]: {
    top: '42px',
  },
}))

const SelectOption = styled.div(props => ({
  paddingLeft: '10px',
  cursor: 'pointer',
  height: '45px',
  width: '80px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: props.active ? '#e7f1fb' : 'white',
  ':hover': {
    backgroundColor: '#e7f1fb',
  },
  [tablet_max]: {
    height: '40px',
  },
}))

const PSmall = styled.p({
  lineHeight: '150%',
  margin: '0',
  color: '#4A4A4A',
  fontSize: '16px',
  [tablet_max]: {
    fontSize: '15px',
  },
  [phablet_max]: {
    fontSize: '14px',
  },
  [phone_max]: {
    fontSize: '13px',
  },
})

const InputsRoot = styled.div({
  display: 'flex',
  border: '2px solid #d1e1f1',
  borderRadius: '4px',
})

const Input = styled.input({
  width: '100%',
  height: '45px',
  backgroundColor: '#e7f1fb',
  outline: 'none',
  border: 'none',
  fontSize: '17px',
  fontFamily: 'initial',
  fontWeight: '500',
  lineHeight: '150%',
  color: '#4A4A4A',
  textAlign: 'center',
  [tablet_max]: {
    height: '40px',
  },
})
