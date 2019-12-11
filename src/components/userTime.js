import React, { useState, useEffect } from "react";
import { loadData, updateData, newData } from "../utils/loadData";
import useDropdown from "./useDropdown";
import moment from "moment";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import CardDeck from "react-bootstrap/CardDeck";
import Button from "react-bootstrap/Button";

//const calPeriods = [1, 2, 3, 4, 5, 6, 7, 8];


const TimeParams = () => {
  const [time, setTime] = useState([]);
  const [lastPunch, setLastPunch] = useState('');
  const [isClockedIn, setIsClockedIn] = useState('');
  const [worked, setWorked] = useState('');
  const [totalWorked, setTotalWorked] = useState('');
  const [dayHoursArray, setDayHoursArray] = useState('');
  const [calYears, setCalYears] = useState([]);
  const [calPeriods, setCalPeriods] = useState([]);
  const [periodFilter, setPeriodFilter] = useState([2019]);
  const [year, YearDropdown] = useDropdown("Year ", moment().format('YYYY'), calYears);
  const [periods, PeriodDropdown, updatePeriods] = useDropdown("Work Period ", moment().format('YYYY'), periodFilter);

  //Component did mount
  useEffect(() => {
    refreshData();
    getYears();
    getPeriods();
  }, [])

  //Component did update
  useEffect(() => {
    let periodFilter = calPeriods;
    let filterPeriodArray = [];
    let periodArray = [];
    setPeriodFilter([])
    updatePeriods("");
    console.log('periodFilter is:', periodFilter)

    periodFilter.map(period => {
      periodArray.push({ year: moment(period.period_end).format('YYYY'), period: moment(period.period_begin).format('MM/DD/YYYY') + ' - ' + moment(period.period_end).format('MM/DD/YYYY') })
    })
    console.log('periodArray is:', periodArray)

    function checkYear(item) {
      return item.year == year;
    }

    periodArray = periodArray.filter(checkYear);
    console.log('periodArray after filter: ', periodArray)

    periodArray.map(period => {
      filterPeriodArray.push(period.period)
    })

    console.log('filterPeriodArray is after select:', filterPeriodArray)
    setPeriodFilter(filterPeriodArray);

  }, [year]);


  // setTimeout(() => {
  //   setCurrentTime(moment());
  //   let hours = currentTime.diff(lastPunch, 'minutes')
  //   setWorked((hours / 60).toFixed(2));
  //   //console.log('worked is:', worked);
  //   //setWorked(moment())
  // }, 1000);

  const getYears = async () => {
    const url = "http://localhost:3001/time/years/1";
    const yearsData = await loadData(url);
    let yearsArray = [];
    yearsData.map(year => {
      yearsArray.push(year.year)
    })


    setCalYears(yearsArray);
  }

  const getPeriods = async () => {
    const url = "http://localhost:3001/time/periods/1";
    const periodData = await loadData(url);
    let periodArray = [];
    let filterPeriodArray = [];
    // periodData.map(period => {
    //   (moment(period.period_end).format('YYYY') == moment().format('YYYY')) ?
    //     periodArray.push(moment(period.period_begin).format('MM/DD/YYYY') + ' - ' + moment(period.period_end).format('MM/DD/YYYY')) : ''
    // })
    periodData.map(period => {
      periodArray.push({ year: moment(period.period_end).format('YYYY'), period: moment(period.period_begin).format('MM/DD/YYYY') + ' - ' + moment(period.period_end).format('MM/DD/YYYY') })
    })
    console.log('Periods ARE:', periodArray);

    function checkYear(year) {
      return year.year == '2019';
    }

    periodArray = periodArray.filter(checkYear);
    console.log('periodArray after filter: ', periodArray)

    periodArray.map(period => {
      filterPeriodArray.push(period.period)
    })

    setCalPeriods(periodData);
    setPeriodFilter(filterPeriodArray);
    console.log(calPeriods);
  }

  const refreshData = async () => {
    const url = "http://localhost:3001/time/1";
    const timeData = await loadData(url);
    console.log('time query is:', timeData)
    let punchIn = (timeData[timeData.length - 1].endtime == null) ? moment(timeData[timeData.length - 1].starttime) : moment();
    let calcMins = moment().diff(punchIn, "seconds");
    let calcHours = (calcMins / 3600).toFixed(2);
    setLastPunch(punchIn);
    let hoursArray = []
    timeData.map(punch => {
      hoursArray.push(parseFloat(punch.hours == null ? 0.00 : punch.hours));
      return;
    }
    );
    hoursArray.push(parseFloat(calcHours));
    setDayHoursArray(hoursArray);

    const add = (a, b) =>
      a + b
    // use reduce to sum our array
    const sum = hoursArray.reduce(add);

    setIsClockedIn((timeData[timeData.length - 1].endtime == null) ? true : false);
    setWorked(calcHours);
    setTime(timeData);
    setTotalWorked(sum.toFixed(2));
  }

  const updateHours = () => {
    let calcMins = moment().diff(lastPunch, "seconds");
    let calcHours = (calcMins / 3600).toFixed(2);
    let hoursArray = dayHoursArray;

    hoursArray.pop()
    hoursArray.push(parseFloat(calcHours));

    const add = (a, b) =>
      a + b
    // use reduce to sum our array
    const sum = hoursArray.reduce(add);

    setWorked(calcHours);
    setTotalWorked(sum.toFixed(2));
  }

  const clockOut = async e => {
    e.preventDefault();
    const url = "http://localhost:3001/time/clockout/1";
    const clockOutData = await updateData(url);
    setLastPunch([])
    refreshData();
  }

  const clockIn = async e => {
    e.preventDefault();
    const url = "http://localhost:3001/time/clockin/1";
    const clockInData = await newData(url);
    let punchIn = clockInData;

    setLastPunch(punchIn);
    refreshData();
  }

  return (
    <>
      {isClockedIn === true ? <Button variant="primary" onClick={clockOut}>Clock-Out</Button> : <Button variant="primary" onClick={clockIn}>Clock-In</Button>}
      <YearDropdown />
      <PeriodDropdown />

      <CardDeck>
        {time.map(punch => {


          return (
            <>
              <Card
                key={`card-${punch.id}`}
                bg="light"
                className="text-center"
                border="dark"
                style={{ width: "10rem" }}
              >
                <Card.Header key={`date-${punch.id}`} as="h5">
                  {moment(punch.starttime).format("MM/DD/YYYY")}
                </Card.Header>
                <Card.Body key={`clockin-${punch.id}`}>
                  <Card.Title>Clock-In</Card.Title>
                  <Card.Text key={`clockindetail-${punch.id}`}>
                    {moment(punch.starttime).format("h:mm A")}

                  </Card.Text>
                  <Card.Title key={`clockout-${punch.id}`}>
                    {" "}
                    {punch.endtime == null ? "" : "Clock-Out"}
                  </Card.Title>
                  <Card.Text key={`clockoutdetail-${punch.id}`}>
                    {punch.endtime == null
                      ? ""
                      : moment(punch.endtime).format("h:mm A")}
                  </Card.Text>
                </Card.Body>
                <Card.Footer key={`Hoursfooter-${punch.id}`}>
                  <Card.Title key={`hours-${punch.id}`}>Hours</Card.Title>
                  <Card.Text key={`hoursdetail-${punch.id}`}>
                    {punch.endtime == null ? worked : punch.hours}
                  </Card.Text>
                </Card.Footer>
                {punch.endtime == null ? (
                  <Card.Footer key={`buttonfooter-${punch.id}`}>
                    <Button key={`button-${punch.id}`} variant="primary" onClick={updateHours}>Refresh Hours</Button>
                  </Card.Footer>
                ) : (
                    ""
                  )}
              </Card>
            </>
          );
        })}
      </CardDeck>
      <Card key='totalhours'>
        <Card.Header as="h5">
          Total Hours for Period
                </Card.Header>
        <Card.Body>
          <Card.Title>{totalWorked}</Card.Title>
          {isClockedIn === true ? <Button variant="primary" onClick={updateHours}>Refresh Hours</Button> : <Button variant="primary" onClick={updateHours} hidden>Refresh Hours</Button>}
        </Card.Body>
      </Card>
    </>
  );
};

export default TimeParams;
