import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';


function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50
  const left = 50

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function SimpleModal() {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(true);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
        <h2>Welcome to Cheater's Bowl!</h2> 
        This is a trivia game with a focus on <b>how you answer.</b> You're given a search engine to Wikipedia, but a limited number of clues and time.

        <h2>Instructions (Please Read!)</h2> 
        <p>
        Try to answer the questions: each is a set of clues, starting with the first one revealed. <b>You get 10 points for answering each question correctly, and 5 points for every clue you don't reveal.</b> 
        <br/>
        You are encouraged to use the document searcher to search Wikipedia articles, and the keyword searcher.
        <br/>
        <br/>
        Select and record <b>evidence</b> using the evidence tool (pops up on highlight, or <code>Ctrl-e</code>). 
        We define evidence as "any sentences which helped you answer." <b>You must select as least one piece of evidence per question.</b>
        <br/>
        <br/>
        After you submit your answer (you get one attempt per question), we'll tell you the correct answer. You're given a chance to override our decision.
         Feel free to skip the question if it's too hard. 
        <br/>
        <br/>
        <b>We recommend familiarizing yourself with the keyboard shortcuts.</b> You can always consult this page from the "Help" button (top-right).
        </p>

        <h4>Keyboard shortcuts:</h4>
        <div style={{ textAlign: "left"}}>
            <ul>
            {/* <li>Buzz: <code>space</code></li> */}
            <li>Query (focus on search box or auto-search highlighted text): <code>Ctrl-s</code>.</li>
            <li>Keyword search: <code>Ctrl-f</code></li>
            <li>Record evidence: <code>Ctrl-e</code></li>     
            <li>Answer from highlight: <code>Ctrl-space</code></li>                              
            </ul>
        
        </div>
    </div>
  );

  return (
    <div>
      <Button onClick={handleOpen} color="inherit">Help</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        {body}
      </Modal>
    </div>
  );
}