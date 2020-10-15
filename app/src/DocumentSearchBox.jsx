import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class DocumentSearchBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { answer: '' };

        this.textInput = React.createRef();
        this.shortcutKeyCode = 191;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleShortcut = this.handleShortcut.bind(this);
        window.addEventListener("keydown", this.handleShortcut);
    }

    handleChange(event) {
        this.setState({ answer: event.target.value });
    }

    handleSubmit(event) {
        // alert('You submitted: ' + this.state.answer);
        event.preventDefault();
        this.setState({answer: ''});
        this.props.onSubmit(this.state.answer);
    }

    // keyboard shortcut to focus
    handleShortcut(e) {
        if (e.keyCode === this.shortcutKeyCode && this.textInput.current) {
          e.preventDefault();
        //   console.log(this.textInput);
          this.textInput.current.focus();
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <form onSubmit={this.handleSubmit} className={classes.root} noValidate autoComplete="off" 
                style={{"display": "flex", "align-items": "center"}}>
                <TextField 
                    inputRef={this.textInput}
                    value={this.state.answer} 
                    onChange={this.handleChange} 
                    id="answer_box" 
                    label={this.props.label} 
                    variant="outlined" 
                />
                <div style={{padding: 20}}>
                    <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                        Submit
                    </Button>
                </div>
            </form>

        );
    }
}



export default withStyles(useStyles)(DocumentSearchBox);