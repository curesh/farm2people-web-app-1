import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { ThemeProvider } from '@material-ui/styles';
import { makeStyles, createMuiTheme } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import {
  Button,
  Typography,
  Grid,
  TextField,
  Container,
  Input,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';

import { base } from '../../lib/airtable/airtable';
import { history, store } from '../../lib/redux/store';
import Fruit4 from '../../assets/images/Fruit4.svg';
import Fruit1 from '../../assets/images/Fruit1.svg';

const theme = createMuiTheme({
  spacing: 4,
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 500,
    },
  },
};

const MARKETS = [
  'SM',
  'SM/SF',
  'NO MRKT',
  'WH/SALE',
  'Salinas',
  'Fresno',
  'Madera',
  'Kern',
  'Kings',
  'Kern County',
  'Fresno/Tulare',
  'Bakersfield',
  'Hollywood',
  'Other',
];

const PRACTICES = [
  'Organic Certified',
  'Organic Non-Certified',
  'Biodynamic',
  'Regenerative Farming Practices',
  'Dry-Farmed',
  'No-Till',
  'Mono-Culture',
  'Other',
];

const OPDEMOGRAPHICS = [
  'Black Owned',
  'BIPOC Owned',
  'Women Owned',
  'Non-Binary/LGBTQIA Owned',
  'First Generation Owned',
  'Latinx Owned',
  'Other',
];

const PICKUP = [
  'Roll Up',
  'Warehouse',
  'Loading Dock',
  'Pallet Jack',
  'Lift Gate',
  'Other',
];

const FARMSIZE = [
  'Small',
  'Mid-size',
  'Large',
  'Large AG',
  'Other',
];

const INITIAL_FORM_STATE = {
  contactName: '',
  legalName: '',
  farmName: '',
  hideFarm: false,
  email: '',
  phone: '',
  county: '',
  website: '',
  addOne: '',
  addTwo: '',
  hideAddress: false,
  additionalContact: '',
  market: [],
  additionalComments: '',
  zipcode: '',
  userID: '',
  farmSize: '',
  farmPractices: [],
  hidePractices: false,
  opDemographic: [],
  farmDesc: '',
  pickup: [],
  paca: false,
  delivery: false,
  coldChain: false,
  startTime: '',
  endTime: '',
};

const useStyles = makeStyles({
  form: {
    width: '100%',
  },
  titleText: {
    fontFamily: 'Work Sans',
    fontWeight: 'bold',
    fontSize: '35px',
    color: '#53AA48',
  },
  underlinedSubtitleText: {
    fontFamily: 'Work Sans',
    textDecoration: 'underline',
    textDecorationColor: '#53AA48',
    fontWeight: 'bold',
    marginBottom: '5%',
    marginTop: '5%',
  },
  subtitleText: {
    fontFamily: 'Work Sans',
    textAlign: 'left',
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '7%',
  },
  regSubtitleText: {
    fontFamily: 'Work Sans',
    textAlign: 'left',
    marginBottom: '7%',
  },
  cenSubtitleText: {
    fontFamily: 'Work Sans',
    textAlign: 'center',
    fontSize: '30px',
    fontWeight: 'bold',
    marginBottom: '7%',
  },
  cenRegSubtitleText: {
    fontFamily: 'Work Sans',
    textAlign: 'center',
    paddingLeft: '10%',
    fontSize: '30px',
    marginBottom: '2%',
  },
  labelText: {
    fontFamily: 'Work Sans',
    fontWeight: 'bold',
    paddingBottom: '3%',
  },
  valueText: {
    fontFamily: 'Work Sans',
    paddingLeft: '10%',
  },
  plainText: {
    fontFamily: 'Work Sans',
  },
  blackButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#53AA48',
    border: '#53AA48',
    color: '#53AA48',
    '&:hover': {
      backgroundColor: '#FFFFFF',
    },
    marginTop: '10%',
  },
  greenButton: {
    backgroundColor: '#53AA48',
    '&:hover': {
      backgroundColor: '#53AA48',
    },
    marginTop: '10%',
  },
  greenButtonSmall: {
    backgroundColor: '#53AA48',
    '&:hover': {
      backgroundColor: '#53AA48',
    },
    marginTop: '10%',
    width: '50%',
  },
  submitButton: {
    backgroundColor: '#53AA48',
    '&:hover': {
      backgroundColor: '#53AA48',
    },
  },
  stepper: {
    margin: 'auto',
    width: '60%',
  },
  smallButton: {
    color: 'white',
    background: '#53AA48',
    borderRadius: '6px',
  },
  formControl: {
    margin: 1,
    width: 550,
  },
  registrationFruit4: {
    position: 'absolute',
    right: '-10px',
    top: '160px',
    transform: 'matrix(0.7, 0.47, -0.42, 0.7, 0, 0)',
  },
  registrationFruit1: {
    position: 'absolute',
    right: '100px',
    top: '80px',
    transform: 'scale(0.8)',
  },
  confirmationFruit4: {
    position: 'absolute',
    right: '150px',
    top: '40px',
    transform: 'scale(0.6)',
  },
  confirmationFruit1: {
    position: 'absolute',
    right: '250px',
    top: '40px',
    transform: 'scale(0.8)',
  },
  picContainer: {
    position: 'relative',
  },
  emptyGrid: {
    height: '200px',
    position: 'relative',
  },
});

