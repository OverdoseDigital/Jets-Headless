// Allows us to map a value from one number range to another
const mapRanges = (number, minIn, maxIn, minOut, maxOut) =>
  minOut + (maxOut - minOut) * ((number - minIn) / (maxIn - minIn));

export default mapRanges;
