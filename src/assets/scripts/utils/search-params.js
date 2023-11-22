export const filterSearchParams = (searchParams, keyValuePairsToRemove = []) => {
  const paramsToRemove = [];
  searchParams.forEach((value, key) => {
    // Remove any empty params
    if (value === '') {
      return paramsToRemove.push(key);
    }
    // Remove any params with specific values
    keyValuePairsToRemove.forEach((keyValuePairToRemove) => {
      if (key === keyValuePairToRemove.key && value === keyValuePairToRemove.value) {
        paramsToRemove.push(key);
      }
    });
  });
  paramsToRemove.forEach((key) => {
    searchParams.delete(key);
  });
  return searchParams.toString();
};
