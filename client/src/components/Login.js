import React, {Component} from 'react'
import {login} from './UserFunctions'
import {Link, Redirect} from 'react-router-dom'

class Login extends Component {
    constructor(){
        super()
        this.state = {
            email: '',
            password: '',
            loggedIn: false,
            showError: false,
            showNullError: false,
            showConfirmError: false
        }
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    onChange(e){
        this.setState({[e.target.name]: e.target.value})
    }

    onSubmit(e){
        e.preventDefault()

        const user = {
            email: this.state.email,
            password: this.state.password

        }
        if (this.state.username === '' || this.state.password === '') {
            this.setState({
                showError: false,
                showNullError: true,
                loggedIn: false,
                showConfirmError: false
            });
          }
          else{
        login(user).then(response => {
            if(response.data === 'confirm your email')
            {
                this.setState({
                    showError: false,
                    showNullError: false,
                    loggedIn: false,
                    showConfirmError: true
                });
            }
            else{
            if (
                response.data === 'bad username' ||
                response.data === 'passwords do not match'
              ) {
                this.setState({
                  showError: true,
                  showNullError: false,
                  loggedIn: false,
                  showConfirmError: false
                });
              }
            else{
                    this.props.history.push(`/profile` , this.setState({
                        loggedIn: true,
                        showError: false,
                        showNullError: false,
                        showConfirmError: false
                      }));
                
            } 
        }
        })
    }
    }

    render() {
        const {
            email,
            password,
            showError,
            loggedIn,
            showNullError,
            showConfirmError
          } = this.state;
        if (!loggedIn) {
        return(
            <div className="container">
                <div className="row">
                    <div className="col-md-6 mt-5 mx-auto">
                        <form onSubmit={this.onSubmit}>
                            <h1 className="h3 mb-3 font-weight-normal">
                                Sign In
                            </h1>
                            {showNullError && (
                                <div>
                                <p>email or password cannot be null.</p>
                                </div>
                            )}
                            {showConfirmError && (
                                <div>
                                <p>Confirm Your Email.</p>
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                type="email"
                                className="form-control"
                                name="email"
                                value={email}
                                onChange={this.onChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                type="password"
                                className="form-control"
                                name="password"
                                value={password}
                                onChange={this.onChange}/>
                            </div>
                            <button type="submit" className="btn btn-lg btn-primary btn-block">
                                Sign In
                            </button>
                            {showError && (
                                <div>
                                <p>
                                    email or password isn't recognized. Please try again or
                                    register now.
                                </p>
                                <Link to="/register" className="nav-link">
                                Register
                                </Link>
                                </div>
                            )}
                            <Link to="/forgotpassword" className="nav-link">
                                Forgot Password
                            </Link>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
        else {
            return <Redirect to={`/profile`} />;
          }

    }
}

export default Login