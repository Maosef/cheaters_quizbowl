import React from 'react';
import Button from '@material-ui/core/Button';

class Button_React extends React.Component {
    constructor(props) {
      super(props);
      this.state = {isToggled: false};
  
      this.handleClick = this.handleClick.bind(this);
    }
    
    handleClick() {
        this.props.onClick();

    //   this.setState(state => ({
    //     isToggleOn: !state.isToggleOn
    //   }));
    }

    render() {
    //   return (
    //     <button onClick={this.handleClick}>
    //       {this.state.isToggleOn ? 'ON' : 'OFF'}
    //     </button>
    //   );
      return <Button variant="contained" color="secondary" onClick={this.handleClick}>
         {this.props.text}
             </Button>;
    }
  }


export default Button_React;
