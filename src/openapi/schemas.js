import allCaseAggressorBehaviorsPostCase from "../data/behavioursPostCase.js";
import allCaseCategories from "../data/caseCategories.js";
import allGenders from "../data/genders.js";
import allGeographicLocations from "../data/geographicLocations.js";
import allCaseJudicialMeasures from "../data/judicialMeasures.js";
import allMomentOfDays from "../data/momentsOfDay.js";
import allCaseMurderWeapons from "../data/murderWeapons.js";
import allNationalities from "../data/nationalities.js";
import allCasePlaces from "../data/places.js";
import allProvinces from "../data/provinces.js";
import allCaseAggressorSecurityForces from "../data/securityForces.js";
import allVictimBondAggressors from "../data/victimBondAggressor.js";
import caseSchema from "../openapi/schemas/case.js";
import caseListItemSchema from "../openapi/schemas/caseListItem.js";
import feedItemSchema from "../openapi/schemas/feedItem.js";
import { paginatedEnvelope } from "../openapi/schemas/pagination.js";
import userProfileSchema from "../openapi/schemas/userProfile.js";

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
  Case: caseSchema,
  CaseListItem: caseListItemSchema,
  FeedItem: feedItemSchema,
  UserProfile: userProfileSchema,
  CaseListPage: paginatedEnvelope({
    $ref: "#/components/schemas/CaseListItem",
  }),
  FeedItemListPage: paginatedEnvelope({
    $ref: "#/components/schemas/FeedItem",
  }),
};
