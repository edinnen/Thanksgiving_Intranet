import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { getHistoricalData } from '../../../redux/actions';
import { teal, indigo, blue } from '@material-ui/core/colors';
import { Box } from '@material-ui/core';
import GridContainer from '../../../@crema/core/GridContainer';
import Grid from '@material-ui/core/Grid';
import LinePlot from '../../../shared/components/LinePlot';
import { Reading } from '../../../types/models/Power';
import { AppState } from '../../../redux/store';
import { DateTimePicker } from "@material-ui/pickers";
import moment from 'moment';
import ValueCard from 'shared/components/ValueCard';
import { averageNumber, createLineData } from 'utils';
import PercentageCard from '../../../@crema/core/PercentageCard';
import TemperatureCard from '../../../@crema/core/TemperatureCard';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    // margin: theme.spacing(1),
    marginLeft: theme.spacing(5),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

const initialRange = moment.duration("00:01:00");
const initialFrom = moment();
initialFrom.subtract(initialRange);

interface Period {
  value: number;
  type: any;
}
const initialPeriod: Period = { value: 1, type: 'm' };

function Historical() {
  const classes = useStyles();
  const [from, handleFromChange] = useState(initialFrom);
  const [period, handlePeriodChange] = useState(initialPeriod);

  const dispatch = useDispatch();

  useEffect(() => {
    const unix = (date: moment.Moment) => Math.floor(date.valueOf() / 1000);
    const to: any = moment(from).add(period.value, period.type);
    console.log(from, to);
    dispatch(getHistoricalData(unix(from), unix(to)));
  }, [dispatch, from, period]);

  const { historicalData } = useSelector<AppState, AppState['dashboard']>(
    ({ dashboard }) => dashboard,
  );

  const periodSelector = (
    <FormControl variant="outlined" className={classes.formControl}>
      <InputLabel id="period-label">Period</InputLabel>
      <Select
        labelId="period-label"
        id="period-select"
        value={`${period.value}${period.type}`}
        onChange={event => {
          const regex = /(\d+)([a-z])/g;
          const matches = regex.exec(event.target.value as string);
          if (matches) {
            handlePeriodChange({ value: parseInt(matches[1]), type: matches[2] });
          }
        }}
      >
        <MenuItem value="1m">1 Minute</MenuItem>
        <MenuItem value="3m">3 Minutes</MenuItem>
        <MenuItem value="5m">5 Minutes</MenuItem>
        <MenuItem value="10m">10 Minutes</MenuItem>
        <MenuItem value="15m">15 Minutes</MenuItem>
        <MenuItem value="30m">30 Minutes</MenuItem>
        <MenuItem value="1h">1 Hour</MenuItem>
        <MenuItem value="6h">6 Hours</MenuItem>
        <MenuItem value="12h">12 Hours</MenuItem>
        <MenuItem value="1d">1 Day</MenuItem>
        <MenuItem value="6d">6 Days</MenuItem>
        <MenuItem value="1w">1 Week</MenuItem>
        <MenuItem value="1M">1 Month</MenuItem>
        <MenuItem value="1y">1 Year</MenuItem>
      </Select>
    </FormControl>
  );

  if (!historicalData) return (
    <>
      <Box pt={{ xl: 4 }}>
        <DateTimePicker
          label="From"
          inputVariant="outlined"
          value={from}
          onChange={date => date && handleFromChange(date)}
        />
        {periodSelector}
      </Box>
    </>
  )

  const voltAmpData: any = [];
  const powerData: any = [];

  historicalData.map((reading: Reading) => {
    let { timestamp } = reading;
    timestamp = new Date(timestamp);
    const date = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1)}-${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
    voltAmpData.push(createLineData(date, reading, 'solar_voltage', 'battery_voltage', 'load_amperage'));
    powerData.push(createLineData(date, reading, 'avg_battery_power', 'avg_load_power'));
    return null;
  });

  const getAverage = (historicalData: Reading[], key: string) => {
    return averageNumber(historicalData.map((reading: any) => {
      return reading[key];
    }))
  }

  const avgCabinTemp = getAverage(historicalData, "cabin_temp");

  const avgOutsideTemp = getAverage(historicalData, "outside_temp");

  const avgBatteryTemp = getAverage(historicalData, "battery_temp");

  const avgBatteryPercent = getAverage(historicalData, "battery_percent");

  const avgSolarV = getAverage(historicalData, "solar_voltage");

  const avgBatteryV = getAverage(historicalData, "battery_voltage");

  const avgLoadA = getAverage(historicalData, "load_amperage");

  const avgBatteryP = getAverage(historicalData, "avg_battery_power");

  const avgLoadP = getAverage(historicalData, "avg_load_power");

  return (
    <>
      <Box pt={{ xl: 4 }}>
        <DateTimePicker
          label="From"
          inputVariant="outlined"
          value={from}
          onChange={date => date && handleFromChange(date)}
        />
        {periodSelector}
        <h1>Averages over the period</h1>
        <GridContainer>
          <Grid item xs={12} md={3}>
            <PercentageCard percentage={avgBatteryPercent} title="Battery Charge" />
          </Grid>
          <Grid item xs={6} md={3}>
            <TemperatureCard temperature={avgCabinTemp} title="Cabin Temperature" color={teal[500]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TemperatureCard temperature={avgOutsideTemp} title="Outside Temperature" color={indigo[600]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TemperatureCard temperature={avgBatteryTemp} title="Battery Temperature" color={blue[600]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <ValueCard value={avgSolarV} title="Solar Voltage" color={teal[500]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <ValueCard value={avgBatteryV} title="Battery Voltage" color={teal[500]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <ValueCard value={avgLoadA} title="Load Amperage" color={teal[500]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <ValueCard value={avgBatteryP} title="Battery Power" color={teal[500]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <ValueCard value={avgLoadP} title="Load Power" color={teal[500]} />
          </Grid>
        </GridContainer>
        <GridContainer>
          <Grid item xs={12}>
            <LinePlot title="Voltage and Amperage" data={voltAmpData} primaryKey="solar_voltage" secondaryKey="battery_voltage" tertiaryKey="load_amperage" primaryColor="#8884d8" secondaryColor="#82ca9d" tertiaryColor="#0698ec" />
          </Grid>
          <Grid item xs={12}>
            <LinePlot title="Average Power" data={powerData} primaryKey="avg_battery_power" secondaryKey="avg_load_power" primaryColor="#f44d50" secondaryColor="#0698ec" />
          </Grid>
        </GridContainer>
      </Box>
    </>
  );
}

export default Historical;