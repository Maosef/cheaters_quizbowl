import React from 'react';
import useStyles from '../Styles';
import ContinueButton from '../ContinueButton';


// question card: reads a question word by word. can be interrupted by buzzer
// option: pause after each sentence, until continue button is clicked

class QuestionDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        // this.classes = useStyles();
        this.READ_DELAY_MS = 120;
        this.state = {
            wordIndex: 0, 
            sentenceIndex: 0, 
            words: [], 
            text: "", 
            isReading: false,
            sentences: []
        };

        this.read = this.read.bind(this);
        this.readWords = this.readWords.bind(this);
    }

    componentDidMount() {
        let sentences = this.props.tokenizations.map(span => this.props.text.slice(...span));
        this.setState({
            sentences: sentences,
            words: sentences[0].trim().split(" ")
        });
        this.read();
    }
    componentDidUpdate(prevProps) {
        // reset state if question changed
        if (prevProps.text !== this.props.text){
            console.log('question changed');
            let sentences = this.props.tokenizations.map(span => this.props.text.slice(...span));
            this.setState({
                wordIndex: 0, 
                sentenceIndex: 0, 
                text: "", 
                isReading: false,
                sentences: sentences,
                words: sentences[0].trim().split(" ")
            });

            // reset reader or else error
            this.read();
        }
        else if (prevProps.interrupted !== this.props.interrupted && this.state.sentenceIndex+1 <= this.state.sentences.length){
            this.read();
        }
    }
    
    // read a sentence, then pause
    read() {
        this.setState({
            wordIndex: 0, isReading: true
        });

        this.readerID = setInterval(
            () => this.readWords(this.state.sentenceIndex),
            this.READ_DELAY_MS
        );
    }

    //add word to text, display
    readWords(sentenceIndex) {
        let words = this.state.words;
        // alert(words);
        if (this.state.wordIndex >= words.length) { //finished reading
            clearInterval(this.readerID);
            
            this.setState({
                sentenceIndex: this.state.sentenceIndex + 1,
                words: this.state.sentences[sentenceIndex].trim().split(" ")
            });
            if (this.state.sentenceIndex < this.state.sentences.length){ //finished all clues, dont display continue
                this.setState({
                    isReading: false,
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
            <div style={{ "maxWidth": "600px", "margin": "auto"}}>
                <p>{this.state.text}</p>
                {button}

            </div>
        );
    }
}

export default QuestionDisplay;
