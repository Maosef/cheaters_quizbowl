import React from 'react';
import Button from '@material-ui/core/Button';

class Buzzer extends React.Component {
    constructor(props) {
      super(props);
      this.state = {isToggled: false, text: "Buzz"};
      this.isToggled = false;
      this.answerTime = 5
  
      this.handleClick = this.handleClick.bind(this);
      this.handleShortcut = this.handleShortcut.bind(this);
      this.deactivateShortcut = this.deactivateShortcut.bind(this);
    }

    componentDidMount() {
        // window.addEventListener("keydown", this.handleShortcut);
        // window.addEventListener("keyup", this.deactivateShortcut);
        //   document.onkeydown = this.handleShortcut;
        //   document.onkeyup = this.deactivateShortcut;
    }

    // keyboard shortcut to focus
    handleShortcut(e) {
        // if ((e.ctrlKey || e.metaKey) && e.keyCode === 32 && this.state.isToggled === false) {
        if (e.keyCode === 32 && this.state.isToggled === false && document.activeElement.tagName == 'BODY') {
          this.setState({isToggled: true});
          
          e.preventDefault();
          this.handleClick();
          console.log('buzzed, ', this.isToggled);
        }
    }

    deactivateShortcut(e) {
        this.setState({isToggled: false});
    }

    handleClick() {
        this.props.onClick();
        // if (this.state.text === 'Buzz') {
        //     this.setState({text: "Resume"})
        // } else {
        //     this.setState({text: "Resume"})
        // }
        
        // this.timerID = setInterval(
        //     () => this.countdown(),
        //     1000
        // );
    }

    // countdown() {
    //     if (this.state.time <= 1){
    //         clearInterval(this.timerID);
    //         alert("Time's up!");
    //         this.setState({time: "Buzz"})
    //         this.props.onTimeout();
    //         this.isToggled = false;
    //     } else {
    //         this.setState({time: this.state.time - 1})
    //     }
    // }
    render() {
        let text = "";
        if (this.props.interrupted) {
            text = "Resume (spacebar)";
        } else {
            text = "Buzz (spacebar)";
        }
        return <Button variant="contained" color="primary" onClick={this.handleClick}>
                {text}
             </Button>;
    }
  }

export default Buzzer;
