import { Fragment, Component } from 'react';
import SpeedoMeter from 'react-d3-speedometer';

class ReactSpeedoMeter extends Component {
  state = { shouldUpdate: false };

  componentDidUpdate(prevProps, prevState) {
    const { speedoMeterProps } = this.props;

    if (
      (prevProps?.speedoMeterProps?.width !== speedoMeterProps?.width ||
        prevProps?.speedoMeterProps?.height !== speedoMeterProps?.height) &&
      prevState.shouldUpdate === false
    ) {
      this.setState({ shouldUpdate: true });
    }

    if (
      prevProps?.speedoMeterProps?.width === speedoMeterProps?.width &&
      prevProps?.speedoMeterProps?.height === speedoMeterProps?.height &&
      prevState.shouldUpdate === true
    ) {
      this.setState({ shouldUpdate: false });
    }
  }

  render() {
    const {
      needleValue,
      minScale,
      maxScale,
      actualValue,
      units,
      markers,
      // amberPoint,
      // redPoint,
      // shortName,
      // speedo meter props
      speedoMeterProps,
    } = this.props;

    const { shouldUpdate } = this.state;

    let customSegmentStops = [minScale];
    let segmentColors: string[] = [];
    markers.forEach((el) => {
      segmentColors.push(el.colour);
      if (el.value !== maxScale) {
        customSegmentStops.push(el.value);
      }
      // customSegmentStops.push(el.value);
    });
    customSegmentStops.push(maxScale);

    return (
      <Fragment>
        <SpeedoMeter
          //speedo meter props
          forceRender={shouldUpdate}
          needleColor={speedoMeterProps?.needleColor || 'black'}
          ringWidth={
            speedoMeterProps?.ringWidth || speedoMeterProps?.width / 12 || 12
          }
          needleHeightRatio={0.9}
          textColor={speedoMeterProps?.textColor || 'rgba(0,0,0,.65)'}
          width={speedoMeterProps?.width || 140}
          height={speedoMeterProps?.height || 110}
          valueTextFontSize={
            speedoMeterProps?.valueTextFontSize ||
            `${
              speedoMeterProps?.width / 32 > 12
                ? speedoMeterProps?.width / 32
                : 12
            }px`
          }
          labelFontSize={speedoMeterProps?.labelFontSize || '0px'}
          segmentColors={
            speedoMeterProps?.segmentColors || [...segmentColors] || [
              'rgb(61,204,91)',
              'rgb(239,214,19)',
              'rgb(255,84,84)',
            ]
          }
          // value props
          value={needleValue}
          minValue={minScale}
          maxValue={maxScale}
          currentValueText={`${actualValue}${units}`}
          // customSegmentStops={[minScale, amberPoint, redPoint, maxScale]}
          customSegmentStops={customSegmentStops}
        />
      </Fragment>
    );
  }
}

export default ReactSpeedoMeter;
