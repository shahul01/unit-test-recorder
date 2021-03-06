const circularReference = (a) => {
  const obj = { a };
  obj.obj = obj;
  return obj;
};

const returnAFunction = (a, f2) => b => a + f2(b);

const getElapsedTime = (start, end) => {
  const y2k = new Date('2000-01-31T18:30:00.000Z');
  const delta = end.getTime() - start.getTime();
  const result = new Date();
  result.setTime(y2k.getTime() + delta);
  return result;
};

const returnsNaN = a => Number.parseFloat(a);

module.exports = {
  circularReference,
  returnAFunction,
  getElapsedTime,
  returnsNaN,
};
