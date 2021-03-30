import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import '../../../assets/styles/fonts.css';

const useStyles = makeStyles({
  marketplaceText: {
    fontFamily: 'Work Sans',
    fontSize: '12.5px',
    color: '#373737',
    marginTop: '5%',
    marginLeft: '5%',
  },
  pageText: {
    fontFamily: 'Work Sans',
    fontSize: '12.5px',
    fontWeight: 'bold',
    marginTop: '5%',
    marginLeft: '2%',
  },
});

export default function MarketplaceSidebar() {
  const classes = useStyles();

  return (
    <div>
      <Grid container direction="row">
        <Typography className={classes.marketplaceText}>
          Marketplace /
        </Typography>
        <Typography className={classes.pageText}>
          PageName
        </Typography>
      </Grid>
    </div>
  );
}