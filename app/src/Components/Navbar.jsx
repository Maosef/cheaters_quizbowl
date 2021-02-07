import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import { withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';

import SimpleModal from './Modal';

// import useStyles from './Styles';

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));

export default function Navbar(props) {
    const classes = useStyles();

    // function logout() {
    //     window.sessionStorage.clear("token")
    //     return <Redirect to="/login" />;
    // }

    let logout = (e) => {
        window.sessionStorage.clear("token");
        return <Redirect to="/login" />;
    }

    return (

        <div className={classes.root}>

            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        {props.text}
                    </Typography>

                    <SimpleModal />
                    <Button onClick={logout} color="inherit">Logout</Button>

                </Toolbar>
            </AppBar>
        </div>
    )
}