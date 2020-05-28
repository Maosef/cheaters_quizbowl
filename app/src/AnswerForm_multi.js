import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import useStyles from './Styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class AnswerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {query: '', evidence: '', answer: '' };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        // const target = event.target;
        // if (target == "query") {

        // } else if (target == "evidence") {

        // } else {

        // }
        const name = event.target.name;
        // console.log(name);
        this.setState({ [name]: event.target.value });
    }

    handleSubmit(event) {
        const state = this.state;
        // alert('You submitted: ' + state.query + state.evidence + state.answer);
        event.preventDefault();
        this.props.onSubmit(state.query, state.evidence, state.answer);
    }

    render() {
        const { classes } = this.props;
        return (
            <form className={classes.root} noValidate autoComplete="off" >
                <div>

                <TextField 
                    name="query" 
                    value={this.state.query} 
                    onChange={this.handleChange} 
                    label="write query here"
                    variant="outlined" 
                    style={{display:"block",margin: 10,}}
                />
                <TextField 
                    name="evidence" 
                    value={this.state.evidence} 
                    onChange={this.handleChange} 
                    label="write helpful results here"
                    variant="outlined" 
                    style={{display:"block",margin: 10,}}
                />
                <TextField 
                    name="answer" 
                    value={this.state.answer} 
                    onChange={this.handleChange} 
                    label="write answer here"
                    variant="outlined" 
                    style={{display:"block",margin: 10,}}
                />
                <Button variant="contained" color="secondary" onClick={this.handleSubmit}>
                    Submit
                </Button>
                </div>
            </form>

        );
    }
}



export default withStyles(useStyles)(AnswerForm);