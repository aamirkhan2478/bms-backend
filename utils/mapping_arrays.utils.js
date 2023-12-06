const mappingArray = (array) => {
  let result;
  if (array && Array.isArray(array) && array.length > 0) {
    result = array.map((item) => item);
  }

  return result;
};

export default mappingArray;
