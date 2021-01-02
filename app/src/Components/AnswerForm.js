import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import useStyles from '../Styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class AnswerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { answer: '' };

        this.textInput = React.createRef();
        this.isToggled = false;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        // this.handleClick = this.handleClick.bind(this);
        this.handleShortcut = this.handleShortcut.bind(this);
        
    }

    componentDidMount() {
        // document.onkeydown = this.handleShortcut;
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
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 32 && this.textInput.current) {
        // if (e.keyCode === 32 && this.textInput.current && document.activeElement.tagName == 'BODY') {
        //   console.log(document.activeElement.tagName)
          e.preventDefault();
        //   console.log(this.textInput);
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
                    value={this.state.answer} 
                    onChange={this.handleChange} 
                    id="answer_box" 
                    label={"Answer"} 
                    variant="outlined" 
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



export default withStyles(useStyles)(AnswerForm);