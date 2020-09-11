import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { store } from "./src/store";
import Root from './src/Root';

export default class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Provider store={store}>
        <Root />
      </Provider>
    )
  }
}