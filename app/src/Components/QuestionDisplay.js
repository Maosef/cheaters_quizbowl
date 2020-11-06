import React from 'react';
import Paper from '@material-ui/core/Paper';
import useStyles from '../Styles';

// question card: reads a question word by word. can be interrupted by buzzer
// option: pause after each sentence, until continue button is clicked

class QuestionDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        // this.classes = useStyles();
        this.state = {wordIndex: 0, text: "" };
        // this.sentences = props.text.match(/[^.?!]+[.!?]+[\])'"`’”]*/g); //extract sentences via matching
        // console.log(this.sentences);
        // display the previous K sentences, then the next N words
        this.words = props.text.split(" ");

        // this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.readerID = setInterval(
            () => this.read(),
            100
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    read() {
        if (this.state.wordIndex >= this.words.length) {
            clearInterval(this.timerID);
        } else if (this.props.interrupted){
            this.setState({
                text: this.state.text});
        } else {
            this.setState({
                text: this.state.text + " " + this.words[this.state.wordIndex],
                wordIndex: this.state.wordIndex + 1
              });
        }
        
    }

    render() {
        return (
            // <Paper className={this.classes.paper}>
            <p>{this.state.text}</p>
                
            // </Paper>
        );
    }
}

export default QuestionDisplay;
