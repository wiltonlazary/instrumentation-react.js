# Instrumentation and deep data binding for react.js

Usage:
    import { observer, observed } from 'instrumentation-react.js' //import decorators

@observer() //class decorator
class Text1 extends Component {
    state = {
        checked: true
    }

    @observed() // property decorator
    test = null 
}