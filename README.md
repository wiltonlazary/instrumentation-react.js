# Instrumentation and deep data binding for react.js

Example: in typescript

//---------------------------------//
import * as React from 'react'
import './App.css'
const logo = require('./logo.svg')
import Button from 'material-ui/Button'
import Switch from 'material-ui/Switch'
import { Component } from './globals'

//instrumentation import
import { observer, observed } from 'instrumentation-react.js'

@observer()
class Text1 extends Component {
    state = {
        checked: true
    }

    @observed()
    test = null

    render() {
        console.log('render test:', this.test)

        return (
            <div className="Text1">
                <h2>Welcome to React: {this.props.store.name} test:{this.test}</h2>

                <Button ref="btn1" onClick={this.localChange.bind(this, event)}>
                    {this.props.store.state.name + " => " + this.state.checked}
                </Button>

                <Switch ref="switch1" label="Toggled by default" checked={this.state.checked} onChange={this.localChange.bind(this, event)} />
                <Switch ref="switch2" label="Toggled by default" onChange={this.localChange2.bind(this, event)} />
            </div>
        )
    }

    localChange(event) {
        const switch1 = (this.refs as any).switch1
        this.state.checked = !this.state.checked
        window['subject'] = this
    }

    localChange2(event) {
        const switch1 = (this.refs as any).switch1
        this.state.checked = !this.state.checked
        window['subject'] = this
    }

    componentDidMount() {
        console.log('Text1.componentDidMount')
    }
}

@observer()
export default class App extends Component {
    state = {
        name: '::Initial name::'
    }

    constructor(props) {
        super(props)
        window['app'] = this
    }

    render() {
        return (
            <div className="App">
                <Text1 store={this} />
                <p className="App-intro">
                    To get started, edit <code>src/App.tsx</code> and save to reload.
                    name: {this.state.name}
                </p>
            </div>
        )
    }
}
