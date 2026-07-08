import { describe, it, expect } from "vitest";
import { EquityGrant } from "../EquityGrant";

const baseProps = {
  tenantId: "11111111-1111-1111-1111-111111111111",
  beneficiaryName: "João Silva",
  optionsTotal: 10000,
  grantDate: new Date("2025-01-01T00:00:00Z"),
  cliffMonths: 12,
  vestingMonths: 48,
  grantPrice: 0.1,
};

describe("EquityGrant", () => {
  describe("vesting schedule (PRD §7.6 Gherkin)", () => {
    it("should vest 0 options before the cliff", () => {
      const grant = EquityGrant.create(baseProps);
      expect(grant.vestedOptions(new Date("2025-12-31"))).toBe(0);
    });

    it("should vest 2500 options at the cliff (12/48 months)", () => {
      const grant = EquityGrant.create(baseProps);
      expect(grant.vestedOptions(new Date("2026-01-01"))).toBe(2500);
    });

    it("should vest ~208 additional options per month after the cliff", () => {
      const grant = EquityGrant.create(baseProps);
      const atCliff = grant.vestedOptions(new Date("2026-01-01"));
      const oneMonthLater = grant.vestedOptions(new Date("2026-02-01"));
      expect(oneMonthLater - atCliff).toBe(208); // floor(10000*13/48) - 2500
    });

    it("should vest everything after the full vesting period", () => {
      const grant = EquityGrant.create(baseProps);
      expect(grant.vestedOptions(new Date("2029-01-01"))).toBe(10000);
      expect(grant.vestedOptions(new Date("2030-06-01"))).toBe(10000);
    });

    it("should not count a partial month as elapsed", () => {
      const grant = EquityGrant.create(baseProps);
      // Dec 15th: month 11 not yet complete on day-of-month basis at cliff edge
      expect(grant.vestedOptions(new Date("2025-12-15"))).toBe(0);
    });
  });

  describe("acceleration (RN-04/RN-05)", () => {
    it("should vest 100% on acceleration event with single trigger", () => {
      const grant = EquityGrant.create({
        ...baseProps,
        acceleration: "single_trigger",
      });
      expect(
        grant.vestedOptions(new Date("2025-06-01"), {
          accelerationEvent: true,
        }),
      ).toBe(10000);
    });

    it("should NOT accelerate double trigger on event alone", () => {
      const grant = EquityGrant.create({
        ...baseProps,
        acceleration: "double_trigger",
      });
      expect(
        grant.vestedOptions(new Date("2025-06-01"), {
          accelerationEvent: true,
        }),
      ).toBe(0);
    });

    it("should accelerate double trigger on event + involuntary termination", () => {
      const grant = EquityGrant.create({
        ...baseProps,
        acceleration: "double_trigger",
      });
      expect(
        grant.vestedOptions(new Date("2025-06-01"), {
          accelerationEvent: true,
          involuntaryTermination: true,
        }),
      ).toBe(10000);
    });

    it("should ignore acceleration event when acceleration is none", () => {
      const grant = EquityGrant.create(baseProps);
      expect(
        grant.vestedOptions(new Date("2025-06-01"), {
          accelerationEvent: true,
        }),
      ).toBe(0);
    });
  });

  describe("termination (RN-07)", () => {
    it("should freeze vesting at termination date", () => {
      const grant = EquityGrant.create(baseProps);
      grant.terminate(new Date("2026-06-15"));
      // 17 full months elapsed -> floor(10000*17/48) = 3541
      const frozen = grant.vestedOptions(new Date("2028-01-01"));
      expect(frozen).toBe(3541);
    });

    it("should keep the exercise window open for 90 days after termination", () => {
      const grant = EquityGrant.create(baseProps);
      grant.terminate(new Date("2026-06-15"));
      expect(grant.isExerciseWindowOpen(new Date("2026-09-10"))).toBe(true);
      expect(grant.isExerciseWindowOpen(new Date("2026-09-14"))).toBe(false);
    });

    it("should not terminate a grant twice", () => {
      const grant = EquityGrant.create(baseProps);
      grant.terminate(new Date("2026-06-15"));
      expect(() => grant.terminate()).toThrow("Cannot terminate");
    });

    it("should vest 0 for cancelled grants", () => {
      const grant = EquityGrant.fromPersistence({
        ...EquityGrant.create(baseProps).toPersistence(),
        status: "cancelled",
      });
      expect(grant.vestedOptions(new Date("2029-01-01"))).toBe(0);
    });
  });

  describe("timeline (RN-08)", () => {
    it("should produce milestones only when the vested amount changes", () => {
      const grant = EquityGrant.create(baseProps);
      const timeline = grant.vestingTimeline(24, new Date("2025-06-01"));
      expect(timeline[0].cumulativeVested).toBe(0);
      const cliffMilestone = timeline.find((m) => m.cumulativeVested === 2500);
      expect(cliffMilestone).toBeDefined();
      // strictly increasing after dedup
      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].cumulativeVested).toBeGreaterThan(
          timeline[i - 1].cumulativeVested,
        );
      }
    });
  });

  describe("validation", () => {
    it("should throw when optionsTotal is not positive", () => {
      expect(() =>
        EquityGrant.create({ ...baseProps, optionsTotal: 0 }),
      ).toThrow("optionsTotal");
    });

    it("should throw when cliff exceeds vesting duration", () => {
      expect(() =>
        EquityGrant.create({ ...baseProps, cliffMonths: 60 }),
      ).toThrow("cliffMonths");
    });

    it("should throw when grantPrice is negative", () => {
      expect(() =>
        EquityGrant.create({ ...baseProps, grantPrice: -1 }),
      ).toThrow("grantPrice");
    });

    it("should default to 12-month cliff, 48-month vesting, 90-day window", () => {
      const grant = EquityGrant.create({
        tenantId: baseProps.tenantId,
        beneficiaryName: "Marina",
        optionsTotal: 5000,
        grantDate: new Date("2026-01-01"),
        grantPrice: 0.25,
      });
      expect(grant.cliffMonths).toBe(12);
      expect(grant.vestingMonths).toBe(48);
      expect(grant.exerciseWindowDays).toBe(90);
    });
  });
});
