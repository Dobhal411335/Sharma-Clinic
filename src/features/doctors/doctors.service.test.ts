import {
  emptyDoctorPageConfig,
  emptyDoctorProfileFacets,
} from "./doctors.service";

describe("doctors.service defaults", () => {
  it("returns empty doctor page config for IN", () => {
    const config = emptyDoctorPageConfig();
    expect(config.siteCode).toBe("IN");
    expect(config.id).toBeNull();
    expect(config.aboutHighlights).toEqual([]);
    expect(config.services).toEqual([]);
  });

  it("returns empty doctor facets", () => {
    expect(emptyDoctorProfileFacets()).toEqual({
      specialities: [],
      states: [],
      citiesByState: {},
    });
  });
});
