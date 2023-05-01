const FIRST_PART_START = 0;
const FIRST_PART_END = 5;
const SECOND_PART_START = 38;

export const truncateAddress = (address: string): string => {
  const firstPart = address.slice(FIRST_PART_START, FIRST_PART_END);
  const secondPart = address.slice(SECOND_PART_START);

  return firstPart + "..." + secondPart;
};
