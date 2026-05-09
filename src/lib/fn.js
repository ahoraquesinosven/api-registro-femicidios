export const filterEntries = (obj, predicate) =>
  Object.fromEntries(
    Object.entries(obj).filter(predicate)
  );

export const pick = (obj, keys) => {
  const keySet = new Set(keys);
  return filterEntries(obj, ([key]) => keySet.has(key));
}

export const omit = (obj, keys) => {
  const keySet = new Set(keys);
  return filterEntries(obj, ([key]) => !keySet.has(key));
}
