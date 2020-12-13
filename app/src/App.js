import * as React from "react";
import * as s from "./App.css";
import Dashboard from './Dashboard';

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
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;