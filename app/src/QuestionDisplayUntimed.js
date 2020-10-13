import React from 'react';
import Paper from '@material-ui/core/Paper';
import useStyles from './Styles';
import ContinueButton from './ContinueButton';

// question card: reads a question word by word. can be interrupted by buzzer
// option: pause after each sentence, until continue button is clicked

class QuestionDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        // this.classes = useStyles();
        this.state = {wordIndex: 0, sentenceIndex: 0, words: [], text: "", isReading: false };
        // var Tokenizer = require('sentence-tokenizer');
        // var tokenizer = new Tokenizer('Chuck');
        // tokenizer.setEntry(props.text);
        // this.sentences = tokenizer.getSentences();
        this.sentences = props.tokenizations.map(span => props.text.slice(...span));
        // this.sentences = props.text.match(/[^.?!]+[.!?]+[\])'"`’”]*/g); //extract sentences via matching
        // console.log(this.sentences);
        

        // this.handleContinue = this.handleContinue.bind(this);
        this.read = this.read.bind(this);
        this.readWords = this.readWords.bind(this);
    }

    // handleContinue() { // when continue button is clicked

    // }

    componentDidMount() {
        this.read();
    }
    componentDidUpdate(prevProps) {
        // console.log(this.state.sentenceIndex + " " + this.sentences.length);
        if (prevProps.interrupted !== this.props.interrupted && this.state.sentenceIndex+1 <= this.sentences.length){
            // console.log(this.state.sentenceIndex + " " + this.sentences.length);
            // alert(this.state.sentenceIndex);
            // console.log(prevProps.interrupted,this.props.interrupted);
            this.read();
        }
        
        // if (!this.props.interrupted && this.state.sentenceIndex < this.sentences.length) { //continue button clicked
        //     console.log("continue");
        //     this.read();
        // }
    }
    
    read() {

        // read a sentence, then pause
            
        this.setState({
            wordIndex: 0, isReading: true
        });
        // this.words = props.text.split(" ");
        // alert(this.sentences[this.state.sentenceIndex]);

        this.readerID = setInterval(
            () => this.readWords(this.state.sentenceIndex),
            70
        );
        
        //only update sentenceIndex after reading is finished
        
        //enable continue button
        
        
    }

    readWords(sentenceIndex) { //add word to text, display
        let words = this.sentences[sentenceIndex].trim().split(" ");
        // alert(words);
        if (this.state.wordIndex >= words.length) { //finished reading
            clearInterval(this.readerID);
            
            this.setState({
                sentenceIndex: this.state.sentenceIndex + 1
            });
            if (this.state.sentenceIndex < this.sentences.length){ //finished all clues, dont display continue
                this.setState({
                    isReading: false
                });
            }
            // send index of last sentence read to Dashboard
            this.props.updateSentencePosition(this.state.sentenceIndex);
        } else {
            this.setState({
                text: this.state.text + " " + words[this.state.wordIndex],
                wordIndex: this.state.wordIndex + 1
              });
        }

    }

    render() {
        if (!this.state.isReading) {
            var button = <ContinueButton onClick={this.read} style={{flex: 1}}/>
        }
        return (
            <div style={{ "max-width": "600px", "margin": "auto"}}>
                <p>{this.state.text}</p>
                {button}
            </div>
        );
    }
}

export default QuestionDisplay;
