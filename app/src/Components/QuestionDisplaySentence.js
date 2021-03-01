import React from 'react';
import useStyles from '../Styles';
import ContinueButton from './ContinueButton';

import {postRequest} from '../utils';


// question card: reads a question word by word. can be interrupted by buzzer
// option: pause after each sentence, until continue button is clicked

class QuestionDisplay extends React.Component {
    
    constructor(props) {
        super(props);
        // this.classes = useStyles();
        this.READ_DELAY_MS = 20;
        this.state = {
            wordIndex: 0, 
            sentenceIndex: 0, 
            words: [], 
            text: "", 
            isReading: false,
            sentences: [],
            readerID: 0,
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
            // reset the reader or else there will be two
            clearInterval(this.state.readerID);
            this.read();
        }
    }
    
    // read a sentence, then pause
    read() {
        this.setState({
            wordIndex: 0, isReading: true
        });

        let readerID = setInterval(
            () => this.readWords(this.state.sentenceIndex),
            this.READ_DELAY_MS
        );

        this.setState({
            readerID: readerID
        });

        postRequest(`/record_next_sentence?name=next_sentence&sentence_index=${this.state.sentenceIndex}`);
    }

    //add word to text, display
    readWords(sentenceIndex) {

        let words = this.state.words;

        //finished reading sentence
        if (this.state.wordIndex >= words.length) {
            clearInterval(this.state.readerID);
            
            this.setState({
                sentenceIndex: sentenceIndex + 1,
            });
            if (this.state.sentenceIndex < this.state.sentences.length){ //finished all clues, dont display continue
                this.setState({
                    isReading: false,
                    words: this.state.sentences[sentenceIndex + 1].trim().split(" "),
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
