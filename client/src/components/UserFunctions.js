
import axios from 'axios'

export const register = newUser => {
    return axios
    .post('users/register', {
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        password: newUser.password,
        confirmed: newUser.confirmed,
    })
    .then(res => {
        console.log('Registered!')
    })
}

export const login = user => {
    return axios
    .post('users/login', {
        email: user.email,
        password: user.password
    })
    .then(res => {
        if(res.data === 'Please confirm your email to login')
        {
           return res.json('confirm your email');
        }
        else{
        if (
            res.data === 'bad username' ||
            res.data === 'passwords do not match'
          )
          {
            return res.json('passwords do not match');
          }
          else{
            localStorage.setItem('usertoken', res.data)
            return res.data
          }
        }
        
    })
    .catch(err => {
        console.log(err)
    })
}