// dummy Login page, takes username only

import * as React from "react";
import { Redirect } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import * as login_css from "./Login.css";

// import consentForm from './assets/consent_form.html';

interface Props {}

interface State {
  username: string;
  password: string;
  password_helper: string; 
  username_helper: string; 
  token: string;
}


export default class Login extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { username: "", password: "dummy", token: "", username_helper:"",password_helper:"" };
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }


  handleUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: event.target.value });
  }

  handlePassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ password: event.target.value });
  }

  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    let data =
      "username=" +
      encodeURIComponent(this.state.username) +
      "&password=" +
      encodeURIComponent(this.state.password);
    fetch("/token/register_easy", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: data,
    })
      .then((res) => res.json())
      .then((result) => {
        if ("access_token" in result) {
          let token = result["access_token"];
          window.sessionStorage.setItem("token", token);
          window.sessionStorage.setItem("username", this.state.username);
          this.setState({ username: this.state.username });
        } else {
          this.setState({ username: "", password: "", username_helper:"Username already used", password_helper:"" });
        }
      });
    event.preventDefault();
  }

  render() {
    if (window.sessionStorage.getItem("token")) {
      return <Redirect to="/" />;
    }

    // console.log("Login style "+login_css);

    return (
      <Container maxWidth="xs">
        <CssBaseline />
        <div className="paper">
          <Avatar className="avatar">
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h4">
            Cheater's Bowl
          </Typography>
          <form className="form" noValidate onSubmit={this.handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              value={this.state.username}
              onChange={this.handleUsername}
              helperText={this.state.username_helper}
              autoFocus
            />
            {/* <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={this.state.password}
              onChange={this.handlePassword}
              helperText={this.state.password_helper}
            /> */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="submit"
            >
              Login
            </Button>
            <Grid container className="signup">
              <Grid item xs></Grid>
              <Grid item>
                <a href="/register" className="register">
                  {/* {"Don't have an account? Sign Up"} */}
                </a>
              </Grid>
            </Grid>

            
            
          </form>
        </div>
      </Container>
    );
  }
}
