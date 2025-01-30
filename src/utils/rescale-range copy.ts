const rescale = (
  x: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number
) => {
  return ((newMax - newMin) / (oldMax - oldMin)) * (x - oldMin) + newMin;
};


export default rescale;