import React, { Component } from 'react'
import { differenceInMinutes, addMinutes, format, set } from 'date-fns'
import styled from '@emotion/styled'
import { tablet_max, phablet_max, phone_max } from '@time-with/media-queries'

const defaultMinHour = 7
const defaultMinMinutes = 0
const defaultMaxHour = 23
const defaultMaxMinutes = 0
const allowedCharacters = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete']

class TimePicker extends Component {

  constructor(props) {
    super(props)
    // generate options
    const options = this.generateOptions()
    // get first time slot hours & minutes
    let currentHours
    let currentMinutes
    if (this.props.value) {
      // use value from props
      currentHours = this.props.value.hours
      currentMinutes =  this.props.value.minutes
    } else {
      // use the first slot
      const firstSlotSplit = options.times[0].split(':')
      currentHours = firstSlotSplit[0]
      currentMinutes =  firstSlotSplit[1]
    }
    this.state = {
      selectOptions: options.selectOptions,
      time: {
        hours: currentHours,
        minutes: currentMinutes,
      },
    }
    this.rightInputRef = React.createRef()
    this.leftInputRef = React.createRef()
  }

  componentDidUpdate(prevProps) {
    if (this.props.minHour !== prevProps.minHour || this.props.maxHour !== prevProps.maxHour) {
      // handle changes in min and max hour
      const updateObject = {}
      // generate select options
      updateObject.selectOptions = this.generateOptions().selectOptions
      if (this.state.time.hours < this.props.minHour) {
        // adjust time to new min
        updateObject.time = {hours: this.props.minHour, minutes: this.state.time.minutes}
      } else if (this.state.time.hours > this.props.maxHour) {
        // adjust time to new max
        updateObject.time = {hours: this.props.maxHour, minutes: this.state.time.minutes}
      }
      this.setState(updateObject)
    }
    // optional updateHandler
    // only necessary if on each time change, updates are required elsewhere
    if (this.props.updateHandler) {
      this.props.updateHandler(this.state)
    }
  }

