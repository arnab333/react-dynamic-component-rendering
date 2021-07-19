import { Fragment, Component } from 'react';
import { Row, Col, Button, Input, Select, Popover } from 'antd';
import { SketchPicker } from 'react-color';
import { displayTypes, sensorTypes, timeList } from '../App/helpers';

class PopupContent extends Component {
  state = {
    background: '#fff',
    show: false,
  };

  handleChangeComplete = (color) => {
    this.setState({ background: color.hex }, () => {
      const { handleInputChange, id } = this.props;
      handleInputChange(color.hex, 'color', id);
    });
  };

  handleVisibility = (visible) => {
    const { onDisableMove, id } = this.props;
    onDisableMove(id, visible);
  };

  render() {
    const {
      locations,
      locationId,
      handleInputChange,
      id,
      displayType,
      sensor,
      color,
      hours,
      isColorVisible,
      onSubmitClick,
      onDeleteClick,
    } = this.props;
    const { background } = this.state;

    return (
      <Fragment>
        <Row>
          <Col xs={10}>Location Id:</Col>
          <Col xs={14}>
            <Select
              id="locationId"
              showSearch
              style={{ width: '100%' }}
              placeholder="Search Location Id"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              filterSort={(optionA, optionB) =>
                optionA.children
                  .toLowerCase()
                  .localeCompare(optionB.children.toLowerCase())
              }
              value={locationId}
              onChange={(value) => handleInputChange(value, 'locationId', id)}>
              {locations?.map((el) => {
                return (
                  <Fragment key={el}>
                    <Select.Option value={el}>{el}</Select.Option>
                  </Fragment>
                );
              })}
            </Select>
          </Col>
        </Row>

        <Row justify="space-around" style={{ paddingTop: 10 }}>
          <Col xs={10}>Display Type:</Col>
          <Col xs={14}>
            <Select
              id="displayType"
              value={displayType}
              style={{ width: '100%' }}
              placeholder="Select Display Type"
              onChange={(value) => handleInputChange(value, 'displayType', id)}>
              {displayTypes.map((el) => {
                return (
                  <Fragment key={el.value}>
                    <Select.Option value={el.value}>{el.text}</Select.Option>
                  </Fragment>
                );
              })}
            </Select>
          </Col>
        </Row>

        <Row justify="space-around" style={{ paddingTop: 10 }}>
          <Col xs={10}>Sensor:</Col>
          <Col xs={14}>
            <Select
              id="sensor"
              value={sensor}
              style={{ width: '100%' }}
              placeholder="Select Sensor"
              onChange={(value) => handleInputChange(value, 'sensor', id)}>
              {sensorTypes.map((el) => {
                return (
                  <Fragment key={el.value}>
                    <Select.Option value={el.value}>{el.text}</Select.Option>
                  </Fragment>
                );
              })}
            </Select>
          </Col>
        </Row>

        <Row justify="space-around" style={{ paddingTop: 10 }}>
          <Col xs={10}>Color:</Col>
          <Col xs={14}>
            <Popover
              trigger="click"
              visible={isColorVisible}
              onVisibleChange={this.handleVisibility}
              content={
                <SketchPicker
                  color={background}
                  onChangeComplete={this.handleChangeComplete}
                />
              }>
              <Input value={color} readOnly style={{ cursor: 'pointer' }} />
            </Popover>
          </Col>
        </Row>

        <Row justify="space-around" style={{ paddingTop: 10 }}>
          <Col xs={10}>Hours:</Col>
          <Col xs={14}>
            <Select
              id="hours"
              value={hours}
              style={{ width: '100%' }}
              placeholder="Select Sensor"
              onChange={(value) => handleInputChange(value, 'hours', id)}>
              {timeList.map((el) => {
                return (
                  <Fragment key={el.value}>
                    <Select.Option value={el.value}>{el.text}</Select.Option>
                  </Fragment>
                );
              })}
            </Select>
          </Col>
        </Row>

        <Row style={{ paddingTop: 10 }} justify="end">
          <Col>
            <Button
              type="primary"
              danger
              htmlType="button"
              block
              onClick={() => onDeleteClick(id)}>
              Delete
            </Button>
          </Col>
          <Col offset={1}>
            <Button
              type="primary"
              htmlType="button"
              block
              onClick={() => onSubmitClick(id)}>
              Submit
            </Button>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default PopupContent;
