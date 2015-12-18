import React, {Component} from 'react';
import styles from './styles.css';
import image from './react-logo.svg';

export default class App extends Component {
  render() {

    return (
      <div className={styles.helloMessage}>
        Hello <img src={image} alt='React.js' /> World
      </div>
    );
  }
}
