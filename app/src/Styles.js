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
const useStyles = (theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height: 200,
        // width: 200,
        // padding: theme.spacing(2),
        textAlign: 'center',
        // color: theme.palette.text.secondary,
    },
    paperBig: {
        height: 300,
        width: 500,
        // padding: theme.spacing(2),
        textAlign: 'center',
        // color: theme.palette.text.secondary,
    },
});

export default useStyles;
