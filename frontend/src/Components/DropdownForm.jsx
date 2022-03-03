import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
// import { ListItem } from '@material-ui/core';



export default function DropdownForm(props) {
  // const classes = useStyles();
  const { classes } = props;
  const [label, setLabel] = React.useState('label');

  const handleChange = (event) => {
    setLabel(event.target.value);
  };


  return (

  //   <FormControl style={{width: 200, display: "flex"}}>
  //       <InputLabel id="demo-simple-select-label">Label</InputLabel>
  //       <Select
  //         labelId="demo-simple-select-label"
  //         id="demo-simple-select"
  //         value={label}
  //         label="Label"
  //         onChange={handleChange}
  //       >
  //         {props.labels.map((label, index) =>
  //               <MenuItem value={label}>{label}</MenuItem>
  //           )}
  //       </Select>

  //       <div style={{padding: 20}}>
  //     <Button variant="contained" color="primary" onClick={props.onSubmit}>
  //         Delete label
  //     </Button>
  // </div>
  //     </FormControl>

  <form onSubmit={props.onSubmit} 
  noValidate 
  autoComplete="off" 
  // style={{width: 1000}}
    style={{"display": "flex", "alignItems": "center"}}
    >
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
  
  <div style={{padding: 20}}>
      <Button variant="contained" color="primary" onClick={props.onSubmit}>
          Delete label
      </Button>
  </div>
  </form>
  );
}