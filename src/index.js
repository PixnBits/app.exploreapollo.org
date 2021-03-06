import "./scss/main.scss";
import React from "react";
import ReactDom from "react-dom";
// import { render } from "react-dom";
import { Provider } from "react-redux";
import { ReduxRouter } from "redux-router";
import configureStore from "./store/configureStore";

if (location.href.indexOf("#") != -1) {
  history.replaceState({} , "", `${location.hash.substring(1)}`);
}

const store = configureStore();

ReactDom.render((
  <Provider store={store}>
    <ReduxRouter />
  </Provider>
), document.getElementById("houston"));