  componentDidMount() {
    // used to capture clicks outside the component
    window.addEventListener('mousedown', this.handleMouseOutside)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleMouseOutside)
  }

  generateOptions() {
    const minHour = this.props.minHour || defaultMinHour
    const maxHour = this.props.maxHour || defaultMaxHour
    const minMinutes = this.props.minMinutes || defaultMinMinutes
    const maxMinutes = this.props.maxMinutes || defaultMaxMinutes
    const timesArray = []
    const newDate = new Date()
    var timeValue = set(newDate, {hours: minHour, minutes: minMinutes, seconds: 0})
    const endLimit = set(newDate, {hours: maxHour, minutes: maxMinutes, seconds: 0})
    const step = this.props.step || 15
    var selectOptions = []
    let timeSlot = format(timeValue, 'HH:mm')
    timesArray.push(timeSlot)
    selectOptions.push(
      <SelectOption
        key={timeValue}
        onClick={this.handleSelectOption}
        className='tw-time-picker-custom-option'
        >
        <PSmall>{timeSlot}</PSmall>
      </SelectOption>
    )
    var lastValue
    timeValue = addMinutes(new Date(timeValue), step)
    while (this.isEarlierThanEndLimit(timeValue, endLimit, lastValue)) {
      lastValue = timeValue
      timeSlot = format(timeValue, 'HH:mm').toString().toLowerCase()
      timeValue = addMinutes(new Date(timeValue), step)
      timesArray.push(timeSlot)
      selectOptions.push(
        <SelectOption
          key={timeValue}
          onClick={this.handleSelectOption}
          className='tw-time-picker-custom-option'
          >
          <PSmall>{timeSlot}</PSmall>
        </SelectOption>
      )
    }
    return {
      selectOptions: selectOptions,
      times: timesArray,
    }
  }

  isEarlierThanEndLimit(timeValue, endLimit, lastValue) {
    const diffFromLimit = differenceInMinutes(new Date(timeValue), new Date(endLimit))
    const timeValueIsEarlier = diffFromLimit < 0
    const timeValueIsLaterThanLastValue = !lastValue ? true : differenceInMinutes(new Date(lastValue), new Date(timeValue)) < 0
    return timeValueIsEarlier && timeValueIsLaterThanLastValue
  }

  handleMouseOutside = (e) => {
    // close the drawer when clicking outside the component
    const { drawerOpen } = this.state
    const clickedNodeCL = e.target.classList ? e.target.classList.value : null
    const clickedNodeParentCL = e.target.parentNode.classList ? e.target.parentNode.classList.value : null
    if (drawerOpen && !(clickedNodeCL.indexOf('tw-time-picker') > -1 || clickedNodeParentCL.indexOf('tw-time-picker') > -1)) {
      this.setState({
        drawerOpen: false
      })
    }
  }

  setTime = (time) => {
    // catch-all handler to pass time to the parent onChange
    this.setState({time: time, drawerOpen: false}, () => this.props.onChange && this.props.onChange(time))
  }

  handleSelectOption = (e) => {
    // set time selection using dropdown
    const inputValues = e.target.innerText.split(':')
    const time =  {
      hours: inputValues[0],
      minutes: inputValues[1]
    }
    this.setTime(time)
  }

  autoSelectMinutesInput = () => {
    // clicking on the ":" auto-focuses the minutes input
    this.rightInputRef.current.focus()
    this.rightInputRef.current.select()
  }

  handleLeftInputChange = (e) => {
    // when reaching 2 characters on hours input, focus + select minutes input
    if (e.target.value.length === 2) {
      this.rightInputRef.current.focus()
      this.rightInputRef.current.select()
    }
    // handle empty value
    if (e.target.value === '') {
      this.setTime({hours: '', minutes: this.state.time.minutes })
      return
    }
    let newValue = parseInt(e.target.value, 10)
    if (newValue > 24) {
      // limit hours input to 23
      this.setTime({hours: '23', minutes: this.state.time.minutes })
    } else {
      this.setTime({hours: newValue, minutes: this.state.time.minutes })
    }
  }

  handleRightInputChange = (e) => {
    let newValue = e.target.value !== '' ? parseInt(e.target.value, 10) : 0
    // limit minutes input to max 59
    if (parseInt(newValue, 10) > 59) {
      newValue = 59
    }
    this.setTime({hours: this.state.time.hours, minutes: newValue })
  }

  handleLeftInputFocus = (e) => {
    // select hours content when clicking the hours input
    this.setState({drawerOpen: true})
    this.leftInputRef.current.focus()
    this.leftInputRef.current.select()
  }

  handleRightInputFocus = (e) => {
    // select minutes content when clicking the hours input
    this.setState({drawerOpen: true})
    this.rightInputRef.current.focus()
    this.rightInputRef.current.select()
  }

  limitCharacters = (e) => {
    // focus minutes input if pressing SHIFT+TAB while in hours input + select text content
    if (String(e.target.classList).indexOf('tw-time-picker-right') > -1 && e.key === 'Tab' && e.shiftKey) {    
      this.leftInputRef.current.focus()
      this.leftInputRef.current.select()
      e.stopPropagation();
      e.preventDefault();
      return false   
    }
    // focus hours input if pressing TAB while in hours input + select text content
    if (String(e.target.classList).indexOf('tw-time-picker-left') > -1 && e.key === 'Tab') {    
      this.rightInputRef.current.focus()
      this.rightInputRef.current.select()
      e.stopPropagation();
      e.preventDefault();
      return false   
    }
    // prevent the input of unwanted characters
    if (allowedCharacters.indexOf(e.key) === -1) {
      e.stopPropagation();
      e.preventDefault();
      return false
    }
  }

  render () {
    const {
      time,
      drawerOpen,
      selectOptions,
    } = this.state
    return(
      <RootDiv className='tw-time-picker-root'>
        <InputsRoot active={drawerOpen}>
          <InputLeft
            className='tw-time-picker-left'
            onFocus={this.handleLeftInputFocus} 
            type='text'
            maxLength='2'
            onKeyDown={this.limitCharacters}
            value={String(time.hours).length === 1 ? `0${time.hours}` : time.hours}
            ref={this.leftInputRef}
            onChange={this.handleLeftInputChange} />
          <InputCenter
            className='tw-time-picker-input'
            onFocus={this.autoSelectMinutesInput} 
            type='text'
            maxLength='1'
            defaultValue=':' />
          <InputRight
            className='tw-time-picker-right'
            onFocus={this.handleRightInputFocus} 
            type='text' 
            maxLength='2'
            onKeyDown={this.limitCharacters}
            value={String(time.minutes).length === 1 ? `0${time.minutes}` : time.minutes}
            ref={this.rightInputRef}
            onChange={this.handleRightInputChange} />
        </InputsRoot>
        <SelectRoot numItems={selectOptions.length} active={drawerOpen} className='tw-time-picker-select-root'>
          {selectOptions}
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

const InputsRoot = styled.div(props => ({
  display: 'flex',
  border: '2px solid #d1e1f1',
  borderRadius: '4px',
}))

const Input = styled.input({
  width: '35px',
  height: '45px',
  backgroundColor: '#e7f1fb',
  outline: 'none',
  border: 'none',
  fontSize: '17px',
  lineHeight: '150%',
  color: '#4A4A4A',
  fontWeight: '500',
  textAlign: 'center',
  [tablet_max]: {
    height: '40px',
  },
})

const InputLeft = styled(Input)({
  paddingLeft: '5px',
})

const InputRight = styled(Input)({
  paddingRight: '5px',
})

const InputCenter = styled(Input)({
  paddingLeft: '2px',
  paddingRight: '2px',
  width: '8px',
})