import React from 'react';
import Button from '@material-ui/core/Button';

class Buzzer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {isToggled: false, time: "Buzz"};
  
      this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick() {
        this.props.onClick();
        this.timerID = setInterval(
            () => this.countdown(),
            1000
        );
    //   this.setState(state => ({
    //     isToggleOn: !state.isToggleOn
    //   }));
    }
    // componentDidMount() {
    //     this.readerID = setInterval(
    //         () => this.read(),
    //         100
    //     );
    // }
    // componentWillUnmount() {
    //     clearInterval(this.timerID);
    // }
    countdown() {
        if (this.state.time == "Buzz"){
            this.setState({time: 3})
        } else if (this.state.time <= 0){
            clearInterval(this.timerID);
            
        } else {
            this.setState({time: this.state.time - 1})
        }
    }
    render() {
    //   return (
    //     <button onClick={this.handleClick}>
    //       {this.state.isToggleOn ? 'ON' : 'OFF'}
    //     </button>
    //   );
      return <Button variant="contained" color="secondary" onClick={this.handleClick}>
         {this.state.time}
             </Button>;
    }
  }


export default Buzzer;
