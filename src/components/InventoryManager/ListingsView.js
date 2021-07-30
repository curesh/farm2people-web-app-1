import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import ListingManagerCard from './ListingManagerCard';

export default function ListingsView({
  cardListings, selectedCards, updateSelectedCards, editRecord,
}) {
  return (
    <>
      <Grid container spacing={2}>
        {
        cardListings.map((listing) => (
          <Grid item xs={3}>
            <ListingManagerCard
              id={listing.id}
              listing={listing.fields}
              onSelect={updateSelectedCards}
              selected={selectedCards[listing.id]}
              editRecord={editRecord}
            />
          </Grid>
        ))
        }
      </Grid>
    </>
  );
}

ListingsView.defaultProps = {
  cardListings: [],
  selectedCards: [],
};

ListingsView.propTypes = {
  cardListings: PropTypes.shape([]),
  selectedCards: PropTypes.shape([]),
  updateSelectedCards: PropTypes.func.isRequired,
  editRecord: PropTypes.func.isRequired,
};
