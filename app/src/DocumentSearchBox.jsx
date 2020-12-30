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
        this.shortcutKeyCode = 83;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleShortcut = this.handleShortcut.bind(this);
        window.addEventListener("keydown", this.handleShortcut);
    }

    handleChange(event) {
        // this.setState({ answer: event.target.value });
        this.props.handleInputChange(event);
    }

    handleSubmit(event) {
        // alert('You submitted: ' + this.state.answer);
        event.preventDefault();
        this.props.onSubmit(this.props.curQuery);
    }

    // keyboard shortcut to focus
    handleShortcut(e) {
        
        if ((e.ctrlKey || e.metaKey) && e.keyCode === this.shortcutKeyCode && this.textInput.current) {
            e.preventDefault();
        //   console.log(this.textInput);
            // this.setState({answer: });
            this.textInput.current.focus();
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <form onSubmit={this.handleSubmit} className={classes.root} noValidate autoComplete="off" 
                style={{"display": "flex", "alignItems": "center"}}>
                <TextField 
                    inputRef={this.textInput}
                    value={this.props.curQuery} 
                    onChange={this.handleChange} 
                    id="answer_box" 
                    label={"Search Documents (Ctrl-s)"} 
                    variant="outlined" 
                    // defaultValue={this.props.curQuery}
                />
                {/* <div style={{padding: 20}}>
                    <Button variant="contained" color="primary" onClick={this.handleSubmit}>
                        Submit
                    </Button>
                </div> */}
            </form>

        );
    }
}



export default withStyles(useStyles)(DocumentSearchBox);