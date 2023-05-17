export const isNumeric = (data: any) => {
  if (typeof data != "string") {
    return false;
  }

  return /^(?:\d+|\d*\.\d+)/.test(data);
};
