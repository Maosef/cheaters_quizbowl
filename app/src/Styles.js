import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//     root: {
//         flexGrow: 1,
//     },
//     paper: {
//         height: 200,
//         padding: theme.spacing(2),
//         textAlign: 'center',
//         color: theme.palette.text.secondary,
//     },
// }));
// const useStyles = makeStyles((theme) => ({
const useStyles = ((theme) => ({
    
    root: {
        flexGrow: 1,
    },
    body: {
        flexGrow: 1,
        margin: 20,
        padding: 20,
        // "border-style": "solid"
    },
    menuButton: {
        marginRight: theme.spacing(2),
      },
    title: {
        flexGrow: 1,
    },
    paper: {
        margin: 10,
        padding: 20,
        // maxHeight: 300,
        // maxWidth: 300,
        padding: theme.spacing(2),
        textAlign: 'center',
        // color: theme.palette.text.secondary,
    },
    paperBig: {
        padding: 20,
        height: 300,
        // maxWidth: 600,
        padding: theme.spacing(2),
        textAlign: 'center',
        // color: theme.palette.text.secondary,
    },
}));

export default useStyles;
