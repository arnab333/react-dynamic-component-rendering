import { Fragment, Component } from 'react';
import { Row, Col, Button, Popover, message } from 'antd';
import { Resizable as ReResizable } from 're-resizable';
import Draggable from 'react-draggable';
import { Line as LineChart } from 'react-chartjs-2';
import update from 'immutability-helper';

import { HiOutlineCog } from 'react-icons/hi';

import {
  resizableCursorTypes,
  // componentTypes,
} from './components/App/helpers';
// import AntdCard from './shared/components/AntdCard';
import axios from 'axios';
import { manageChartData } from './shared/utils';

// import cssStyles from './components/App/styles/app.module.css';
import { v4 } from 'uuid';
import PopupContent from './components/PopupContent';
// import ReactSpeedoMeter from './shared/components/ReactSpeedoMeter';

class App extends Component {
  state = {
    locationList: [],
    customizableDivs: [],
  };

  draggableRefs = [];

  componentDidMount() {
    axios
      .get(`https://apidev.airsensa.io/api/V03/locations`, {
        headers: { 'X-API-KEY': 'onetoken' },
      })
      .then((response) => {
        if (response.data?.data) {
          const temp = response.data.data.map((el) => el.locationID);
          this.handleState({ locationList: temp });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.customizableDivs.length > prevState.customizableDivs.length
    ) {
      const elementsList = document.getElementsByClassName('sensors');

      if (elementsList.length > 0) {
        for (let index = 0; index < elementsList.length; index++) {
          const element = elementsList[index];

          if (!element.mouseover) {
            const id = element?.classList?.[1];

            element.addEventListener(
              'mouseover',
              (e) => {
                const { customizableDivs } = this.state;
                const cursor = e.target?.style?.cursor;
                if (resizableCursorTypes.includes(cursor)) {
                  const matched = customizableDivs.find((el) => el.id === id);

                  if (matched.isDraggable !== false) {
                    const temp = customizableDivs.map((el) => {
                      if (el.id === id) {
                        return { ...el, isDraggable: false };
                      }
                      return { ...el };
                    });

                    this.handleState({ customizableDivs: temp });
                  }
                } else if (
                  cursor === 'move' ||
                  (typeof cursor === 'string' &&
                    !resizableCursorTypes.includes(cursor))
                ) {
                  const matched = customizableDivs.find((el) => el.id === id);

                  if (matched.isDraggable !== true) {
                    const temp = customizableDivs.map((el) => {
                      if (el.id === id) {
                        return { ...el, isDraggable: true };
                      }
                      return { ...el };
                    });

                    this.handleState({ customizableDivs: temp });
                  }
                }
              },
              false
            );
          }
        }
      }
    }
  }

  handleState = (data) => {
    this.setState((prev) => {
      return {
        ...prev,
        ...data,
      };
    });
  };

  onDragStop = (id, data) => {
    const { customizableDivs } = this.state;

    let temp = [...customizableDivs];

    temp = temp.map((el) => {
      let obj = { ...el };

      if (obj.id === id) {
        obj = update(obj, {
          dragPosition: {
            $set: { x: data?.x, y: data?.y },
          },
        });
      }
      return { ...obj };
    });

    this.handleState({ customizableDivs: temp });
  };

  onCreateDiv = () => {
    const { customizableDivs } = this.state;

    const tempObj = {
      id: v4(),
      isDraggable: true,
      configDetails: {
        locationId: '',
        displayType: '',
        sensor: '',
        hours: '',
        color: '',
      },
      dragPosition: undefined,
      isConfigVisible: false,
      isColorVisible: false,
      isLoading: false,
      chartData: {},
      gaugeData: {},
    };

    const temp = update(customizableDivs, {
      $push: [tempObj],
    });

    this.handleState({ customizableDivs: temp });
  };

  handleVisibility = (visible, id) => {
    const { customizableDivs } = this.state;

    let temp = [...customizableDivs];
    temp = temp.map((el) => {
      if (el.id === id) {
        return {
          ...el,
          isConfigVisible: visible,
        };
      }
      return { ...el };
    });

    this.handleState({ customizableDivs: temp });
  };

  handleInputChange = (value, name, id) => {
    const { customizableDivs } = this.state;

    let temp = [...customizableDivs];

    temp = temp.map((el) => {
      if (el.id === id) {
        return { ...el, configDetails: { ...el.configDetails, [name]: value } };
      }
      return { ...el };
    });

    this.handleState({ customizableDivs: temp });
  };

  onDisableMove = (id, visible) => {
    const { customizableDivs } = this.state;

    let temp = [...customizableDivs];

    temp = temp.map((el) => {
      let tempObj = { ...el };
      if (tempObj.id === id) {
        tempObj = update(tempObj, {
          isDraggable: { $set: !visible },
          isColorVisible: { $set: visible },
        });
      }
      return { ...tempObj };
    });

    this.handleState({ customizableDivs: temp });
  };

  onSubmitClick = (id) => {
    const { customizableDivs } = this.state;

    const matched = customizableDivs.find((el) => el.id === id);

    if (matched && matched.configDetails) {
      for (const key in matched.configDetails) {
        if (!matched.configDetails[key]) {
          return message.error('Please fill all the fields!');
        }
      }

      (() => {
        let temp = [...customizableDivs];
        temp = temp.map((el) => {
          let obj = { ...el };
          if (obj.id === id) {
            obj = update(obj, {
              isConfigVisible: { $set: false },
              isLoading: { $set: true },
            });
          }
          return { ...obj };
        });

        this.handleState({ customizableDivs: temp });
      })();

      Promise.all([
        axios.get(
          `https://apidev.airsensa.io/api/V03/locations/${matched.configDetails.locationId}`,
          {
            headers: { 'X-API-KEY': 'onetoken' },
          }
        ),
        axios.get(
          `https://apidev.airsensa.io/api/V03/locations/${
            matched.configDetails.locationId
          }/tsd.json${
            matched.configDetails.hours
              ? `?lasthours=${matched.configDetails.hours}`
              : ''
          }`,
          {
            headers: { 'X-API-KEY': 'onetoken' },
          }
        ),
      ])
        .then((responses) => {
          if (responses.length > 0) {
            const locationData = responses?.[0].data?.data;
            const timeSeriesData = responses?.[1].data?.data?.timeSeriesData;

            if (timeSeriesData && locationData) {
              const tempChartData = manageChartData({
                phenomList: locationData?.sensorSpecs,
                locationID: locationData?.locationID,
                locationAveragesList: timeSeriesData,
                chartColor: matched?.configDetails?.color,
              });

              if (tempChartData) {
                const tempChartMatch = tempChartData.find((element) => {
                  return (
                    element?.shortName?.toUpperCase() ===
                    matched?.configDetails?.sensor?.toUpperCase()
                  );
                });

                (() => {
                  let temp = [...customizableDivs];
                  temp = temp.map((el) => {
                    let obj = { ...el };

                    if (obj.id === id) {
                      obj = update(obj, {
                        chartData: { $set: tempChartMatch ?? {} },
                        gaugeData: { $set: {} },
                        isConfigVisible: { $set: false },
                        isLoading: { $set: false },
                      });
                    }
                    return { ...obj };
                  });

                  this.handleState({ customizableDivs: temp });
                })();
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  onDeleteClick = (id) => {
    const { customizableDivs } = this.state;
    let temp = [...customizableDivs];
    temp = temp.filter((el) => el.id !== id);

    this.handleState({ customizableDivs: temp });
  };

  render() {
    const { customizableDivs, locationList } = this.state;

    return (
      <Fragment>
        <Row justify="center">
          <Col xs={23}>
            <Row justify="center" style={{ paddingTop: 16 }} gutter={[0, 16]}>
              <Col>
                <Button
                  block
                  type="primary"
                  htmlType="button"
                  onClick={this.onCreateDiv}>
                  Create Div
                </Button>
              </Col>
            </Row>

            <Row>
              {customizableDivs.length > 0 &&
                customizableDivs.map((el, idx) => {
                  return (
                    <Fragment key={el.id}>
                      <Draggable
                        disabled={!el.isDraggable}
                        defaultClassName={`sensors ${el.id}`}
                        onStop={(e, data) => this.onDragStop(el.id, data)}
                        position={el.dragPosition}>
                        <ReResizable
                          style={{
                            border: '1px solid blue',
                            textAlign: 'center',
                            cursor: 'move',
                          }}
                          defaultSize={{
                            width: 320,
                            height: 200,
                          }}
                          // size={el.size}
                          // onResizeStop={this.onResizeStop}
                          enable={{
                            top: false,
                            right: false,
                            bottom: false,
                            left: false,
                            topRight: false,
                            bottomRight: true,
                            bottomLeft: false,
                            topLeft: false,
                          }}>
                          <Row style={{ padding: 8 }} className="popover-row">
                            <Col>
                              <Popover
                                overlayStyle={{ width: 300 }}
                                content={
                                  <Fragment>
                                    <PopupContent
                                      {...el.configDetails}
                                      isColorVisible={el.isColorVisible}
                                      isConfigVisible={el.isConfigVisible}
                                      locations={locationList}
                                      id={el.id}
                                      handleInputChange={this.handleInputChange}
                                      onDisableMove={this.onDisableMove}
                                      onSubmitClick={this.onSubmitClick}
                                      onDeleteClick={this.onDeleteClick}
                                    />
                                  </Fragment>
                                }
                                // placement="bottom"
                                trigger="click"
                                visible={el.isConfigVisible}
                                onVisibleChange={(visible) =>
                                  this.handleVisibility(visible, el.id)
                                }>
                                <HiOutlineCog
                                  size="1.5em"
                                  style={{ cursor: 'pointer' }}
                                />
                              </Popover>
                            </Col>
                          </Row>
                          {el.configDetails.displayType === 'chart' ? (
                            <Fragment>
                              {el.chartData &&
                              Object.keys(el.chartData).length > 0 ? (
                                <Fragment>
                                  <LineChart
                                    // ref={this.setRef}
                                    data={{ datasets: [el.chartData] }}
                                    options={{
                                      scales: {
                                        xAxes: [
                                          {
                                            type: 'time',
                                            time: {
                                              unit: 'hour',
                                            },
                                          },
                                        ],
                                      },
                                      responsive: true,
                                    }}
                                  />
                                </Fragment>
                              ) : (
                                <Fragment>No Data Found!</Fragment>
                              )}
                            </Fragment>
                          ) : (
                            <Fragment></Fragment>
                          )}
                        </ReResizable>
                      </Draggable>
                    </Fragment>
                  );
                })}
            </Row>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default App;
