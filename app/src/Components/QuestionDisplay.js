import React from 'react';
import Paper from '@material-ui/core/Paper';
import useStyles from '../Styles';

// question card: reads a question word by word. can be interrupted by buzzer
// option: pause after each sentence, until continue button is clicked

class QuestionDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        // this.classes = useStyles();
        this.read_time_ms = 175;
        this.state = {
            wordIndex: 0, 
            text: "",
            readerID: 0,
            words: []
        };

        // this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        this.setState({words: this.props.text.split(" ")});
        let readerID = setInterval(
            () => this.read(),
            this.read_time_ms
        );
        this.setState({readerID: readerID})
    }
    componentWillUnmount() {
        clearInterval(this.state.readerID);
    }

    componentDidUpdate(prevProps) {
        // reset state if question changed
        if (prevProps.text !== this.props.text){
            console.log('question changed');
            this.setState({wordIndex: 0, text: "", words: this.props.text.split(" ")});
            // reset the reader or else there will be two
            clearInterval(this.state.readerID);

            let readerID = setInterval(
                () => this.read(),
                this.read_time_ms
            );
            this.setState({readerID: readerID})
        }
    }

    read() {
        if (this.state.wordIndex >= this.state.words.length) {
            clearInterval(this.state.readerID);
        } else if (this.props.interrupted){
            this.setState({
                text: this.state.text});
        } else {
            this.setState({
                text: this.state.text + " " + this.state.words[this.state.wordIndex],
                wordIndex: this.state.wordIndex + 1
              });
        }
    }

    render() {
        return (
            <div style={{ "maxWidth": "600px", "margin": "auto"}}>
                <p>{this.state.text}</p>
            </div>
        );
    }
}

export default QuestionDisplay;
