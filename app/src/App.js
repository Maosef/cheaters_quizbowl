import * as React from "react";
import * as s from "./App.css";
import Dashboard from './Dashboard';
import Dashboard_incremental from './Views/Dashboard_incremental';
import Dashboard_static from './Views/Dashboard_static';



import Login from "./Login_dummy";
import Register from "./Components/Register";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
  console.log("App style "+s);
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
        <Route path="/incremental">
          <Dashboard_incremental />
        </Route>
        <Route path="/static">
          <Dashboard_static />
        </Route>
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;