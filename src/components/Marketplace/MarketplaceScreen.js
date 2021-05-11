import React, { useEffect, useState } from 'react';
import Airtable from 'airtable';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import FarmCard from './FarmCard';
import ProduceCard from './ProduceCard';
import MarketplaceHeader from './Header/MarketplaceHeader';
import MarketplaceSidebar from './Sidebar/MarketplaceSidebar';
import '../../styles/fonts.css';

const useStyles = makeStyles({
  root: {
    position: 'relative',
    minHeight: '100vh',
  },
  sidebar: {
    marginLeft: '5px',
    width: '21%',
  },
});

// Airtable set-up
const airtableConfig = {
  apiKey: process.env.REACT_APP_AIRTABLE_USER_KEY,
  baseKey: process.env.REACT_APP_AIRTABLE_BASE_KEY,
};

const base = new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.baseKey);

export default function MarketplaceScreen() {
  const [farmListings, setFarmListings] = useState([]);
  const [produceListings, setProduceListings] = useState([]);
  const [tabValue, setTabValue] = useState('all'); // Either 'all' for produce or 'farm' for farms
  const [numResults, setNumResults] = useState(10); // # of results to display

  const classes = useStyles();
  function getFarmRecords() {
    base('Farms').select({ view: 'Grid view' }).all()
      .then((farmRecords) => {
        setFarmListings(farmRecords);
      });
  }
  // Get prod id, grouped unit type, price per grouped unit for each produce record
  function getProduceRecords() {
    // TODO: change Listing UPDATED back to Listings
    base('Listing UPDATED').select({ view: 'Grid view' }).all()
      .then((produceRecords) => {
        const filteredProduceRecords = [];
        produceRecords.forEach((record) => {
          const recordInfo = {
            listingID: record.fields['listing id'],
            produceID: record.fields.produce ? record.fields.produce[0] : -1,
            farmID: record.fields['farm id'],
            unitType: record.fields['grouped produce type'] || 'pallet',
            unitPrice: record.fields['standard price per grouped produce type'] || -1,
          };
          filteredProduceRecords.push(recordInfo);
        });
        setProduceListings(filteredProduceRecords);
      });
  }

  // Get records from Airtable whenever DOM mounts and updates/changes
  useEffect(() => {
    getFarmRecords();
    getProduceRecords();
  }, []);

  // Get total number of results depending on if produce or farm
  const totalResults = tabValue === 'all' ? produceListings.length : farmListings.length;

  return (
    <Grid container className={classes.root}>
      <Grid item className={classes.sidebar}>
        {/* Entire marketplace sidebar, contains toolbars for filter selection */}
        <MarketplaceSidebar />
      </Grid>
      <Grid item xs>
        {/* Entire marketplace header, contains tabs, view, and search */}
        <MarketplaceHeader
          tabValue={tabValue}
          setTabValue={setTabValue}
          totalResults={totalResults}
          numResults={numResults}
          setNumResults={setNumResults}
        />
        <Grid container direction="row" justify="flex-start">
          {/* Map each array of produceListing info to render a ProduceCard */
            tabValue === 'all' && produceListings.map((produce) => (
              <ProduceCard
                key={produce.listingID}
                /* ProduceCard will get produce name, photo, + farm name by ids */
                produceID={produce.produceID || null}
                farmID={produce.farmID || null}
                unitPrice={produce.unitPrice || -1}
                unitType={produce.unitType || 'pallet'}
              />
            ))
          }
        </Grid>
        {/* Map each array of farmListing info to render a FarmCard */
          tabValue === 'farm' && farmListings.map((farm) => (
            <FarmCard
              key={farm.id}
              farmName={farm.fields['farm name'] || 'No farm name'}
              address={farm.fields.address || 'No address'}
              zipCode={farm.fields['zip code'] || -1}
              description={farm.fields.description || 'No description'}
              operationTypeTags={farm.fields['operation type'] || []}
              farmingPracticeTags={farm.fields['farming practice type'] || []}
            />
          ))
        }
      </Grid>
    </Grid>
  );
}
