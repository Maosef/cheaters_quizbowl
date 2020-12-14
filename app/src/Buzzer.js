import React from 'react';
import Button from '@material-ui/core/Button';

class Buzzer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {isToggled: false, time: "Buzz"};
      this.isToggled = false;
      this.answerTime = 5
  
      this.handleClick = this.handleClick.bind(this);
      this.handleShortcut = this.handleShortcut.bind(this);
      this.countdown = this.countdown.bind(this);
      
    }

    componentDidMount() {
      document.onkeydown = this.handleShortcut;
    }

    // keyboard shortcut to focus
    handleShortcut(e) {
        console.log('keypress')
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 32 && this.isToggled === false) {
        // if (e.keyCode === 32 && this.isToggled == false && document.activeElement.tagName == 'BODY') {
          this.isToggled = true;
          
          e.preventDefault();
          this.handleClick();
          console.log('buzzed, ', this.isToggled);
        }
    }

    handleClick() {
        this.props.onClick();
        this.setState({time: this.answerTime})
        this.timerID = setInterval(
            () => this.countdown(),
            1000
        );
    }

    countdown() {
        if (this.state.time <= 1){
            clearInterval(this.timerID);
            alert("Time's up!");
            this.setState({time: "Buzz"})
            this.props.onTimeout();
            this.isToggled = false;
        } else {
            this.setState({time: this.state.time - 1})
        }
    }
    render() {
      return <Button variant="contained" color="primary" onClick={this.handleClick}>
         {this.state.time}
             </Button>;
    }
  }


export default Buzzer;
