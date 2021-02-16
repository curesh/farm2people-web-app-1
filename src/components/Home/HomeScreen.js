import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AddFarm from '../AddFarm';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    minHeight: '100vh',
  },
});

export default function HomeScreen() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <h1>Home Screen</h1>
      <AddFarm />
    </div>
  );
}
