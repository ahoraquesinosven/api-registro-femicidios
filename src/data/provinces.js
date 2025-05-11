const PROVINCES = [
    { code: "caba", display: "Ciudad Autonoma de Buenos Aires", },
    { code: "ba", display: "Provincia de Buenos Aires", },
]
export default {
  all: PROVINCES,
  codes: PROVINCES.map(p => p.code),
};
