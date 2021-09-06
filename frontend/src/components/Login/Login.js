import React, { Component } from 'react';

import {Redirect} from 'react-router-dom';

import './Login.css';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      logged: false,
      error: "",
      loginForm: {
        email: "",
        password: ""
      }
    };

    // To allow focusing on password input
    this.passwordInput = React.createRef();

    this.submitHandler = this.submitHandler.bind(this);
    this.formEntryUpdateHandler = this.formEntryUpdateHandler.bind(this);
  }

  componentWillMount() {
    if (localStorage.getItem('token')) {
      this.setState ( {
        logged: true
      } );
    } else {
      this.setState ( {
        logged: true
      } );
    }
  }

  clearPassword() {
    this.setState(state => (
      {
        ...state, 
        loginForm: {
          ...state.loginForm,
          password: ""
        }
      }
    ));
  }

  formEntryUpdateHandler(ev) {
    const name = ev.target.name;
    const value = ev.target.value;
    this.setState((state) => {
      return {...state, loginForm: {...state.loginForm, [name]: value}};
    });
  }

  async submitHandler(ev) {
    ev.preventDefault();

    const {email, password} = this.state.loginForm;

    if (password.length < 8) {
      this.clearPassword();
      this.passwordInput.current.focus();
      return;
    }

    try {
      const payload = JSON.stringify({ email: email, password: password });
      const resp = await fetch ('http://localhost:3000/api/v1/users/sign-in/', {
        headers: {
        'Content-Type': 'application/json'
        },
        method: 'POST',
        body: payload
      })

      if (resp.status === 200) {
        try {
          const data = await resp.json();
          console.log('data of login in :');
          console.log(data);
          localStorage.setItem('token', data.token);
          this.setState({
            logged: true,
            error: ""
          });
          this.props.history.push('/workshops/nearby');
        } catch(e) {
          console.log('problem in jsonifying login response');
        }
      } else {
        console.error('User with given credentials Not authorized by the server !');
        this.setState({
          error: "Wrong credentials"
        });
      }
    } catch(e) {
      console.error('Error in Login Fetch ...'); 
      this.setState({
        error: "There was an error logging in"
      });
    }

  }

  render() {
    return (

      <div className="Login">
        <h1>Login</h1>
        <form onSubmit={this.submitHandler}>
            <div className="field">
              <label htmlFor="email">E-mail: </label>
              <input type="email" name="email" required placeholder="valid e-mail" onChange={this.formEntryUpdateHandler} />
            </div>
            <div className="field">
              <label htmlFor="password">Password: </label>
              <input type="password" name="password" required placeholder="( at least 8 characters )" ref={this.passwordInput} onChange={this.formEntryUpdateHandler} />
            </div>
            <div className="field">
              <button type="submit">Sign-in</button>
            </div>
        </form>
        <div className={`error-msg ${this.state.error === "" ? 'hidden' : ''}`}>
          <p>{this.state.error}</p>
        </div>
      {localStorage.getItem('token') ? <Redirect from="/signin" to="/workshops/nearby" /> : null}
      </div>
    );
  }
}

export default Login;
