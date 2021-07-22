import { Fragment, Component } from 'react';
import { Row, Col, Button, Popover, message } from 'antd';
import { Resizable as ReResizable } from 're-resizable';
import Draggable from 'react-draggable';
import { Line as LineChart } from 'react-chartjs-2';
import update from 'immutability-helper';
import { HiOutlineCog } from 'react-icons/hi';
import { IoIosArrowDown } from 'react-icons/io';
import axios from 'axios';

import { resizableCursorTypes } from './components/App/helpers';
import { manageChartData, manageGaugeData } from './shared/utils';

import PopupContent from './components/PopupContent';
import AntdCard from './shared/components/AntdCard';
import ReactSpeedoMeter from './shared/components/ReactSpeedoMeter';

class App extends Component {
  state = {
    locationList: [],
    customizableDivs: [],
    timeData: [],
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

                  if (matched?.isDraggable !== false) {
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

                  if (matched?.isDraggable !== true) {
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
      // id: shortUuid().new(),
      id: `id_${customizableDivs.length + 1}`,
      isDraggable: true,
      configDetails: {
        locationId: '',
        displayType: '',
        sensor: '',
        hours: '',
        color: '',
      },
      dragPosition: undefined,
      dimensions: undefined,
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
    const { customizableDivs, timeData } = this.state;

    let temp = [];

    if (name === 'hours') {
      temp = [...timeData];
      if (temp.length === 0) {
        temp.push({ id, value });
      } else {
        const matched = temp.find((el) => el.id === id);
        if (matched) {
          temp = temp.map((el) => {
            if (el.id === id) {
              return { ...el, value };
            }
            return { ...el };
          });
        } else {
          temp.push({ id, value });
        }
      }

      this.handleState({ timeData: temp });
    } else {
      temp = [...customizableDivs];
      temp = temp.map((el) => {
        if (el.id === id) {
          return {
            ...el,
            configDetails: { ...el.configDetails, [name]: value },
          };
        }
        return { ...el };
      });

      this.handleState({ customizableDivs: temp });
    }
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
    const { customizableDivs, timeData } = this.state;

    const matched = customizableDivs.find((el) => el.id === id);
    const matchedTime = timeData.find((el) => el.id === id);

    if (matched && matched.configDetails) {
      for (const key in matched.configDetails) {
        if (key !== 'hours' && !matched.configDetails[key]) {
          return message.error('Please fill all the fields!');
        }
      }

      let temp = [...customizableDivs];

      temp = temp.map((el) => {
        let obj = { ...el };
        if (obj.id === id) {
          obj = update(obj, {
            isConfigVisible: { $set: false },
            isLoading: { $set: true },
            configDetails: {
              hours: { $set: matchedTime?.value ?? obj.hours },
            },
          });
        }
        return { ...obj };
      });

      this.handleState({ customizableDivs: temp });

      if (matched?.configDetails?.displayType === 'chart') {
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
              matchedTime.value ? `?lasthours=${matchedTime.value}` : ''
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
                }
              } else {
                temp = temp.map((el) => {
                  let obj = { ...el };
                  if (obj.id === id) {
                    obj = update(obj, {
                      isConfigVisible: { $set: false },
                      isLoading: { $set: false },
                    });
                  }
                  return { ...obj };
                });

                this.handleState({ customizableDivs: temp });
              }
            }
          })
          .catch((error) => {
            message.error(error?.response?.data?.message ?? 'Error!');
            temp = temp.map((el) => {
              let obj = { ...el };
              if (obj.id === id) {
                obj = update(obj, {
                  isLoading: { $set: false },
                });
              }
              return { ...obj };
            });

            this.handleState({ customizableDivs: temp });
          });
      } else {
        Promise.all([
          axios.get(
            `https://apidev.airsensa.io/api/V03/locations/${matched.configDetails.locationId}`,
            {
              headers: { 'X-API-KEY': 'onetoken' },
            }
          ),
          axios.get(
            `https://apidev.airsensa.io/api/V03/locations/${matched.configDetails.locationId}/latest.json`,
            {
              headers: { 'X-API-KEY': 'onetoken' },
            }
          ),
        ])
          .then((responses) => {
            if (responses.length > 0) {
              const locationData = responses?.[0].data?.data;
              const latestData = responses?.[1].data?.data?.latestData;

              if (latestData && locationData) {
                const tempGaugeData = manageGaugeData({
                  chartColor: matched?.configDetails?.color,
                  phenomList: locationData?.sensorSpecs,
                  locationID: locationData?.locationID,
                  gaugeSensors: latestData?.Dnum,
                });

                if (tempGaugeData) {
                  const tempGaugeMatch = tempGaugeData.find((element) => {
                    return (
                      element?.shortName?.toUpperCase() ===
                      matched?.configDetails?.sensor?.toUpperCase()
                    );
                  });

                  temp = temp.map((el) => {
                    let obj = { ...el };

                    if (obj.id === id) {
                      obj = update(obj, {
                        chartData: { $set: {} },
                        gaugeData: { $set: tempGaugeMatch ?? {} },
                        isConfigVisible: { $set: false },
                        isLoading: { $set: false },
                      });
                    }
                    return { ...obj };
                  });

                  this.handleState({ customizableDivs: temp });
                }
              }
            }
          })
          .catch((error) => {
            message.error(error?.response?.data?.message ?? 'Error!');
            temp = temp.map((el) => {
              let obj = { ...el };
              if (obj.id === id) {
                obj = update(obj, {
                  isLoading: { $set: false },
                });
              }
              return { ...obj };
            });

            this.handleState({ customizableDivs: temp });
          });
      }
    }
  };

  onDeleteClick = (id) => {
    const { customizableDivs } = this.state;
    let temp = [...customizableDivs];
    temp = temp.filter((el) => el.id !== id);

    this.handleState({ customizableDivs: temp });
  };

  onResizeStop = (event, direction, refToElement, delta, id) => {
    const { customizableDivs } = this.state;
    let temp = [...customizableDivs];
    if (id) {
      const domElement = document?.querySelector?.(`.${id}`);
      if (domElement?.clientHeight && domElement?.clientWidth) {
        temp = temp.map((el) => {
          let obj = { ...el };

          if (el.id === id) {
            obj = update(obj, {
              dimensions: {
                $set: {
                  width: domElement.clientWidth,
                  height: domElement.clientHeight,
                },
              },
            });
          }
          return { ...obj };
        });
      }

      this.handleState({ customizableDivs: temp });
    }
  };

  render() {
    const { customizableDivs, locationList, timeData } = this.state;

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
          </Col>
        </Row>

        {customizableDivs.length > 0 &&
          customizableDivs.map((el, idx) => {
            const matchTime = timeData.find((elem) => elem.id === el.id);
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
                    onResizeStop={(event, direction, refToElement, delta) =>
                      this.onResizeStop(
                        event,
                        direction,
                        refToElement,
                        delta,
                        el.id
                      )
                    }
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
                    <AntdCard
                      loading={el.isLoading}
                      style={{ height: '100%' }}
                      bodyStyle={{
                        height: '100%',
                        padding: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Popover
                        overlayStyle={{ width: 300 }}
                        content={
                          <Fragment>
                            <PopupContent
                              {...el.configDetails}
                              hours={
                                matchTime?.value ??
                                el?.configDetails?.hours ??
                                ''
                              }
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
                          style={{
                            cursor: 'pointer',
                            position: 'absolute',
                            top: 5,
                            left: 5,
                          }}
                        />
                      </Popover>

                      {el?.configDetails?.displayType === 'chart' && (
                        <Fragment>
                          {el.chartData &&
                          Object.keys(el.chartData).length > 0 ? (
                            <Fragment>
                              <LineChart
                                data={{ datasets: [el.chartData] }}
                                options={{
                                  scales: {
                                    xAxes: [
                                      {
                                        type: 'time',
                                        time: {
                                          unit:
                                            Number(el.configDetails.hours) > 24
                                              ? 'day'
                                              : 'hour',
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
                      )}

                      {el?.configDetails?.displayType === 'gauge' && (
                        <Fragment>
                          {el.gaugeData &&
                          Object.keys(el.gaugeData).length > 0 ? (
                            <Fragment>
                              <label
                                style={{
                                  position: 'absolute',
                                  top: 5,
                                  fontSize: 16,
                                }}>
                                <strong>{`${el?.gaugeData?.longName}(${el?.gaugeData?.shortName})`}</strong>
                              </label>
                              <Row justify="center" align="middle">
                                <Col>
                                  <ReactSpeedoMeter
                                    {...el.gaugeData}
                                    speedoMeterProps={{
                                      width: el?.dimensions?.width
                                        ? el?.dimensions?.width -
                                          (el?.dimensions?.width * 20) / 100
                                        : 320 - (320 * 20) / 100,
                                      height: el?.dimensions?.height
                                        ? el?.dimensions?.height -
                                          (el?.dimensions?.height * 20) / 100
                                        : 200 - (200 * 20) / 100,
                                      textColor: el.gaugeData?.graphColor,
                                    }}
                                  />
                                </Col>
                              </Row>
                            </Fragment>
                          ) : (
                            <Fragment>No Data Found!</Fragment>
                          )}
                        </Fragment>
                      )}
                    </AntdCard>
                    <IoIosArrowDown
                      style={{
                        position: 'absolute',
                        marginLeft: 'auto',
                        bottom: 0,
                        right: 0,
                        transform: `rotate(-45deg)`,
                      }}
                      size="1.2em"
                    />
                  </ReResizable>
                </Draggable>
              </Fragment>
            );
          })}
      </Fragment>
    );
  }
}

export default App;
