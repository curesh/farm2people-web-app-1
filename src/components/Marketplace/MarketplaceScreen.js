/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import AddCartPopup from './Checkout/AddCartPopup';
import FarmCard from './FarmCard';
import ProduceCard from './ProduceCard';
import MarketplaceHeader from './Header/MarketplaceHeader';
import MarketplaceSidebar from './Sidebar/MarketplaceSidebar';
import MarketplaceBreadcrumbs from './MarketplaceBreadcrumbs';
import { base } from '../../lib/airtable/airtable';
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

const INITIAL_POPUP_PRODUCE = {
  crop: '',
  price: 0,
  farmName: '',
  palletsAvailable: 0,
  produceImg: '',
  listingID: '',
  farmID: '',
};

export default function MarketplaceScreen({
  match, allFarmListings, allProduceListings,
}) {
  const history = useHistory();
  const shopByFarmID = match.params.farmId; // id of the farm being shopped from if applicable
  const { searchTerms } = match.params; // search terms of any current terms
  const [farmListings, setFarmListings] = useState(allFarmListings);
  const [produceListings, setProduceListings] = useState(allProduceListings);
  const [filteredProduce, setFilteredProduce] = useState(allProduceListings);
  const [shopByFarmName, setShopByFarmName] = useState('');
  const [shopByFarmProduce, setShopByFarmProduce] = useState([]);
  // TODO: filtering methods + state for shopByFarmProduce
  const [searchBarInput, setSearchBarInput] = useState(''); // user entered search terms
  const [tabValue, setTabValue] = useState('all'); // Either 'all' for produce or 'farm' for farms
  const [numResults, setNumResults] = useState(10); // # of results to display
  const [popupProduce, setPopupProduce] = useState(INITIAL_POPUP_PRODUCE);
  const [open, setOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // SEARCH FUNCTIONS
  const search = () => {
    if (shopByFarmID !== undefined) {
      history.push(`/marketplace/shopByFarm/${shopByFarmID}/${searchBarInput}`);
    } else {
      history.push(`/marketplace/${searchBarInput}`);
    }
  };

  // helper fx to check any string for search term
  const checkFieldForSearchTerm = (field) => {
    const reg = new RegExp(searchTerms, 'i');
    return field && reg.test(field);
  };

  const filterFarmsBySearch = () => {
    const filtered = allFarmListings.filter((farm) => checkFieldForSearchTerm(farm.fields['farm name']) === true);
    setFarmListings(filtered);
  };

  // helper fx to async check produce name
  const searchProduceName = (produce) => {
    const { produceID } = produce;
    let containsTerm = false;

    if (produceID === undefined || produceID.length < 5) { return false; }

    return new Promise((resolve) => {
      base('Produce Type').find(produceID).then((produceObj) => {
        if (checkFieldForSearchTerm(produceObj.fields['produce type']) === true) { containsTerm = true; }
        return resolve(containsTerm);
      });
    });
  };

  // helper fx to async check produce farm name
  const searchProduceFarmName = (produce) => {
    const { farmID } = produce;
    let containsTerm = false;

    if (farmID === undefined || farmID[0].length < 5) { return false; }

    const farmArr = farmID.toString().split(',');
    return new Promise((resolve) => {
      base('Farms').find(farmArr[0]).then((farmObj) => {
        if (checkFieldForSearchTerm(farmObj.fields['farm name']) === true) { containsTerm = true; }
        return resolve(containsTerm);
      });
    });
  };

  // helper fx to check individual produce for name or farm name match to search term
  async function searchProduce(produce) {
    return await searchProduceName(produce) || searchProduceFarmName(produce);
  }

  // filter produce by name/farm match to user search terms
  async function filterProducebySearch(listings, setListings) {
    const data = Array.from(listings);
    Promise.all(data.map((produce) => searchProduce(produce)))
    // Use the result of the promises to filter the produceListings
      .then((result) => setListings(data.filter((element, index) => result[index])));
  }

  // run on submit of search bar (search icon or enter clicked)
  const filterBySearch = () => {
    filterProducebySearch(allProduceListings, setProduceListings);
    if (shopByFarmID === undefined) {
      filterFarmsBySearch();
    }
  };

  // fetch produce records for given farmID
  function shopByFarm(farmID) {
    // TODO: error check for no produce from farm + use some signal to show loading if needed
    setShopByFarmProduce([]);
    setShopByFarmName('');
    let tempProduce = [];

    base('Farms').find(farmID, (err, farm) => {
      if (err) { setErrorMessage(err.message); } else {
        setShopByFarmName(farm.fields['farm name']);
        if (farm.fields.listings) {
          farm.fields.listings.forEach((id) => {
            base('Listings').find(id, (e, record) => {
              if (e) { setErrorMessage(e.message); }
              const pricePerGroup = record.fields['standard price per grouped produce type'] || 0;
              const groupPerPallet = record.fields['grouped produce type per pallet'] || 0;
              const palletPrice = pricePerGroup * groupPerPallet;
              const recordInfo = {
                listingID: record.fields['listing id'],
                produceID: record.fields.produce ? record.fields.produce[0] : -1,
                farmID: record.fields['farm id'],
                palletPrice: palletPrice !== 0 ? palletPrice : -1,
                season: record.fields['growing season'] || 'No season',
              };
              if (searchTerms) {
                searchProduce(recordInfo).then((value) => {
                  if (value) {
                    tempProduce = tempProduce.concat(recordInfo);
                  }
                });
              } else {
                tempProduce = tempProduce.concat(recordInfo);
              }
              setShopByFarmProduce(tempProduce);
            });
          });
        }
      }
    });
  }

  // STATE SETUP
  // Get shopByFarm's records or run searches whenever DOM mounts/updates or search/farm changes
  useEffect(() => {
    setSearchBarInput('');
    if (shopByFarmID) {
      shopByFarm(shopByFarmID);
    }
    if (searchTerms) {
      filterBySearch();
    } else {
      setFarmListings(allFarmListings);
      setProduceListings(allProduceListings);
    }
  }, [shopByFarmID, searchTerms, allFarmListings, allProduceListings]);

  // Manages farm season filtering (fx, filter options, # of items per option)
  const [seasonFilters, setSeasonFilters] = useState([]);
  // Called by child comp when season filters changed, sets new filters or empty [] if none/reset
  const onSeasonFilterChange = (newFilters) => {
    setSeasonFilters(newFilters);
  };
  const farmSeasonFilters = ['Fall', 'Winter', 'Summer', 'Spring'];
  const [itemsPerFarmSeason, setSeasonItems] = useState([]);

  // Manages produce type filtering
  const [prodFilters, setProdFilters] = useState([]);
  // Called by child comp when season filters changed, sets new filters or empty [] if none/reset
  const onProduceFilterChange = (newFilters) => {
    setProdFilters(newFilters);
  };
  const produceTypeFilters = ['Vegetable', 'Fruit', 'Legume', 'Grain', 'Oat'];
  const [itemsPerProdType, setProdItems] = useState([]);

  // Manages pallet price filtering
  const [priceFilters, setPriceFilters] = useState([]);
  const [appliedRange, setAppliedRange] = useState([]); // [] if no applied min/max
  const onPriceFilterChange = (newFilters) => {
    // Parse the min + max #s from each range by splitting + filtering the string
    const newPriceRanges = [];
    newFilters.forEach((prices) => {
      let nums = prices.replace(/\D/g, '#'); // regex expr to replace non-digits w/ #
      nums = nums.split('#').filter((elem) => elem !== ''); // split into array, filter to only get nums
      if (prices.includes('APPLIED')) { // Apply new min/max range
        setAppliedRange(nums);
      } else if (prices.includes('UNAPPLY')) { // Unapply range
        setAppliedRange([]);
      } else { // Filter option
        newPriceRanges.push(nums);
      }
    });
    setPriceFilters(newPriceRanges);
  };
  const priceOptions = [0, 15, 30, 45, 60, 75];
  const [itemsPerPrice, setPriceItems] = useState([]);

  // Fx to get # of items per filter option to display in the filter menus
  function getNumItemsPerCategory() {
    // Get items per farming season
    const perSeason = [];
    farmSeasonFilters.forEach((season) => {
      const currentSeasonItems = produceListings.filter(
        (listing) => listing.season === season,
      );
      perSeason.push(currentSeasonItems.length);
    });
    setSeasonItems(perSeason);

    // Get items per produce type
    const perProdType = [];
    produceTypeFilters.forEach((prodType) => {
      const currentProdItems = produceListings.filter(
        (listing) => listing.produceType === prodType,
      );
      perProdType.push(currentProdItems.length);
    });
    setProdItems(perProdType);

    // Get items per price range (0-15, 15-30, 30-45, 45-60, 60-75)
    const perPrice = [0, 0, 0, 0, 0];
    produceListings.forEach((listing) => {
      const thisPrice = listing.palletPrice;
      if (thisPrice >= priceOptions[0] && thisPrice <= priceOptions[1]) {
        perPrice[0] += 1;
      }
      if (thisPrice >= priceOptions[1] && thisPrice <= priceOptions[2]) {
        perPrice[1] += 1;
      }
      if (thisPrice >= priceOptions[2] && thisPrice <= priceOptions[3]) {
        perPrice[2] += 1;
      }
      if (thisPrice >= priceOptions[3] && thisPrice <= priceOptions[4]) {
        perPrice[3] += 1;
      }
      if (thisPrice >= priceOptions[4] && thisPrice <= priceOptions[5]) {
        perPrice[4] += 1;
      }
    });
    setPriceItems(perPrice);
  }
  // TODO: sort by, item type

  // Go through the selected filter ranges + check if this price w/in any of them
  function inFilterPriceRange(num) {
    let output = false;
    priceFilters.forEach((range) => {
      const priceMin = parseInt(range[0], 10);
      const priceMax = parseInt(range[1], 10);
      if (num >= priceMin && num <= priceMax) {
        output = true;
      }
    });
    return output;
  }

  function inAppliedRange(num) {
    const priceMin = parseInt(appliedRange[0], 10);
    const priceMax = parseInt(appliedRange[1], 10);
    if (num >= priceMin && num <= priceMax) {
      return true;
    }
    return false;
  }

  // Limits rendered produced cards to only those matching the selected filters
  function filterProduce() {
    let filteredListings = produceListings;
    if (seasonFilters.length > 0) {
      filteredListings = filteredListings.filter(
        (listing) => seasonFilters.includes(listing.season),
      );
    }
    if (prodFilters.length > 0) {
      filteredListings = filteredListings.filter(
        (listing) => prodFilters.includes(listing.produceType),
      );
    }
    // If applied range exists, hard limit to min/max
    if (appliedRange.length > 0) {
      filteredListings = filteredListings.filter(
        (listing) => inAppliedRange(listing.palletPrice),
      );
    }
    if (priceFilters.length > 0) {
      filteredListings = filteredListings.filter(
        (listing) => inFilterPriceRange(listing.palletPrice),
      );
    }
    setFilteredProduce(filteredListings);
  }

  // Make sure # of produce items per category updates whenever produce listings change
  useEffect(() => {
    getNumItemsPerCategory();
  }, [produceListings]);

  // Make sure that filterProduce + isfilter bool updates whenever any of the filters change
  const [isFiltered, setIsFiltered] = useState(false); // True if any filter types are checked
  useEffect(() => {
    filterProduce();
    const newIsFiltered = !(seasonFilters.length === 0 && prodFilters.length === 0
      && priceFilters.length === 0 && appliedRange.length === 0);
    setIsFiltered(newIsFiltered);
  }, [seasonFilters, prodFilters, priceFilters, appliedRange]);

  const classes = useStyles();

  // Get total number of results depending on if (filtered/unfiltered) produce or farm
  // eslint-disable-next-line no-nested-ternary
  const totalResults = tabValue === 'all'
    ? (isFiltered ? filteredProduce.length : produceListings.length) : farmListings.length;

  const handleOpenCartPopup = () => {
    setOpen(true);
  };
  const handleCloseCartPopup = () => {
    setOpen(false);
  };

  return (
    <Grid container className={classes.root}>
      <AddCartPopup
        popupProduce={popupProduce}
        open={open}
        handleCloseCartPopup={handleCloseCartPopup}
      />
      <MarketplaceBreadcrumbs
        tabValue={tabValue}
        searchTerms={searchTerms}
        shopByFarmName={shopByFarmName}
        shopByFarmID={shopByFarmID}
      />
      <Grid container>
        <Grid item className={classes.sidebar}>
          {/* Entire marketplace sidebar, contains toolbars for filter selection */}
          <MarketplaceSidebar
            prodTypeFilters={produceTypeFilters}
            itemsPerProdType={itemsPerProdType}
            onProduceFilterChange={onProduceFilterChange}
            priceOptions={priceOptions}
            itemsPerPrice={itemsPerPrice}
            onPriceFilterChange={onPriceFilterChange}
            farmSeasonFilters={farmSeasonFilters}
            itemsPerFarmSeason={itemsPerFarmSeason}
            onSeasonFilterChange={onSeasonFilterChange}
          />
        </Grid>
        <Grid item xs>
          {/* Entire marketplace header, contains tabs, view, and search */}
          <MarketplaceHeader
            tabValue={tabValue}
            setTabValue={setTabValue}
            totalResults={totalResults}
            numResults={numResults}
            setNumResults={setNumResults}
            searchBarInput={searchBarInput}
            setSearchBarInput={setSearchBarInput}
            shopByFarmName={shopByFarmName}
            searchTerms={searchTerms}
            search={search}
          />
          <Grid container direction="row" justify="flex-start">
            {/* Map each array of produceListing info to render a ProduceCard */
            tabValue === 'all' && !isFiltered && produceListings.map((produce) => (
              <ProduceCard
                key={produce.listingID}
                listingID={produce.listingID}
                handleOpenCartPopup={handleOpenCartPopup}
                setPopupProduce={setPopupProduce}
                /* ProduceCard will get produce name, photo, + farm name by ids */
                produceID={produce.produceID || null}
                farmID={produce.farmID || null}
                palletPrice={produce.palletPrice}
                palletsAvailable={produce.palletsAvailable}
                season={produce.season}
                hasAgencyPrice={produce.hasAgencyPrice}
              />
            ))
          }
            {/* Map each array of produceListing info to render a ProduceCard */
            tabValue === 'all' && isFiltered && filteredProduce.map((produce) => (
              <ProduceCard
                key={produce.listingID}
                listingID={produce.listingID}
                handleOpenCartPopup={handleOpenCartPopup}
                setPopupProduce={setPopupProduce}
                /* ProduceCard will get produce name, photo, + farm name by ids */
                produceID={produce.produceID || null}
                farmID={produce.farmID || null}
                palletPrice={produce.palletPrice}
                palletsAvailable={produce.palletsAvailable}
                season={produce.season}
                hasAgencyPrice={produce.hasAgencyPrice}
              />
            ))
          }
          </Grid>
          {/* Map each array of farmListing info to render a FarmCard */
          tabValue === 'farm'
          && (
            shopByFarmID === undefined
              ? farmListings.map((farm) => (
                <FarmCard
                  key={farm.id}
                  farmID={farm.id}
                  farmName={farm.fields['farm name'] || 'No farm name'}
                  address={farm.fields.address || 'No address'}
                  zipCode={farm.fields['zip code'] || -1}
                  description={farm.fields.description || 'No description'}
                  operationTypeTags={farm.fields['operation type'] || []}
                  farmingPracticeTags={farm.fields['farming practice type'] || []}
                  shopByFarm={shopByFarm}
                />
              ))
              : (
                <Grid container direction="row" justify="flex-start">
                  {shopByFarmProduce.map((produce) => (
                    <ProduceCard
                      key={produce.listingID}
                      listingID={produce.listingID}
                      handleOpenCartPopup={handleOpenCartPopup}
                      setPopupProduce={setPopupProduce}
                      produceID={produce.produceID || null}
                      farmID={produce.farmID || null}
                      palletPrice={produce.palletPrice}
                      season={produce.season}
                    />
                  ))}
                </Grid>
              )
          )
        }
        </Grid>
        <p>{errorMessage}</p>
      </Grid>
    </Grid>
  );
}
