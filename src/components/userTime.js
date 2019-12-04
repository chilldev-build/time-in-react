import React, { useState } from "react";
import { loadData, updateData } from "../utils/loadData";
import moment from "moment";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import CardDeck from "react-bootstrap/CardDeck";
import Button from "react-bootstrap/Button";

var questionList = [];
var timeData;

const TimeParams = () => {
  const [time, setTime] = useState([]);
  const [worked, setWorked] = useState({});

  const handleSubmit = async e => {
    e.preventDefault();
    console.log("time: ", time);
    const url = "http://localhost:3001/time/1";
    timeData = await loadData(url);

    // console.log("this is the punchIn:", punchIn);
    // console.log("this is the currentTime:", currentTime);
    // console.log("this is the answer:", calcHours);
    setTime(timeData);
  };

  const clockOut = async e => {
    e.preventDefault();
    console.log("time: ", time);
    const url = "http://localhost:3001/time/clockout/1";
    timeData = await updateData(url);
    handleSubmit();
  };


  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="timesheet">Get Timesheet</label>
        <button type="submit">Submit</button>
      </form>
      <CardDeck>
        {time.map(punch => {
          var currentTime = moment();
          var punchIn = moment(timeData[timeData.length - 1].starttime);
          var calcMins = currentTime.diff(punchIn, "minutes");
          var calcHours = (calcMins / 60).toFixed(2);

          return (
            <>
              <Card
                key={`card-${punch.id}`}
                bg="light"
                className="text-center"
                border="dark"
                style={{ width: "10rem" }}
              >
                <Card.Header key={punch.id} as="h5">
                  {moment(punch.starttime).format("MM/DD/YYYY")}
                </Card.Header>
                <Card.Body key={punch.id}>
                  <Card.Title key={punch.id}>Clock-In</Card.Title>
                  <Card.Text key={punch.id}>
                    <input
                      type="text"
                      style={{ width: "8rem", textAlign: "center" }}
                      value={moment(punch.starttime).format("h:mm A")}
                    />
                  </Card.Text>
                  <Card.Title key={punch.id}>
                    {" "}
                    {punch.endtime == null ? "" : "Clock-Out"}
                  </Card.Title>
                  <Card.Text key={punch.id}>
                    {punch.endtime == null
                      ? ""
                      : moment(punch.endtime).format("h:mm A")}
                  </Card.Text>
                </Card.Body>
                <Card.Footer key={punch.id}>
                  <Card.Title>Hours</Card.Title>
                  <Card.Text>
                    {punch.endtime == null ? calcHours : punch.hours}
                  </Card.Text>
                </Card.Footer>
                {punch.endtime == null ? (
                  <Card.Footer key={punch.id}>
                    <Button variant="primary" onClick={clockOut}>Clock-Out</Button>
                  </Card.Footer>
                ) : (
                    ""
                  )}
              </Card>
            </>
          );
        })}
      </CardDeck>
    </>
  );
};

export default TimeParams;
