const fileArray = (files, basePath) => {
  let result = [];
  if (files && Array.isArray(files) && files.length > 0) {
    files.map((file) => {
      result.push(`${basePath}${file.filename}`);
    });
  }

  return result;
};

export default fileArray;
