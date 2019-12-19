import React, { useState, useEffect } from "react";
import { loadData, updateData, newData } from "../utils/loadData";
import useDropdown from "./useDropdown";
import LeftNav from "./nav";
import moment from "moment";
import Card from "react-bootstrap/Card";
import CardDeck from "react-bootstrap/CardDeck";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Jumbotron from "react-bootstrap/Jumbotron";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../src/userTime.css";

const TimeParams = () => {
  // const [time, setTime] = useState([
  //   { id: 1, starttime: moment().format(), endtime: moment().format() }
  // ]);
  const [time, setTime] = useState([]);
  // const [timeStore, setTimeStore] = useState([
  //   { id: 1, starttime: moment().format(), endtime: moment().format() }
  // ]);
  const [timeStore, setTimeStore] = useState([]);
  const [lastPunch, setLastPunch] = useState("");
  const [isClockedIn, setIsClockedIn] = useState("");
  const [worked, setWorked] = useState("");
  const [totalWorked, setTotalWorked] = useState(0.0);
  const [dayHoursArray, setDayHoursArray] = useState([]);
  const [calYears, setCalYears] = useState([]);
  const [calendarPeriods, setCalendarPeriods] = useState([
    "00/00/0000 - 00/00/0000"
  ]);
  const [periodFilter, setPeriodFilter] = useState(["00/00/0000 - 00/00/0000"]);
  const [currentPeriod, setCurrentPeriod] = useState("00/00/0000 - 00/00/0000");
  const [year, YearDropdown, updateYear] = useDropdown("Year ", "", calYears);
  const [period, PeriodDropdown, updatePeriod] = useDropdown(
    "Work Period ",
    currentPeriod,
    periodFilter
  );

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
    updatePeriod("");

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
    setPeriodFilter(filterPeriodArray);
    updatePeriod(filterPeriodArray[0]);
    // let notCurrentYearFunction =
    //   moment().format("YYYY") === filterPeriodArray[0].substring(19, 24)
    //     ? ""
    //     : updatePeriod(filterPeriodArray[0]);
  }, [year]);

  //Period component did update
  useEffect(() => {
    let punchFilter = timeStore;
    let filterPunchArray = [];
    let punchArray = [];
    let hoursArray = [0];

    function checkPeriod(item) {
      return (
        moment(moment(item.starttime).format("MM/DD/YYYY")).diff(
          period.substring(0, 10)
        ) >= 0 &&
        moment(moment(item.starttime).format("MM/DD/YYYY")).diff(
          period.substring(13, 23)
        ) <= 0
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
    setTime(filterPunchArray);
    setTotalWorked(sum.toFixed(2));
    let hoursUpdateFunction = currentPeriod === period ? updateHours() : "";
  }, [period]);

  const getYears = async () => {
    const url = "https://timeapi.chilldev.io/time/years/1";
    const yearsData = await loadData(url);
    let yearsArray = [];
    yearsData.map(year => {
      yearsArray.push(year.year);
    });

    setCalYears(yearsArray);
  };

  const getPeriods = async () => {
    const url = "https://timeapi.chilldev.io/time/periods/1";
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
      return year.year === currentPeriod.substring(19, 23);
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
    const url = "https://timeapi.chilldev.io/time/1";
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
    let periodArrayForRefresh = [];
    let filteredPeriodArrayForRefresh = [];
    let filterPeriodArray = [];
    periodData.map(period => {
      periodArrayForRefresh.push({
        year: moment(period.period_end).format("YYYY"),
        period:
          moment(period.period_begin).format("MM/DD/YYYY") +
          " - " +
          moment(period.period_end).format("MM/DD/YYYY")
      });
    });

    function checkDate(item) {
      let testReturn =
        moment(moment().format("MM/DD/YYYY")).diff(
          item.period.substring(0, 10)
        ) >= 0 &&
        moment(moment().format("MM/DD/YYYY")).diff(
          item.period.substring(13, 23)
        ) <= 0;
      return testReturn;
    }

    filteredPeriodArrayForRefresh = periodArrayForRefresh.filter(checkDate);
    updateYear(filteredPeriodArrayForRefresh[0].period.substring(19, 23));
    setCurrentPeriod(filteredPeriodArrayForRefresh[0].period);
    function checkPeriod(item) {
      return (
        moment(moment(item.starttime).format("MM/DD/YYYY")).diff(
          filteredPeriodArrayForRefresh[0].period.substring(0, 10)
        ) >= 0 &&
        moment(moment(item.starttime).format("MM/DD/YYYY")).diff(
          filteredPeriodArrayForRefresh[0].period.substring(13, 23)
        ) <= 0
      );
    }
    let filterPunchArray = punchFilter.filter(checkPeriod);

    filteredPeriodArrayForRefresh.map(period => {
      filterPeriodArray.push(period.period);
    });
    filterPunchArray.map(punch => {
      hoursArray.push(parseFloat(punch.hours == null ? 0.0 : punch.hours));
      return;
    });

    hoursArray.push(parseFloat(calcHours));
    setDayHoursArray(hoursArray);

    const add = (a, b) => a + b;
    // use reduce to sum our array
    const sum = hoursArray.reduce(add);
    setTotalWorked(sum.toFixed(2));

    setIsClockedIn(
      timeData[timeData.length - 1].endtime == null ? true : false
    );
    setWorked(calcHours);
    setTimeStore(timeData);
    updatePeriod(filteredPeriodArrayForRefresh[0].period);
    setTime(filterPunchArray);
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
    const url = "https://timeapi.chilldev.io/time/clockout/1";
    const clockOutData = await updateData(url);
    updateYear(currentPeriod.substring(19, 24));
    updatePeriod(currentPeriod);
    setLastPunch([]);
    refreshData();
  };

  const clockIn = async e => {
    e.preventDefault();
    const url = "https://timeapi.chilldev.io/time/clockin/1";
    const clockInData = await newData(url);
    let punchIn = clockInData;

    updateYear(currentPeriod.substring(19, 24));
    updatePeriod(currentPeriod);
    setLastPunch(punchIn);
    refreshData();
  };

  const moveToCurrent = () => {
    updateYear(currentPeriod.substring(19, 24));
    setTimeout(() => {
      updatePeriod(currentPeriod);
    }, 500);
  };

  function findCurrentIndex(periodIndex) {
    return periodIndex === period;
  }

  const moveToPrevious = () => {
    setTimeout(() => {
      updatePeriod(periodFilter[periodFilter.findIndex(findCurrentIndex) - 1]);
    }, 100);
  };

  const moveToNext = () => {
    setTimeout(() => {
      updatePeriod(periodFilter[periodFilter.findIndex(findCurrentIndex) + 1]);
    }, 100);
  };

  return (
    <div className="grid-container">
      <Jumbotron className="item1">
        <h1>Ferris Bueller</h1>
        <p>Today is {moment().format("dddd MMMM Do, YYYY")}</p>
        <p>
          {isClockedIn === true ? (
            <Button
              variant="primary"
              size="lg"
              onClick={clockOut}
              aria-label="Use this button to Clock out"
            >
              Clock-Out
            </Button>
          ) : (
            ""
          )}
          {isClockedIn === false ? (
            <Button
              variant="primary"
              size="lg"
              onClick={clockIn}
              aria-label="Use this button to Clock In"
            >
              Clock-In
            </Button>
          ) : (
            ""
          )}{" "}
        </p>
      </Jumbotron>
      <LeftNav />
      <div className="item3">
        <YearDropdown />
        <PeriodDropdown />
        <ButtonToolbar>
          {period !== currentPeriod ? (
            <Button variant="outline-dark" block onClick={moveToCurrent}>
              Show Current Period
            </Button>
          ) : (
            <Button
              variant="outline-dark"
              block
              onClick={moveToCurrent}
              disabled
            >
              Show Current Period
            </Button>
          )}
          {period === periodFilter[0] ? (
            <Button
              variant="outline-secondary"
              block
              onClick={moveToPrevious}
              disabled
            >
              Show Previous Period
            </Button>
          ) : (
            <Button variant="outline-secondary" block onClick={moveToPrevious}>
              Show Previous Period
            </Button>
          )}
          {period === periodFilter[periodFilter.length - 1] ? (
            <Button variant="outline-dark" block onClick={moveToNext} disabled>
              Show Next Period
            </Button>
          ) : (
            <Button variant="outline-dark" block onClick={moveToNext}>
              Show Next Period
            </Button>
          )}
        </ButtonToolbar>
        <Card key="totalhours">
          <Card.Header as="h5">
            {totalWorked >= 0 ? (
              <p>Total Hours for Period: {totalWorked}</p>
            ) : (
              ""
            )}
          </Card.Header>
          {/* <Card.Body> */}
          {/* <Card.Title> */}
          {currentPeriod === period && isClockedIn === true ? (
            <Button variant="primary" onClick={updateHours}>
              Refresh Hours
            </Button>
          ) : (
            <Button variant="primary" onClick={updateHours} hidden>
              Refresh Hours
            </Button>
          )}
          {/* </Card.Title> */}
          {/* </Card.Body> */}
        </Card>
        {/* <CardDeck className="carddeck"> */}
        <div className="scroll-zone">
          <div className="auto-grid">
            {time.map(punch => {
              return (
                <>
                  <Card
                    key={`card-${punch.id}`}
                    bg="light"
                    className="text-center"
                    border="dark"
                    // style={{ width: "250px" }}
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
                  </Card>{" "}
                </>
              );
            })}
          </div>
          {/* </CardDeck> */}
        </div>
      </div>
    </div>
  );
};

export default TimeParams;
