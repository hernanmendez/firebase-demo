import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paragraphs: [''],
      inUseByOthers: [],
      active: null
    }

    this.database = this.props.firebase.database();
    this.interval = null;
    this.timeout = null;
    this.update = this.update.bind(this)
    this.onChange = this.onChange.bind(this)
    this.tellActive = this.tellActive.bind(this)
    this.resetTimeout = this.resetTimeout.bind(this)
    this.changeLineCount = this.changeLineCount.bind(this)
  };

  componentDidMount() {
    let values = []
    this.database.ref().child('Projects').on('value', f => {
      values = []
      f.forEach(c => {
        console.log(c.val())
        values.push(c.val())
        if (values[this.state.active] === this.state.paragraphs[this.state.active]) {
          this.setState({ paragraphs: values })
        }
      })
    })
    this.database.ref("used").on('value', f => {
      this.setState({ inUseByOthers: JSON.parse(f.val()) })
    })
  }

  update(index) {
    if (this.state.paragraphs[index] !== null) {
      this.database.ref('Projects/' + index).set(this.state.paragraphs[index])
    }
  }

  changeLineCount(index, add) {
    if (add) {
      this.database.ref('Projects/' + index).set(this.state.paragraphs[index])
    } else {
      //delete
      this.database.ref('Projects/' + index).remove()
      setTimeout(() => this.database.ref('Projects/' + index).remove(), 300)
    }
  }

  resetTimeout() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.update(this.state.active)
      clearInterval(this.interval)
      this.tellActive(false, this.state.active)
    }, 15000)
  }

  tellActive(state, index) {
    if (state) {
      this.interval = setInterval(() => {
        this.update(index)
      }, 1000)
      this.resetTimeout()
      if (index < this.state.paragraphs.length) {
      this.database.ref('used').set(JSON.stringify([...this.state.inUseByOthers, index]))
      }
    } else {
      this.update(index)
      clearInterval(this.interval)
      clearTimeout(this.timeout)
      let inUse = ([...this.state.inUseByOthers])
      inUse.splice(inUse.indexOf(index), 1)
      this.database.ref('used').set(JSON.stringify(inUse))
    }
  }

  onChange(event, i) {
    event.preventDefault()
    let newstate = { paragraphs: [...this.state.paragraphs] }
    if (event.target.value.indexOf("\n") > -1) {
      newstate.paragraphs.splice(i + 1, 0, '')
      this.tellActive(false, i)
      this.setState(newstate, () => document.getElementById(i + 1).focus())
    } else {
      newstate.paragraphs[i] = event.target.value
      this.setState(newstate)
      this.resetTimeout()
    }
  }

  render() {
    return (
      <div className="App">
        {
          this.state.paragraphs.map((text, index) => {
            return (
              <TextareaAutosize
                disabled={this.state.inUseByOthers.indexOf(index) > -1 && this.state.active !== index}
                key={`text${index}`}
                id={index}
                onChange={e => this.onChange(e, index)}
                onKeyDown={e => {
                  if (e.key === "Backspace" && e.target.value === "") {
                    e.preventDefault()
                    let newstate = { paragraphs: [...this.state.paragraphs] }
                    newstate.paragraphs.splice(index, 1)
                    this.changeLineCount(index, false)
                    this.tellActive(false, index)
                    this.setState(newstate, () => {
                      if (this.state.inUseByOthers.indexOf(index - 1) === -1) {
                        document.getElementById(index - 1).focus()
                      }
                    })
                  }
                }}
                onFocus={e => {
                  this.setState({ active: index })
                  this.tellActive(true, index)
                }}
                onBlur={e => {
                  this.setState({ active: null })
                  this.tellActive(false, index)
                }}
                value={text}
              />
            )
          })
        }
        <button
          onClick={() => this.setState({ paragraphs: [...this.state.paragraphs, ''] }, () => document.getElementById(this.state.paragraphs.length - 1).focus())}>
          Add Line
        </button>
        <button onClick={() => {
            this.database.ref('used').set("[]")
        }}>
          Click to make every line available
        </button>
      </div>
    );
  }
}
export default App;
