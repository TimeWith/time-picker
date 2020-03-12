# Timewith Time Picker

Simple React TimePicker

## Install

With [npm](http://npmjs.org) do:

```bash
$ npm install @time-with/time-picker
or
$ yarn add @time-with/time-picker
```

## Usage

    import TimePicker from '@time-with/time-picker'

    <TimePicker
      step={15}
      minTime={new Date()}
      maxTime={new Date()}
      value={new Date()}
      format="HH:mm"
      onChange={this.handleTimeChange}
    />


## Parameters
| PropName | Type | Description |
|:----------:|:----:|------------|
| step     | int  | The step between time options|
| minTime  | date | The min time |
| maxTime  | date | The max time |
| value    | date | The input value |
| format   | string| How to format the time. Internally it uses the `format()` of `date-fns`. Format options [here](https://date-fns.org/v2.10.0/docs/format). |
| onChange | func | On change handler |

## License

MIT
