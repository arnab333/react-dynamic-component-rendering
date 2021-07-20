import moment from 'moment';

export const manageChartData = ({
  phenomList,
  locationID,
  locationAveragesList,
  chartColor,
}) => {
  if (
    phenomList &&
    locationAveragesList &&
    phenomList.length > 0 &&
    locationAveragesList.length > 0
  ) {
    const tempArray = [];
    locationAveragesList.forEach((item) => {
      const sensorsValues = item?.Dnum;
      const timeStamp = item?.TS;

      if (timeStamp && sensorsValues && Object.keys(sensorsValues).length > 0) {
        for (const key in sensorsValues) {
          const match = phenomList.find(
            (item) => item.shortName.toUpperCase() === key.toUpperCase()
          );

          if (match) {
            const tempObj = {
              locationID,
              shortName: match.shortName,
              label: `${match.longName} (${match.units})`,
              borderColor: chartColor ?? match.graphColour,
              units: match.units,
              data: [],
            };
            const dataObj = {
              x: moment.utc(timeStamp).format('YYYY-MM-DD HH:mm:ss'),
              y: sensorsValues[key],
            };
            tempObj.data.push(dataObj);

            tempArray.push(tempObj);
          }
        }
      }
    });
    // console.log('tempArray', tempArray);
    const tempArray2: ChartListType[] = tempArray.reduce(
      mergeEquallyLabeledTypes,
      {
        store: {},
        list: [],
      }
    ).list;
    // console.log('tempArray2', tempArray2);
    return tempArray2;
  }
};

const mergeEquallyLabeledTypes = (collector, type) => {
  const key = type.shortName; // identity key.
  const store = collector.store;
  const storedType = store[key];
  if (storedType) {
    // merge `children` of identically named types.
    storedType.data = storedType.data.concat(type.data);
  } else {
    store[key] = type;
    collector.list.push(type);
  }
  return collector;
};

export const manageGaugeData = ({
  phenomList,
  gaugeSensors,
  locationID = '',
  chartColor,
}) => {
  if (
    phenomList &&
    phenomList.length > 0 &&
    gaugeSensors &&
    Object.keys(gaugeSensors).length > 0
  ) {
    const tempGauges = [];
    for (const key in gaugeSensors) {
      const match = phenomList.find(
        (item) => item.shortName.toUpperCase() === key.toUpperCase()
      );

      if (match) {
        let minScale = match.minScale;
        let maxScale = match.maxScale;
        if (minScale === undefined || minScale === null) {
          minScale = 0;
        }
        if (maxScale === undefined || maxScale === null || maxScale === 0) {
          maxScale = 100;
        }
        const tempObj = {
          locationID: locationID || '',
          compass: match.compass,
          shortName: match.shortName,
          longName: match.longName,
          graphColor: chartColor ?? match.graphColour,
          minScale,
          maxScale,
          // amberPoint: match.amberPoint, // will be removed
          // redPoint: match.redPoint, // will be removed
          markers: match.markers,
          units: match.units,
          actualValue: gaugeSensors[key],
          needleValue:
            gaugeSensors[key] > maxScale ? maxScale : gaugeSensors[key],
        };

        tempGauges.push(tempObj);
      }
    }

    return tempGauges;
  }
};
