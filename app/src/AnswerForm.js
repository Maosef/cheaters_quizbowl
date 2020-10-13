import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';
import TextField from '@material-ui/core/TextField';

class AnswerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { answer: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
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

    render() {
        const { classes } = this.props;
        return (

            <form onSubmit={this.handleSubmit} className={classes.root} noValidate autoComplete="off">
                <TextField 
                    value={this.state.answer} 
                    onChange={this.handleChange} 
                    id="answer_box" 
                    label={this.props.label} 
                    variant="outlined" 
                />
            </form>

        );
    }
}



export default withStyles(useStyles)(AnswerForm);