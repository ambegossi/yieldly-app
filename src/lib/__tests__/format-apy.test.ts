import { formatAPY } from "@/lib/format-apy";

describe("formatAPY", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("formats a typical decimal APY with 2 decimal places", () => {
    expect(formatAPY(5.67)).toBe("5.67%");
  });

  it("formats zero APY as 0.00%", () => {
    expect(formatAPY(0)).toBe("0.00%");
  });

  it("formats negative APY with minus sign and 2 decimal places", () => {
    expect(formatAPY(-3.5)).toBe("-3.50%");
  });

  it("formats APY >= 1000 with locale comma formatting", () => {
    expect(formatAPY(1234)).toBe("1,234%");
  });

  it("formats APY >= 10000 with K suffix", () => {
    expect(formatAPY(15000)).toBe("15.0K%");
  });

  it("formats small decimal APY with 2 decimal places", () => {
    expect(formatAPY(0.01)).toBe("0.01%");
  });

  it("formats APY exactly at 1000 with comma formatting", () => {
    expect(formatAPY(1000)).toBe("1,000%");
  });

  it("formats APY just below 10000 with comma formatting", () => {
    expect(formatAPY(9999)).toBe("9,999%");
  });

  it("formats APY exactly at 10000 with K suffix", () => {
    expect(formatAPY(10000)).toBe("10.0K%");
  });

  it("formats negative APY below -1000 with minus sign and K suffix", () => {
    expect(formatAPY(-15000)).toBe("-15.0K%");
  });
});
