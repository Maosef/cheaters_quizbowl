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
import * as p from "../Login.css";

interface Props {}

interface State {
  username: string;
  password: string;
  verify_password: string;
  username_helper: string; 
  password_helper: string;
  token: string;
}

export default class Register extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { username: "", password: "", verify_password:"", username_helper: "", password_helper: "", token: "" , email: ""};
    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleVerifyPassword = this.handleVerifyPassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEmail = this.handleEmail.bind(this);
  }

  handleEmail(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ email: event.target.value });
  }

  handleUsername(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: event.target.value });
  }

  handlePassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ password: event.target.value });
  }
  
  handleVerifyPassword(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ verify_password: event.target.value });
  }

  valid_email = (mail: string) => 
  {
   if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
      return (true)
    }
    return (false)
  }

  
  handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    if(!this.valid_email(this.state.email)) {
      this.setState({username:"",password:"",verify_password:"",username_helper:"Not a valid email  ", password_helper:""});
    }
    
    else if(this.state.password === this.state.verify_password) {
      let data =
        "username=" +
        encodeURIComponent(this.state.email) +
        "&password=" +
        encodeURIComponent(this.state.password); 
        // "&email=" +
        // encodeURIComponent(this.state.email)
      fetch(`/token/register?email=${this.state.email}`, {
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
            window.sessionStorage.setItem("username", this.state.username);
            window.sessionStorage.setItem("token", token);
            this.setState({ username: this.state.username });
          } else {
            this.setState({ username: "", password: "",verify_password:"",username_helper:"Username or Email already used", password_helper: "" });
          }
        });
    }
    else {
      this.setState({username_helper: "", password_helper:"Passwords don't match", password:"",verify_password:""});
    }
    event.preventDefault();
  }

  render() {
    if (window.sessionStorage.getItem("token")) {
      return <Redirect to="/" />;
    }

    console.log("Register style "+p);
    
    return (
      <Container maxWidth="xs">
        <CssBaseline />
        <div className="paper">
          <Avatar className="avatar">
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h4">
            Register
          </Typography>
          <form className="form" noValidate onSubmit={this.handleSubmit}>
            <TextField 
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              value={this.state.email}
              onChange={this.handleEmail}
              // helperText={this.state.username_helper}
              autoFocus
            />
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
            <TextField
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
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="verify_password"
              label="Verify Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={this.state.verify_password}
              onChange={this.handleVerifyPassword}
            />
            

            <h1>Consent to Participate</h1>
            <div className="content bordered" 
              style={{ 
              maxHeight: 400, 
              overflow: "scroll", 
              whiteSpace: "pre-wrap", 
              textAlign: "left", 
              padding: 20,
              margin: 10,
              border: "solid grey",
              borderWidth: 2
            }}>
              <h2>Purpose of the Study</h2>
              This research is being conducted by Jordan Boyd-Graber at the University of Maryland, College Park. We are inviting you to participate in this research project because you are interested in trivia or quizbowl. The purpose of this research project is to better understand the differences between human and machine information seeking behavior.
              <h2>Procedures</h2>
              The procedures involve first signing up on the website with an email and password. You will then be given a walkthrough of the game and how to use the interface. The goal of the game is to get the highest score, where your score is based on answering trivia questions. You will have access to an internal search engine. We will record your interactions with the interface, including your search engine queries, button clicks, highlights, keyword searches, and answers. We estimate that you will spend between 40 to 60 minutes over the course of this study.
              <h2>Potential Risks and Discomforts</h2>
              There are no known risks to you beyond that of using a computer. You will be free to skip any question that you don’t want to answer.
              <h2>Potential Benefits</h2>
              There are no direct benefits from participating in this research. However, possible benefits include learning trivia. We hope that, in the future, other people might benefit from this study through improved understanding of human question answering strategies, which may lead to better algorithms.
              <h2>Confidentiality</h2>
              Any potential loss of confidentiality will be minimized by storing your data on a password-protected cloud storage system (UMD Box). The only personally identifiable information we will collect is your email and username. After the end of the experiment, your data will be anonymized and released publicly. Only researchers will have access to your data before it is anonymized.
If we write a report or article about this research project, your identity will be protected to the maximum extent possible. Your information may be shared with representatives of the University of Maryland, College Park or governmental authorities if you or someone else is in danger or if we are required to do so by law.
              <h2>Compensation</h2>
              You will receive a gift card for scoring in the top five (by answering the most questions correctly). The payouts for 1st,2nd,3rd place are: 50,25,10. There will also be 1-3 raffles for $20. You will be responsible for any taxes assessed on the compensation.
              If you will earn more than $100 as a research participant in this study, you must provide your name, address and SSN to receive compensation.
              If you do not earn more than $100 only your name and address will be collected to receive compensation.
              <h2>Right to Withdraw and Questions</h2>
              Your participation in this research is completely voluntary. You may choose not to take part at all. If you decide to participate in this research, you may stop participating at any time. If you decide not to participate in this study or if you stop participating at any time, you will not be penalized or lose any benefits to which you otherwise qualify. If you are an employee or student, your employment status or academic standing at UMD will not be positively or negatively affected by your participation or non-participation in this study.
              If you decide to stop taking part in the study, if you have questions, concerns, or complaints, or if you need to report an injury related to the research, please contact the investigator:
              Jordan Boyd-Graber
              Iribe 4146 University of Maryland
              jbg@umiacs.umd.edu
              (301) 405-6766
              <h2>Participant Rights</h2>
              If you have questions about your rights as a research participant or wish to report a research-related injury, please contact:
              University of Maryland College Park
              Institutional Review Board Office
              1204 Marie Mount Hall
              College Park, Maryland, 20742
              E-mail: irb@umd.edu
              Telephone: 301-405-0678
              For more information regarding participant rights, please visit:
              https://research.umd.edu/irb-research-participants
              This research has been reviewed according to the University of Maryland, College Park IRB procedures for research involving human subjects.
              <h2>Statement of Consent</h2>
              By clicking "Login", you indicate that you are at least 18 years of age; you have read this consent form or have had it read to you; your questions have been answered to your satisfaction and you voluntarily agree to participate in this research study. You will receive a copy of this consent form.
            </div>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="submit"
            >
              Agree and Sign Up
            </Button>
            <p>
            <a href="/login" >
                  {"Already have an account? Login "}
                </a>
            </p>
            
            {/* <Grid container className="signup">
              <Grid item xs></Grid>
              <Grid item>
                <a href="/login" className="register">
                  {"Already have an account? Login "}
                </a>
              </Grid>
            </Grid> */}
          </form>
        </div>
      </Container>
    );
  }
}
