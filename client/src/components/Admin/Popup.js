import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Alert } from '@material-ui/lab';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

const Popup = (props) => {
  const [privateKey, setPrivateKey] = useState("");
  const [selectedUser, setSelectedUser] = useState(0)

  const handleChange = (e) => {
    setSelectedUser(e.target.value)
  } 

  return (
    <div>
      <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Verification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To be able to set the prices you need to have a verified account. To verify your account you need to enter your private key.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Private Key"
            defaultValue="Your Private Key"
            value={privateKey}
            onChange={(event) => setPrivateKey(event.target.value)}
            fullWidth
          />
          </DialogContent>
          <DialogContent>
          <InputLabel id="demo-simple-select-label">Name</InputLabel>
          <Select
              style={{ width: "30%" }}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedUser}
              onChange={handleChange}
            >
              <MenuItem value={1}>Fabian</MenuItem>
              <MenuItem value={2}>Michael</MenuItem>
              <MenuItem value={3}>Sandro</MenuItem>
              <MenuItem value={4}>Christian</MenuItem>
          </Select>
          { props.alert ? <Alert severity="error">Password is not allowed</Alert> : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {props.handleLogin(privateKey, selectedUser)}} color="primary">
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Popup;