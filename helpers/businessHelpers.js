import ApiError from '../exceptions/api.error.js';

export function checkDefaultParams(params) {
  const arrayFromParams = Object.entries(params);

  if (arrayFromParams.length === 1 && arrayFromParams[0][1] === undefined) {
    console.log('yes');
    throw ApiError.badRequest(`You need to provide ${arrayFromParams[0][0]}!`);
  }

  const absentParams = arrayFromParams
    .filter((param) => param[1] === undefined)
    .map((param) => ' ' + param[0]);

  if (absentParams.length) {
    throw ApiError.badRequest(
      `You need to provide the following params:${[...absentParams]}`
  );
  }
}

export const handleGetRandomColor = (colors) => {
  const randomIndex = Math.floor(Math.random() * colors.length);

  return colors[randomIndex];
};

export function arraysAreEqual(arr1, arr2) {
  return (
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}
