import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

import Link from '@material-ui/core/Link';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
// import { ListItem } from '@material-ui/core';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';


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

export default function DocumentDetail(props) {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);

  const [label, setLabel] = React.useState('');

  const handleChange = (event) => {
    setLabel(event.target.value);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const body = (
    // className="content bordered" 
    // className={classes.paper}
    <div style={modalStyle} className={classes.paper}>
        <h2>Document Detail</h2> 
        <div style={{ 
            maxHeight: 400, 
            overflow: "scroll", 
            whiteSpace: "pre-wrap", 
            textAlign: "left", 
            padding: 20
          }}>
        {props.document['text']}
        </div>
        
        <List>
        <ListItem>ID: {props.document['doc_id']}</ListItem>

        <ListItem>manual label: {props.document['manual_label']}</ListItem>
        <ListItem>model prediction: {props.document['predicted_label']}</ListItem>
        <ListItem>uncertainty score: {props.document['uncertainty_score']}</ListItem>
      </List>

        {/* <h4>Select Label</h4> */}
        <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Select Label</InputLabel>
        <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={label}
            label="Label"
            onChange={handleChange}
        >   
            {props.labels.map((label, index) =>
                <MenuItem value={label}>{label}</MenuItem>

            )}

        </Select>
        </FormControl>
        <Button variant="contained" color="primary" className={classes.margin}
          onClick={() => {handleClose(); props.onLabel(props.document['doc_id'], label)}} >
                    Submit
        </Button>

        {/* <h4>New Label</h4> */}
    </div>
  );

  let color;
  if (props.document['manual_label'] === "") {
    color = "black";
  } else {
    color = "green";
  }

  return (
    <div>
      <Link onClick={handleOpen} 
        // color={props.colorMap[props.document['manual_label']]}
        style={{ color: color }}
        >
        {props.document['text'].slice(0,100).concat('...')}
        
      </Link>

      {/* pop up modal */}
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