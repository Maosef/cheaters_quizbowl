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
        <h2>Instructions</h2> 
        <p>
        Try to answer the (shortened) Quizbowl questions. You are encouraged to use the provided search engine to search Wikipedia articles. 
        Use the evidence tool (<code>Ctrl-e</code>) to save text that helped you answer. 
        Feel free to skip the question if it's too hard. 
        We recommend familiarizing yourself with the shorcuts. You can always consult this page from the "Help" button (top-right).
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
        
        Type <code>Enter</code> to submit your answer. You get one attempt per question.

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