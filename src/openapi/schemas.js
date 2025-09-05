import allGenders from "../data/genders.js";
import allProvinces from "../data/provinces.js";
import allCaseCategories from "../data/caseCategories.js";
import allMomentOfDays from "../data/momentsOfDay.js";
import allGeographicLocations from "../data/geographicLocations.js";
import allCasePlaces from "../data/places.js";
import allCaseMurderWeapons from "../data/murderWeapons.js";
import allCaseJudicialMeasures from "../data/judicialMeasures.js";
import allVictimBondAggressors from "../data/victimBondAggressor.js";
import allNationalities from "../data/nationalities.js";
import allCaseAggressorBehaviorsPostCase from "../data/behavioursPostCase.js";
import allCaseAggressorSecurityForces from "../data/securityForces.js";

export default {
  Gender: { enum: allGenders },
  Province: { enum: allProvinces },
  Nationality: { enum: allNationalities },
  CaseCategory: { enum: allCaseCategories },
  CaseMomentOfDay: { enum: allMomentOfDays },
  CaseGeographicLocation: { enum: allGeographicLocations },
  CasePlace: { enum: allCasePlaces },
  CaseMurderWeapon: { enum: allCaseMurderWeapons },
  CaseJudicialMeasure: { enum: allCaseJudicialMeasures },
  CaseVictimBondAggressor: { enum: allVictimBondAggressors },
  CaseAggressorBehaviorPostCase: { enum: allCaseAggressorBehaviorsPostCase },
  CaseAggressorSecurityForce: { enum: allCaseAggressorSecurityForces },
};
