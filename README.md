# Instrumentation and deep data binding for react.js

Usage:<br>
     &nbsp;import { observer, observed } from 'instrumentation-react.js'

@observer()<br>
class Text1 extends Component {<br>
     &nbsp;state = {<br>
        &nbsp; &nbsp;checked: true<br>
     &nbsp;}<br>
    <br>
     &nbsp;@observed()<br>
     &nbsp;test = null <br>
    <br>
     &nbsp;render(){<br>
        &nbsp;//<br> 
     &nbsp;}<br>
}<br>