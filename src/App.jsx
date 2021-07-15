import { Fragment, Component } from 'react';
import { Row, Col, Select, Button } from 'antd';
import { Resizable as ReResizable } from 're-resizable';
import Draggable from 'react-draggable';
import { Line as LineChart } from 'react-chartjs-2';
// import update from 'immutability-helper';

import { componentTypes, resizableCursorTypes } from './components/App/helpers';
import AntdCard from './shared/components/AntdCard';
import axios from 'axios';
import { manageChartData } from './shared/utils';

import cssStyles from './components/App/styles/app.module.css';

class App extends Component {
  state = {
    chartData: [],
    sensorTypes: [],
    selectedComponent: '',

    isDraggable: true,

    selectedSensors: [],

    selectedCharts: [],
  };

  draggableRefs = [];

  handleState = (data) => {
    this.setState((prev) => {
      return {
        ...prev,
        ...data,
      };
    });
  };

  componentDidMount() {
    // document.addEventListener(
    //   'mouseover',
    //   (e) => {
    //     const cursor = e.target?.style?.cursor;
    //     console.log('e', e);
    //     if (
    //       cursor === 'col-resize' ||
    //       cursor === 'se-resize' ||
    //       cursor === 'row-resize' ||
    //       cursor === 'ne-resize' ||
    //       cursor === 'nw-resize' ||
    //       cursor === 'sw-resize'
    //     ) {
    //       this.handleState({ isDraggable: false });
    //     } else if (cursor === 'move') {
    //       this.handleState({ isDraggable: true });
    //     }
    //   },
    //   false
    // );

    Promise.all([
      axios.get(`https://apidev.airsensa.io/api/V03/locations/MANCHESTER0004`, {
        headers: { 'X-API-KEY': 'onetoken' },
      }),
      axios.get(
        `https://apidev.airsensa.io/api/V03/locations/MANCHESTER0004/tsd.json?lasthours=3`,
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
            });

            if (tempChartData) {
              const tempSensorTypes = tempChartData.map((el) => ({
                text: el.shortName,
                value: el.shortName,
              }));
              this.handleState({
                chartData: tempChartData.map((el) => ({
                  ...el,
                  isDraggable: true,
                })),
                sensorTypes: tempSensorTypes,
              });
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedCharts.length > prevState.selectedCharts.length) {
      const elementsList = document.getElementsByClassName('sensors');

      if (elementsList.length > 0) {
        for (let index = 0; index < elementsList.length; index++) {
          const element = elementsList[index];

          if (!element.mouseover) {
            const phName = element?.classList?.[1];

            element.addEventListener(
              'mouseover',
              (e) => {
                const { selectedCharts } = this.state;
                const cursor = e.target?.style?.cursor;
                if (resizableCursorTypes.includes(cursor)) {
                  const temp = selectedCharts.map((el) => {
                    if (el.shortName === phName) {
                      return { ...el, isDraggable: false };
                    }
                    return { ...el };
                  });

                  this.handleState({ selectedCharts: temp });
                } else if (
                  cursor === 'move' ||
                  (typeof cursor === 'string' &&
                    !resizableCursorTypes.includes(cursor))
                ) {
                  const temp = selectedCharts.map((el) => {
                    if (el.shortName === phName) {
                      return { ...el, isDraggable: true };
                    }
                    return { ...el };
                  });

                  this.handleState({ selectedCharts: temp });
                }
              },
              false
            );
          }
        }
      }
    }
  }

  handleComponentSelect = (value) => {
    this.handleState({ selectedComponent: value });
  };

  handleSensorType = (value) => {
    const { chartData } = this.state;
    const temp = chartData.filter((el) => value.includes(el.shortName));
    this.handleState({ selectedSensors: value, selectedCharts: temp });
  };

  onDragStop = (e, data) => {
    const { selectedCharts } = this.state;
    const phName = data?.node?.classList?.[1];

    if (phName) {
      const temp = selectedCharts.map((el) => {
        if (el.shortName === phName) {
          return { ...el, position: { x: data?.x, y: data?.y } };
        }
        return { ...el };
      });

      this.handleState({ selectedCharts: temp });
    }
  };

  setRef = (ref) => {
    const matched =
      this.draggableRefs.length > 0 &&
      this.draggableRefs.find(
        (el) => el?._reactInternals?.key === ref?._reactInternals?.key
      );

    if (ref && this.draggableRefs.length === 0) {
      this.draggableRefs.push(ref);
    } else if (ref?._reactInternals?.key && !matched) {
      this.draggableRefs.push(ref);
    }
  };

  // onResizeStop = (event, direction, refToElement, delta) => {
  //   const { selectedCharts } = this.state;

  //   const elementsList = document.getElementsByClassName('sensors');

  //   for (let index = 0; index < elementsList.length; index++) {
  //     const element = elementsList[index];
  //     console.log(element.clientWidth);
  //     const phName = element?.classList?.[1];
  //     const temp = selectedCharts.map((el) => {
  //       if (el.shortName === phName) {
  //         return {
  //           ...el,
  //           size: { width: element.clientWidth, height: element.clientHeight },
  //         };
  //       }
  //       return { ...el };
  //     });

  //     this.handleState({ selectedCharts: temp });
  //   }
  // };

  render() {
    const { selectedComponent, sensorTypes, selectedSensors, selectedCharts } =
      this.state;

    return (
      <Fragment>
        <Row justify="center">
          <Col xs={23}>
            <Row style={{ paddingTop: 8, paddingBottom: 8, marginBottom: 16 }}>
              <Col xs={24}>
                <AntdCard elevate>
                  <Row justify="center" gutter={16} align="middle">
                    <Col xs={24} md={6}>
                      <label htmlFor="cmp">Select Component...</label>
                      <Select
                        id="cmp"
                        value={selectedComponent}
                        placeholder="Select Component..."
                        onChange={this.handleComponentSelect}
                        style={{ width: '100%' }}>
                        {componentTypes.map((el) => {
                          return (
                            <Fragment key={el.value}>
                              <Select.Option value={el.value}>
                                {el.text}
                              </Select.Option>
                            </Fragment>
                          );
                        })}
                      </Select>
                    </Col>

                    <Col xs={24} md={6}>
                      <label htmlFor="sensor">Select Sensor...</label>
                      <Select
                        id="sensor"
                        mode="multiple"
                        allowClear
                        value={selectedSensors}
                        placeholder="Select Sensor..."
                        onChange={this.handleSensorType}
                        style={{ width: '100%' }}>
                        {sensorTypes.length > 0 &&
                          sensorTypes.map((el) => {
                            return (
                              <Fragment key={el.value}>
                                <Select.Option value={el.value}>
                                  {el.text}
                                </Select.Option>
                              </Fragment>
                            );
                          })}
                      </Select>
                    </Col>
                    <Col xs={24} md={4}>
                      <label htmlFor="">&nbsp;</label>
                      <Button block type="primary" htmlType="button">
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </AntdCard>
              </Col>
            </Row>

            {/* Dynamic Content */}

            {selectedCharts.map((el) => {
              return (
                <Draggable
                  disabled={!el.isDraggable}
                  key={el.shortName}
                  defaultClassName={`sensors ${el.shortName ?? ''} ${
                    cssStyles.sensors
                  }`}
                  onStop={this.onDragStop}
                  position={el.position}
                  ref={this.setRef}>
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
                      topRight: true,
                      bottomRight: true,
                      bottomLeft: true,
                      topLeft: true,
                    }}>
                    <LineChart
                      // ref={this.setRef}
                      data={{ datasets: [el] }}
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
                  </ReResizable>
                </Draggable>
              );
            })}

            {/* <Draggable defaultClassName="testing">
              <ReResizable
                style={{
                  border: '1px solid blue',
                  textAlign: 'center',
                  cursor: 'move',
                }}
                defaultSize={{
                  width: 320,
                  height: 200,
                }}>
                8
              </ReResizable>
            </Draggable> */}
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default App;
