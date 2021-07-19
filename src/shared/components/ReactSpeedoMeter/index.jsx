import { Fragment, memo } from 'react';
import SpeedoMeter from 'react-d3-speedometer';

const ReactSpeedoMeter = ({
  needleValue,
  minScale,
  maxScale,
  actualValue,
  units,
  markers,
  // amberPoint,
  // redPoint,
  shortName,
  // speedo meter props
  speedoMeterProps,
}) => {
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
        needleColor={speedoMeterProps?.needleColor || 'black'}
        ringWidth={speedoMeterProps?.ringWidth || 12}
        needleHeightRatio={speedoMeterProps?.needleHeightRatio || 0.7}
        textColor={speedoMeterProps?.textColor || 'rgba(0,0,0,.65)'}
        width={speedoMeterProps?.width || 140}
        height={speedoMeterProps?.height || 110}
        valueTextFontSize={speedoMeterProps?.valueTextFontSize || '12px'}
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
};

export default memo(ReactSpeedoMeter);
