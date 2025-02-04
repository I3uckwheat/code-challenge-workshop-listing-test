import React, { Component } from 'react';

import {Redirect} from 'react-router-dom';

import './Register.css';

class Register extends Component {

  constructor(props) {
    super(props);
    this.state = {
      error: "",
      registerForm: {
        name: "",
        email: "",
        password: ""
      }
    };

    // To allow focusing on password input
    this.passwordInput = React.createRef();

    this.submitHandler = this.submitHandler.bind(this);
    this.formEntryUpdateHandler = this.formEntryUpdateHandler.bind(this);
    this.clearPassword = this.clearPassword.bind(this);
  }

  formEntryUpdateHandler(ev) {
    const name = ev.target.name;
    const value = ev.target.value;
    this.setState((state) => {
      return {...state, registerForm: {...state.registerForm, [name]: value}};
    });
  }

  clearPassword() {
    this.setState(state => (
      {
        ...state, 
        registerForm: {
          ...state.registerForm,
          password: ""
        }
      }
    ));
  }

  async submitHandler(ev) {
    ev.preventDefault();
    console.log('Submitting form ...');

    const {name, email, password} = this.state.registerForm;

    if (password.length < 8) {
      this.clearPassword();
      this.passwordInput.current.focus();
      return;
    }

    const payload = JSON.stringify({ name: name, email: email, password: password });
    try {
      const resp = await fetch ('http://localhost:3000/api/v1/users/sign-up/', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: payload
      });

      if (resp.status === 200) {
        try {
          const data = await resp.json();
          console.log('data of register in :');
          console.log(data);
          this.props.history.push('/signin');
        } catch(e) {
          console.log('problem in jsonifying register response')
        }
      } else {
        console.error('Not authorized !');
        this.setState({
          error: "Server could not register the user with the provided info"
        });
      }
    } catch(e) {
      console.error('Error fetching ...'); 
      this.setState({
        error: "There was an error signing up"
      })
    }
  }

  render() {
    return (
      <div className="Register">
        <h1>Register</h1>
        <form onSubmit={this.submitHandler}>
            <div className="field">
              <label htmlFor="name">Names: </label>
              <input type="text" name="name" required placeholder="name" onChange={this.formEntryUpdateHandler} />
            </div>
            <div className="field">
              <label htmlFor="email">E-mail: </label>
              <input type="email" name="email" required placeholder="valid e-mail" onChange={this.formEntryUpdateHandler} />
            </div>
            <div className="field">
              <label htmlFor="password">Password: </label>
              <input type="password" name="password" required placeholder="( at lease 8 characters )" ref={this.passwordInput} onChange={this.formEntryUpdateHandler} />
            </div>
            <div className="field">
              <button type="submit">Sign-up</button>
            </div>
        </form>
        <div className={`error-msg ${this.state.error === "" ? 'hidden' : ''}`}>
          <p>{this.state.error}</p>
        </div>
      {localStorage.getItem('token') ? <Redirect from="/signup" to="/workshops/nearby" /> : null}
      </div>

    );
  }
}

export default Register;
