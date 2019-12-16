import React, { useState, useEffect } from "react";
import { loadData, updateData, newData } from "../utils/loadData";
import useDropdown from "./useDropdown";
import moment from "moment";
import Card from "react-bootstrap/Card";
import CardDeck from "react-bootstrap/CardDeck";
import Button from "react-bootstrap/Button";

const TimeParams = () => {
  const [time, setTime] = useState([
    { id: 1, starttime: moment().format(), endtime: moment().format() }
  ]);
  const [timeStore, setTimeStore] = useState([
    { id: 1, starttime: moment().format(), endtime: moment().format() }
  ]);
  const [lastPunch, setLastPunch] = useState("");
  const [isClockedIn, setIsClockedIn] = useState("");
  const [worked, setWorked] = useState("");
  const [totalWorked, setTotalWorked] = useState(0.0);
  const [dayHoursArray, setDayHoursArray] = useState([]);
  const [calYears, setCalYears] = useState([]);
  const [calendarPeriods, setCalendarPeriods] = useState([
    "01/01/1999 - 01/01/1999"
  ]);
  const [periodFilter, setPeriodFilter] = useState(["01/01/1999 - 01/01/1999"]);
  const [currentPeriod, setCurrentPeriod] = useState("");
  const [year, YearDropdown, updateYear] = useDropdown(
    "Year ",
    moment().format("YYYY"),
    calYears
  );
  const [period, PeriodDropdown, updatePeriods] = useDropdown(
    "Work Period ",
    currentPeriod,
    periodFilter
  );

  console.log("periodFilter is: ", periodFilter);

  //Component did mount
  useEffect(() => {
    refreshData();
    getYears();
  }, []);

  //Year component did update changes list in period selection
  useEffect(() => {
    let periodFilter = calendarPeriods;
    let filterPeriodArray = [];
    let periodArray = [];
    setPeriodFilter([]);
    updatePeriods("");

    periodFilter.map(period => {
      periodArray.push({
        year: moment(period.period_end).format("YYYY"),
        period:
          moment(period.period_begin).format("MM/DD/YYYY") +
          " - " +
          moment(period.period_end).format("MM/DD/YYYY")
      });
    });

    function checkYear(item) {
      return item.year === year;
    }

    periodArray = periodArray.filter(checkYear);

    periodArray.map(period => {
      filterPeriodArray.push(period.period);
    });
    console.log("year useEffect is:", filterPeriodArray);
    setPeriodFilter(filterPeriodArray);
    let isCurrentYearTrue =
      moment().format("YYYY") === filterPeriodArray[0].substring(19, 24)
        ? "true"
        : "false";
    console.log(isCurrentYearTrue);
    console.log(filterPeriodArray[0].substring(19, 24));
    console.log(moment().format("YYYY"));

    let notCurrentYearFunction =
      moment().format("YYYY") === filterPeriodArray[0].substring(19, 24)
        ? ""
        : updatePeriods(filterPeriodArray[0]);
  }, [year]);

  //Period component did update
  useEffect(() => {
    let punchFilter = timeStore;
    let filterPunchArray = [];
    let punchArray = [];
    let hoursArray = [0];

    console.log("period before filter is:", period);
    function checkPeriod(item) {
      return (
        moment(item.starttime).format("YYYY") === period.substring(19, 24) &&
        moment(item.starttime).format("MM/DD/YYYY") >=
          period.substring(0, 10) &&
        moment(item.starttime).format("MM/DD/YYYY") <= period.substring(13, 23)
      );
    }

    filterPunchArray = punchFilter.filter(checkPeriod);

    filterPunchArray.map(punch => {
      hoursArray.push(parseFloat(punch.hours == null ? 0.0 : punch.hours));
      return;
    });

    const add = (a, b) => a + b;
    // use reduce to sum our array
    const sum = hoursArray.reduce(add);
    console.log(sum);
    setTime(filterPunchArray);
    setTotalWorked(sum.toFixed(2));
    console.log(
      currentPeriod === period
        ? "currentperiod is period"
        : "currentPeriod is not period"
    );
    let hoursUpdateFunction = currentPeriod === period ? updateHours() : "";
  }, [period]);

  const getYears = async () => {
    const url = "http://localhost:3001/time/years/1";
    const yearsData = await loadData(url);
    let yearsArray = [];
    yearsData.map(year => {
      yearsArray.push(year.year);
    });

    setCalYears(yearsArray);
  };

  const getPeriods = async () => {
    const url = "http://localhost:3001/time/periods/1";
    const periodData = await loadData(url);
    setCalendarPeriods(periodData);
    let periodArray = [];
    let filterPeriodArray = [];

    periodData.map(period => {
      periodArray.push({
        year: moment(period.period_end).format("YYYY"),
        period:
          moment(period.period_begin).format("MM/DD/YYYY") +
          " - " +
          moment(period.period_end).format("MM/DD/YYYY")
      });
    });

    function checkYear(year) {
      return year.year === moment().format("YYYY");
    }

    periodArray = periodArray.filter(checkYear);

    periodArray.map(period => {
      filterPeriodArray.push(period.period);
    });

    setPeriodFilter(filterPeriodArray);

    return periodData;
  };

  const refreshData = async () => {
    let periodData = await getPeriods();
    const url = "http://localhost:3001/time/1";
    const timeData = await loadData(url);
    let punchIn =
      timeData[timeData.length - 1].endtime == null
        ? moment(timeData[timeData.length - 1].starttime)
        : moment();
    let calcMins = moment().diff(punchIn, "seconds");
    let calcHours = (calcMins / 3600).toFixed(2);
    setLastPunch(punchIn);
    let hoursArray = [];
    let punchFilter = timeData;
    let periodArray = [];
    let filterPeriodArray = [];

    periodData.map(period => {
      periodArray.push({
        year: moment(period.period_end).format("YYYY"),
        period:
          moment(period.period_begin).format("MM/DD/YYYY") +
          " - " +
          moment(period.period_end).format("MM/DD/YYYY")
      });
    });
    function checkDate(item) {
      return (
        item.year === moment().format("YYYY") &&
        item.period.substring(0, 10) <= moment().format("MM/DD/YYYY") &&
        item.period.substring(13, 23) >= moment().format("MM/DD/YYYY")
      );
    }
    periodArray = periodArray.filter(checkDate);
    setCurrentPeriod(periodArray[0].period);

    let test = "12/10/2018" >= "12/06/2019" ? "True" : "False";
    console.log(test);
    console.log(periodArray[0].period.substring(0, 10));

    function checkPeriod(item) {
      console.log(moment(item.starttime).format("MM/DD/YYYY"));
      return (
        moment(item.starttime).format("MM/DD/YYYY") >=
          moment(periodArray[0].period.substring(0, 10)).format("MM/DD/YYYY") &&
        moment(item.starttime).format("MM/DD/YYYY") <=
          periodArray[0].period.substring(13, 23)
      );
    }
    console.log(punchFilter);
    let filterPunchArray = punchFilter.filter(checkPeriod);
    setTime(filterPunchArray);

    periodArray.map(period => {
      filterPeriodArray.push(period.period);
    });
    console.log(filterPunchArray);
    filterPunchArray.map(punch => {
      hoursArray.push(parseFloat(punch.hours == null ? 0.0 : punch.hours));
      return;
    });

    hoursArray.push(parseFloat(calcHours));
    setDayHoursArray(hoursArray);

    const add = (a, b) => a + b;
    // use reduce to sum our array
    const sum = hoursArray.reduce(add);
    console.log("sum is:", sum);
    setTotalWorked(sum.toFixed(2));

    setIsClockedIn(
      timeData[timeData.length - 1].endtime == null ? true : false
    );
    setWorked(calcHours);
    setTimeStore(timeData);
    updatePeriods(periodArray[0].period);
  };

  const updateHours = () => {
    let calcMins = moment().diff(lastPunch, "seconds");
    let calcHours = (calcMins / 3600).toFixed(2);
    let hoursArray = dayHoursArray;

    hoursArray.pop();
    hoursArray.push(parseFloat(calcHours));

    const add = (a, b) => a + b;
    // use reduce to sum our array
    const sum = hoursArray.reduce(add);

    setWorked(calcHours);
    setTotalWorked(sum.toFixed(2));
  };

  const clockOut = async e => {
    e.preventDefault();
    const url = "http://localhost:3001/time/clockout/1";
    const clockOutData = await updateData(url);
    updateYear(moment().format("YYYY"));
    setLastPunch([]);
    refreshData();
  };

  const clockIn = async e => {
    e.preventDefault();
    const url = "http://localhost:3001/time/clockin/1";
    const clockInData = await newData(url);
    let punchIn = clockInData;

    updateYear(moment().format("YYYY"));
    setLastPunch(punchIn);
    refreshData();
  };

  const moveToCurrent = () => {
    updateYear(moment().format("YYYY"));
    setTimeout(() => {
      updatePeriods(currentPeriod);
    }, 100);
  };

  const moveToPrevious = () => {
    updateYear(moment().format("YYYY"));
    setTimeout(() => {
      updatePeriods(currentPeriod);
    }, 100);
  };

  const moveToNext = () => {
    updateYear(moment().format("YYYY"));
    setTimeout(() => {
      updatePeriods(currentPeriod);
    }, 100);
  };

  console.log("period is:", period);
  console.log(
    "periodFilter length -1 is:",
    periodFilter[periodFilter.length - 1]
  );
  console.log("time at render is: ", time);
  return (
    <>
      {isClockedIn === true ? (
        <Button variant="primary" onClick={clockOut}>
          Clock-Out
        </Button>
      ) : (
        <Button variant="primary" onClick={clockIn}>
          Clock-In
        </Button>
      )}
      <YearDropdown />
      <PeriodDropdown />
      {period !== currentPeriod ? (
        <Button variant="primary" onClick={moveToCurrent}>
          Show Current Period
        </Button>
      ) : (
        ""
      )}
      {period === periodFilter[0] ? (
        ""
      ) : (
        <Button variant="primary" onClick={moveToPrevious}>
          Show Previous Period
        </Button>
      )}
      {period === periodFilter[periodFilter.length - 1] ? (
        ""
      ) : (
        <Button variant="primary" onClick={moveToNext}>
          Show Next Period
        </Button>
      )}
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
                    <Button
                      key={`button-${punch.id}`}
                      variant="primary"
                      onClick={updateHours}
                    >
                      Refresh Hours
                    </Button>
                  </Card.Footer>
                ) : (
                  ""
                )}
              </Card>
            </>
          );
        })}
      </CardDeck>
      <Card key="totalhours">
        <Card.Header as="h5">Total Hours for Period</Card.Header>
        <Card.Body>
          <Card.Title>{totalWorked >= 0 ? totalWorked : ""}</Card.Title>
          {currentPeriod === period && isClockedIn === true ? (
            <Button variant="primary" onClick={updateHours}>
              Refresh Hours
            </Button>
          ) : (
            <Button variant="primary" onClick={updateHours} hidden>
              Refresh Hours
            </Button>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default TimeParams;