function getSteps() {
  return ['Step 1', 'Step 2', 'Step 3', 'Confirmation'];
}

export default function RegistrationScreen() {
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const classes = useStyles();

  useEffect(() => {
    base('Users').find(store.getState().userData.user.fields['user id']).then((record) => {
      setFormState(
        {
          ...formState,
          legalName: record.fields.organization,
          zipcode: record.fields.zipcode,
          contactName: record.fields['contact name'],
          phone: record.fields.phone,
          email: record.fields.username,
          userID: record.fields['user id'],
        },
      );
    });
  }, []);

  const handleChange = useCallback((event) => {
    setFormState(
      {
        ...formState,
        [event.currentTarget.name]: event.currentTarget.value,
      },
    );
  }, [formState, setFormState]);

  const handleSelect = useCallback((event) => {
    event.preventDefault();
    setFormState(
      {
        ...formState,
        [event.target.name]: event.target.value,
      },
    );
  }, [formState, setFormState]);

  const handleBool = useCallback((event) => {
    setFormState(
      {
        ...formState,
        [event.target.name]: !((event.target.value === 'true')),
      },
    );
  }, [formState, setFormState]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      base('Farms').create([
        {
          fields: {
            'legal name': formState.legalName,
            'farm name': formState.farmName,
            'farm name privatized': formState.hideFarm,
            'user id': [formState.userID],
            'contact name': formState.contactName,
            description: formState.farmDesc,
            email: formState.email,
            county: formState.county,
            'call during': `${formState.startTime}-${formState.endTime}`,
            website: formState.website,
            phone: formState.phone,
            'address line 1': formState.addOne,
            'address line 2': formState.addTwo,
            'address privatized': formState.hideAddress,
            'additional contact information': formState.additionalContact,
            zipcode: Number(formState.zipcode),
            market: formState.market,
            'farm size': formState.farmSize,
            'pick up options': formState.pickup,
            'PACA (Perishable Agricultural Commodities Act)': formState.paca,
            'paca privatized': formState.hidePaca,
            'operation type': formState.opDemographic,
            'farming practice type': formState.farmPractices,
            'farm practices privatized': formState.hidePractices,
            'able to deliver': formState.delivery,
            'cold chain capabilities': formState.coldChain,
            'additional comments': formState.additionalComments,
            approved: false,
          },
        },
      ], (err) => {
        setErrorMsg(err);
      });
    } catch (err) {
      if (err) {
        setErrorMsg(err);
      }
    }

    if (errorMsg) {
      setErrorMsg('Please choose a different email!');
      setLoading(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [formState, currentStep]);

  const routeChange = () => {
    const path = '/';
    history.push(path);
  };

  const onNext = useCallback(() => {
    if (currentStep >= 5) {
      setCurrentStep(5);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, formState]);

  const onPrev = useCallback(() => {
    if (currentStep <= 1) {
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const onSelectStep = useCallback((step) => {
    if (step >= 1 && step <= 3) {
      setCurrentStep(step);
    }
  }, [currentStep]);

  const step1EmptyInputCheck = useMemo(() => (
    formState.county === '' || (formState.hideFarm && formState.farmName === '')
  ),
  [formState]);

  const step2EmptyInputCheck = useMemo(() => (
    formState.addOne === ''
  ),
  [formState]);

  const step3EmptyInputCheck = useMemo(() => (
    formState.farmSize === '' || formState.market.length === 0 || formState.farmPractices.length === 0
    || formState.opDemographic.length === 0 || formState.farmDesc === '' || formState.pickup.length === 0
  ),
  [formState]);

  const steps = getSteps();
  return [
    <Box my={5}>
      <Container component="main" maxWidth="md">
        {(currentStep < 5) && (
        <div className={classes.picContainer}>
          <img src={Fruit4} className={classes.registrationFruit4} aria-hidden alt="" />
          <img src={Fruit1} className={classes.registrationFruit1} aria-hidden alt="" />

        </div>
        )}
        <div>
          <ThemeProvider theme={theme}>
            <Typography className={classes.titleText} align="center">
              Producer Registration Form
            </Typography>
          </ThemeProvider>
          <Stepper activeStep={currentStep - 1} alternativeLabel className={classes.stepper}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          <form
            className={classes.form}
          >
            <Grid
              container
              align="center"
              alignItems="center"
              justify="center"
            >
              <Container maxWidth="sm">
                <Grid item xs={12}>
                  <Step1
                    currentStep={currentStep}
                    formState={formState}
                    classes={classes}
                    handleChange={handleChange}
                    onPrev={onPrev}
                    onNext={onNext}
                    errorMsg={errorMsg}
                    handleSelect={handleSelect}
                    handleBool={handleBool}
                    step1EmptyInputCheck={step1EmptyInputCheck}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Step2
                    currentStep={currentStep}
                    formState={formState}
                    classes={classes}
                    handleChange={handleChange}
                    onPrev={onPrev}
                    onNext={onNext}
                    errorMsg={errorMsg}
                    handleBool={handleBool}
                    step2EmptyInputCheck={step2EmptyInputCheck}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Step3
                    currentStep={currentStep}
                    formState={formState}
                    classes={classes}
                    handleChange={handleChange}
                    handleSelect={handleSelect}
                    onPrev={onPrev}
                    onNext={onNext}
                    errorMsg={errorMsg}
                    step3EmptyInputCheck={step3EmptyInputCheck}
                    handleBool={handleBool}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Step4
                    currentStep={currentStep}
                    formState={formState}
                    classes={classes}
                    handleChange={handleChange}
                    onPrev={onPrev}
                    onNext={onNext}
                    onSelectStep={onSelectStep}
                    handleSubmit={handleSubmit}
                    errorMsg={errorMsg}
                    loading={loading}
                    setFormState={setFormState}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Step5
                    currentStep={currentStep}
                    routeChange={routeChange}
                    classes={classes}
                  />
                </Grid>
              </Container>
            </Grid>
          </form>
        </div>
      </Container>
    </Box>,
  ];
}

function Step1({
  currentStep, formState, classes, handleChange, onNext, errorMsg, handleBool, step1EmptyInputCheck,
}) {
  if (currentStep !== 1) {
    return null;
  }
  return [
    <div className={classes.subtitleText}>
      Basic Contact Information
    </div>,
    <Grid
      container
      spacing={2}
      alignItems="center"
    >
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="legalname"
          label="Legal Farm Name"
          name="legalName"
          disabled
          variant="filled"
          value={formState.legalName}
        >
          {formState.farmName}
        </TextField>
      </Grid>
      <Grid container item xs={12} justify="flex-start">
        <FormControlLabel
          control={<Checkbox icon={<VisibilityIcon />} checkedIcon={<VisibilityOffIcon />} name="hideFarm" value={formState.hideFarm} onChange={handleBool} />}
          label="Hide farm name on marketplace"
        />
      </Grid>
      {formState.hideFarm
        && (
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            fullWidth
            id="farmname"
            label="Display Name"
            placeholder="Marketplace display name (if legal farm name is hidden)"
            name="farmName"
            value={formState.farmName}
            onChange={handleChange}
          >
            {formState.farmName}
          </TextField>
        </Grid>
        )}

      <Grid item xs={12}>
        <TextField
          fullWidth
          name="zipcode"
          label="Location"
          id="location"
          value={formState.zipcode}
          variant="filled"
          disabled
        >
          {formState.zipcode}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="fullname"
          label="Contact Name"
          name="contactName"
          value={formState.contactName}
          variant="filled"
          disabled
        >
          {formState.contactName}
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="phone"
          label="Phone"
          name="phone"
          value={formState.phone}
          onChange={handleChange}
          variant="filled"
          disabled
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="email"
          label="Email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          variant="filled"
          disabled
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          required
          fullWidth
          id="county"
          name="county"
          placeholder="County"
          label="County"
          value={formState.county}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={2}>
        <InputLabel id="time-label">Call During</InputLabel>
      </Grid>
      <Grid item xs={4}>
        <TextField
          id="time"
          labelId="time-label"
          name="startTime"
          onChange={handleChange}
          type="time"
          defaultValue="00:00"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300,
          }}
          value={formState.startTime}
        />
      </Grid>
      <Grid item xs={1}>
        ~
      </Grid>
      <Grid item xs={4}>
        <TextField
          id="time"
          name="endTime"
          onChange={handleChange}
          type="time"
          defaultValue="12:00"
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300,
          }}
          value={formState.endTime}
        />
      </Grid>
      {errorMsg && <Grid item xs={12} className="error-msg">{errorMsg}</Grid>}

      <Grid item xs={12}>
        <Button
          className={classes.greenButtonSmall}
          type="button"
          onClick={onNext}
          color="primary"
          variant="contained"
          disabled={step1EmptyInputCheck}
          center
        >
          Next
        </Button>
      </Grid>
    </Grid>,
  ];
}

function Step2({
  currentStep, formState, classes, handleChange, onPrev, errorMsg,
  onNext, handleBool, step2EmptyInputCheck,
}) {
  if (currentStep !== 2) {
    return null;
  }
  return [
    <div className={classes.subtitleText}>
      Contact Information
    </div>,
    <Grid
      container
      spacing={2}
      alignItems="center"
    >
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          id="website"
          name="website"
          placeholder="Website"
          label="Website"
          value={formState.website}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          required
          fullWidth
          id="add1"
          name="addOne"
          placeholder="Address Line 1"
          label="Address Line 1"
          value={formState.addOne}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          id="add2"
          name="addTwo"
          placeholder="Address Line 2"
          label="Address Line 2"
          value={formState.addTwo}
          onChange={handleChange}
        />
      </Grid>
      <Grid container item xs={12} justify="flex-start">
        <FormControlLabel
          control={<Checkbox icon={<VisibilityIcon />} checkedIcon={<VisibilityOffIcon />} name="hideAddress" value={formState.hideAddress} onChange={handleBool} />}
          label="Hide address on marketplace"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          id="additionalContact"
          name="additionalContact"
          placeholder="Additional Contact Information"
          label="Additional Contact Information"
          value={formState.additionalContact}
          onChange={handleChange}
        />
      </Grid>
      {errorMsg && <Grid item xs={12} className="error-msg">{errorMsg}</Grid>}
      <Grid item xs={12} sm={6}>
        <Button
          type="button"
          onClick={onPrev}
          fullWidth
          color="primary"
          variant="contained"
          className={classes.blackButton}
        >
          Back
        </Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button
          className={classes.greenButton}
          type="button"
          onClick={onNext}
          fullWidth
          color="primary"
          variant="contained"
          disabled={step2EmptyInputCheck}
        >
          Next
        </Button>
      </Grid>
    </Grid>,
  ];
}

function Step3({
  currentStep, formState, classes, handleChange, onPrev, errorMsg,
  step3EmptyInputCheck, onNext, handleSelect, handleBool,
}) {
  if (currentStep !== 3) {
    return null;
  }
  return [
    <div className={classes.subtitleText}>
      Contact Information
    </div>,
    <Grid
      container
      spacing={2}
      alignItems="center"
    >
      <Grid item xs={12}>
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel id="mutiple-name-label" required>Market</InputLabel>
          <Select
            id="demo-mutiple-name"
            multiple
            value={formState.market}
            onChange={handleSelect}
            input={<Input />}
            MenuProps={MenuProps}
            name="market"
            label="Population Served"
          >
            {MARKETS.map((market) => (
              <MenuItem
                key={market}
                value={market}
              >
                {market}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl className={classes.formControl}>
          <InputLabel id="single-name-label" required>Farm Size</InputLabel>
          <Select
            labelId="simple-select-label"
            id="demo-single-name"
            value={formState.farmSize}
            onChange={handleSelect}
            name="farmSize"
            label="Farm Size"
            fullWidth
          >
            {FARMSIZE.map((size) => (
              <MenuItem
                key={size}
                value={size}
              >
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel id="mutiple-name-label" required>Farming Practices</InputLabel>
          <Select
            id="demo-mutiple-name"
            multiple
            value={formState.farmPractices}
            onChange={handleSelect}
            input={<Input />}
            MenuProps={MenuProps}
            name="farmPractices"
            label="Population Served"
          >
            {PRACTICES.map((p) => (
              <MenuItem
                key={p}
                value={p}
              >
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid container item xs={12} justify="flex-start">
        <FormControlLabel
          control={<Checkbox icon={<VisibilityIcon />} checkedIcon={<VisibilityOffIcon />} name="hidePractices" value={formState.hidePractices} onChange={handleBool} />}
          label="Hide farming practices on marketplace"
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel id="mutiple-name-label">Ownership and Operation</InputLabel>
          <Select
            id="demo-mutiple-name"
            multiple
            value={formState.opDemographic}
            onChange={handleSelect}
            input={<Input />}
            MenuProps={MenuProps}
            name="opDemographic"
            required
            label="Ownership and Operation"
          >
            {OPDEMOGRAPHICS.map((o) => (
              <MenuItem
                key={o}
                value={o}
              >
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          required
          fullWidth
          id="farmDesc"
          name="farmDesc"
          placeholder="300 Characters Max"
          label="Farm Description"
          value={formState.farmDesc}
          onChange={handleChange}
          multiline
          rows={4}
          rowsMax={4}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl className={classes.formControl} variant="outlined">
          <InputLabel id="mutiple-name-label" required>Pick-Up Options</InputLabel>
          <Select
            id="demo-mutiple-name"
            multiple
            value={formState.pickup}
            onChange={handleSelect}
            input={<Input />}
            MenuProps={MenuProps}
            name="pickup"
            label="Pick-Up Options"
          >
            {PICKUP.map((p) => (
              <MenuItem
                key={p}
                value={p}
              >
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox name="paca" value={formState.paca} onChange={handleBool} />}
            label="PACA"
          />
        </FormGroup>
      </Grid>
      <Grid container item xs={6} justify="flex-start">
        <FormControlLabel
          control={<Checkbox icon={<VisibilityIcon />} checkedIcon={<VisibilityOffIcon />} name="hidePaca" value={formState.hidePaca} onChange={handleBool} />}
          label="Hide on marketplace"
        />
      </Grid>
      <Grid item xs={12}>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox name="delivery" value={formState.delivery} onChange={handleBool} />}
            label="Able to Deliver Products"
          />
          <FormControlLabel
            control={<Checkbox name="coldChain" value={formState.coldChain} onChange={handleBool} />}
            label="Cold Chain Capabilities"
          />
        </FormGroup>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          required
          fullWidth
          id="additionalComments"
          name="additionalComments"
          placeholder="Additional Comments"
          value={formState.additionalComments}
          onChange={handleChange}
          rows={3}
          multiline
        />
      </Grid>
      {errorMsg && <Grid item xs={12} className="error-msg">{errorMsg}</Grid>}

      <Grid item xs={12} sm={6}>
        <Button
          type="button"
          onClick={onPrev}
          fullWidth
          color="primary"
          variant="contained"
          className={classes.blackButton}
        >
          Back
        </Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button
          className={classes.greenButton}
          type="button"
          onClick={onNext}
          fullWidth
          color="primary"
          variant="contained"
          disabled={step3EmptyInputCheck}
        >
          Next
        </Button>
      </Grid>
    </Grid>,
  ];
}

function Step4({
  currentStep, formState, classes, onPrev, handleSubmit,
  onSelectStep, setFormState,
}) {
  const fields = [
    {
      heading: 'Basic Contact Information',
      page: 1,
      body: [
        { name: 'Farm Name', value: formState.farmName },
        { name: 'Farm Location', value: formState.zipcode },
        { name: 'Contact Name', value: formState.contactName },
        { name: 'Phone', value: formState.phone },
        { name: 'Email', value: formState.email },
        { name: 'County', value: formState.county },
        { name: 'Call During', value: `${formState.startTime}~${formState.endTime}` },
      ],
    },
    {
      heading: 'Additional Contact Information',
      page: 2,
      body: [
        { name: 'Website', value: formState.website },
        { name: 'Address Line 1', value: formState.addOne },
        { name: 'Address Line 2', value: formState.addTwo },
        { name: 'Additional Contact', value: formState.additionalContact },
      ],
    },
    {
      heading: 'Additional Contact Information',
      page: 3,
      body: [
        { name: 'Market', value: formState.market.join() },
        { name: 'Farm Size', value: formState.farmSize },
        { name: 'Farming Practice', value: formState.farmPractices.join() },
        { name: 'Ownership & Operation', value: formState.opDemographic.join() },
        { name: 'Farm Description', value: formState.farmDesc },
        { name: 'Pickup Options', value: formState.pickup.join() },
        { name: 'PACA', value: (formState.paca ? 'Yes' : 'No') },
        { name: 'Able to Deliver', value: (formState.delivery ? 'Yes' : 'No') },
        { name: 'Cold Chain', value: (formState.coldChain ? 'Yes' : 'No') },
        { name: 'Additional Comments', value: formState.additionalComments },
      ],
    },
  ];

  useEffect(() => {
    if (!formState.hideFarm) {
      setFormState(
        {
          ...formState,
          farmName: formState.legalName,
        },
      );
    }
  }, []);

  if (currentStep !== 4) {
    return null;
  }

  return [
    <div className={classes.subtitleText}>
      Confirmation
    </div>,
    <div className={classes.regSubtitleText}>
      Please confirm that the information about your agency is correct.
    </div>,
    <Grid container spacing={2}>
      {fields.map((field) => (
        <>
          <Grid item container direction="column" align="left" xs={12} sm={9}>
            <Typography gutterBottom className={classes.underlinedSubtitleText}>
              {field.heading}
            </Typography>
            <Grid container align="left">
              {field.body.map((info) => (
                <React.Fragment key={info.name}>
                  <Grid item xs={5}>
                    <Typography gutterBottom className={classes.labelText}>{info.name}</Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography gutterBottom className={classes.valueText}>{info.value}</Typography>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={12} sm={3} align="right">
            <Button className={classes.smallButton} onClick={() => onSelectStep(field.page)}>
              Edit
            </Button>
          </Grid>
        </>
      ))}
      <Grid item xs={12} sm={6}>
        <Button
          type="button"
          onClick={onPrev}
          fullWidth
          color="primary"
          variant="contained"
          className={classes.blackButton}
        >
          Back
        </Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button
          className={classes.greenButton}
          type="button"
          onClick={handleSubmit}
          fullWidth
          color="primary"
          variant="contained"
        >
          Finish
        </Button>
      </Grid>
    </Grid>,
  ];
}

function Step5({
  currentStep, routeChange, classes,
}) {
  if (currentStep !== 5) {
    return null;
  }
  return [
    <div>
      <div className={classes.cenSubtitleText}>
        Registration Completed!
      </div>
      <div className={classes.plainText}>
        We have set up your profile linked to your account.
      </div>
    </div>,
    <Grid
      container
      spacing={2}
      alignItems="center"
    >
      <Grid item xs={12}>
        <div className={classes.emptyGrid}>
          <img src={Fruit4} className={classes.confirmationFruit4} aria-hidden alt="" />
          <img src={Fruit1} className={classes.confirmationFruit1} aria-hidden alt="" />
        </div>
      </Grid>

      <Grid item xs={12}>
        <Button
          type="button"
          className={classes.submitButton}
          color="primary"
          variant="contained"
          style={{ backgroundColor: '#53AA48' }}
          onClick={routeChange}
          fullWidth
        >
          Back To Home
        </Button>
      </Grid>
    </Grid>,
  ];
}
