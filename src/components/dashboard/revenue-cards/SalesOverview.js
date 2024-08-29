import React from "react";
import { Card, CardBody, CardTitle, CardSubtitle, Col, Row } from "reactstrap";

import Chart from "react-apexcharts";

const SalesOverview = (props) => {
  console.log("props", props);
  console.log(props.data.machineCountsArray);
  const optionssalesoverview = {
    grid: {
      show: true,
      borderColor: "rgba(0,0,0,.3)",
      strokeDashArray: 2,
      padding: {
        left: 0,
        right: 0,
        bottom: 0,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "15%",
        endingShape: "flat",
      },
    },
    colors: ["#4aff2b", "#ffb22b"],
    fill: {
      type: "solid",
      opacity: 1,
    },
    chart: {
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    legend: {
      show: false,
    },
    xaxis: {
      type: "category",
      categories: props.data.machineList,
      // categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      labels: {
        style: {
          cssClass: "grey--text lighten-2--text fill-color",
        },
      },
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          cssClass: "grey--text lighten-2--text fill-color",
        },
      },
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    tooltip: {
      theme: "dark",
    },
  };
  // const seriessalesoverview = [
  //   {
  //     name: "Required Prod.",
  //     data: props.data.machineRPList,
  //   },
  //   {
  //     name: "Actual Prod.",
  //     data: props.data.machineAPList,
  //   },
  // ];
  return (
    /*--------------------------------------------------------------------------------*/
    /* Used In Dashboard-1                                                            */
    /*--------------------------------------------------------------------------------*/
    <Card>
      <CardBody>
        <Row>
          <Col xs="12">
            <div className="d-flex flex-wrap">
              <div>
                <CardTitle>Machine Overview</CardTitle>
                {/* <CardSubtitle>Ample Admin Vs Pixel Admin</CardSubtitle> */}
              </div>
              <div className="ml-auto">
                <div className="d-flex no-block align-items-center justify-content-center">
                  <div>
                    <h6 className="text-warning">
                      <i className="fa fa-circle font-10 mr-2" />
                      Actual Production
                    </h6>
                  </div>
                  <div className="ml-3">
                    <h6 style={{ color: "#4aff2b" }}>
                      <i className="fa fa-circle font-10 mr-2" />
                      Required Production
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col xs="12">
            {props && props.data && (
              <Chart
                options={optionssalesoverview}
                series={props.data.machineCountsArray}
                // series={seriessalesoverview}
                type="bar"
                height="308px"
              />
            )}
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default SalesOverview;
