import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Box, Button,
} from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Fruit1 from '../../../assets/images/Fruit1.svg';
import Fruit2 from '../../../assets/images/Fruit2.svg';
import Fruit3 from '../../../assets/images/Fruit3.svg';

const useStyles = makeStyles({
  centerHeading: {
    fontFamily: 'Work Sans',
    fontSize: '24px',
    fontWeight: '700',
    color: '#373737',
    textAlign: 'center',
  },
  successSubtitle: {
    fontFamily: 'Work Sans',
    fontSize: '20px',
    fontWeight: '400',
    color: '#373737',
    textAlign: 'center',
  },
  box: {
    textAlign: 'center',
  },
  form: {
    width: '400px',
    fontFamily: 'Work Sans',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
  },
  formControl: {
    margin: '10px',
  },
  inputLabel: {
    fontFamily: 'Work Sans',
    fontWeight: '600',
    color: '#373737',
    '&:after': {
      content: '" *"',
      color: '#f00',
    },
  },
  placeholder: {
    fontFamily: 'Work Sans',
  },
  changePasswordButton: {
    fontFamily: 'Work Sans',
  },
  cancelButton: {
    fontFamily: 'Work Sans',
    textTransform: 'none',
    fontWeight: '600',
  },
  closeIcon: {
    color: '#373737',
  },
  centerAlignDialogActions: {
    justifyContent: 'center',
  },
  fruit1: {
    width: '80px',
    height: 'auto',
    margin: '10px',
  },
  doneButton: {
    color: '#fff',
    backgroundColor: '#53AA48',
    width: '200px',
    '&:hover': {
      backgroundColor: '#3D7736',
    },
  },
});

export default function SuccessChangeScreen({ handleClose }) {
  const classes = useStyles();

  return (
    <Box p={3}>
      <DialogTitle>
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={handleClose}>
            <CloseIcon className={classes.closeIcon} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box className={classes.box}>
          <img
            src={Fruit1}
            alt="fruit1"
            className={classes.fruit1}
          />
          <img
            src={Fruit2}
            alt="fruit2"
            className={classes.fruit1}
          />
          <img
            src={Fruit3}
            alt="fruit3"
            className={classes.fruit1}
          />
        </Box>
        <Box p={6} pt={2} pb={6} justifyContent="center">
          <Typography className={classes.centerHeading}>
            Password Successfully Changed!
          </Typography>
          <Typography className={classes.successSubtitle} style={{ marginTop: '10px' }}>
            You can now use your new password to login to your account.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions classes={{ root: classes.centerAlignDialogActions }}>
        <Button variant="contained" className={classes.doneButton} size="large" onClick={handleClose}>
          <Typography className={classes.changePasswordButton}>
            DONE
          </Typography>
        </Button>
      </DialogActions>
    </Box>
  );
}

SuccessChangeScreen.propTypes = {
  handleClose: PropTypes.func.isRequired,
};
