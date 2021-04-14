import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import useStyles from '../Styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class AnswerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { answer: '', error: false, helperText: ''};

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
        // console.log(`evidence: `, this.props.evidence)
        // if (this.props.evidence.length === 0) {
        //     this.setState({error: true, helperText: "You must record at least once piece of evidence."});
        // } else {
        //     this.setState({error: false, helperText: ''});
        //     this.setState({answer: ''});
        //     this.props.onSubmit(this.state.answer);
        // }
        this.setState({error: false, helperText: ''});
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
            // answerForm = <TextField
            //                 error
            //                 id="standard-error-helper-text"
            //                 label="Error"
            //                 defaultValue="Hello World"
            //                 helperText="We at least once piece of evidence."
            //             />
            <form onSubmit={this.handleSubmit} className={classes.root} noValidate autoComplete="off" 
                style={{"display": "flex", "alignItems": "center"}}>
                <TextField 
                    inputRef={this.textInput}
                    value={this.state.answer} 
                    onChange={this.handleChange} 
                    label={"Answer"} 
                    variant="outlined" 
                    error={this.state.error}
                    helperText={this.state.helperText}
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



export default withStyles(useStyles)(AnswerForm);