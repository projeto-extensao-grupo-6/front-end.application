import * as React from 'react';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import AccountCircle from '@mui/icons-material/AccountCircle';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

import './login.css'
import '../../shared/css/initial.css'

function Login() {
  return (
    <div className="content">
      <FormControl variant="standard">
        <InputLabel htmlFor="input-with-icon-adornment">
          Login
        </InputLabel>
        <Input
          id="input-with-icon-adornment"
          startAdornment={
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          }
        />
      </FormControl>
      <FormControl>
         <InputLabel htmlFor="input-lock">
          Senha
        </InputLabel>
        <Input
          id="input-lock"
          startAdornment={
            <InputAdornment position="start">
              <RemoveRedEyeIcon />
            </InputAdornment>
          }
        />
      </FormControl>
    </div>

  );
}

export default Login;