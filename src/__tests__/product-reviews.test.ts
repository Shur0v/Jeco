import { describe, it, expect } from "vitest";
import { commerceService } from "@/commerce";
describe("product-specific reviews", () => {
  it("never appends another product’s reviews", () => {
    const reviews = commerceService.reviews.getAllReviews();
    for (const id of new Set(reviews.map((r) => r.productId))) {
      expect(
        commerceService.reviews
          .getReviewsForProduct(id)
          .every((r) => r.productId === id),
      ).toBe(true);
    }
  });
  it("returns no reviews for a product without reviews", () => {
    expect(
      commerceService.reviews.getReviewsForProduct("not-reviewed-yet"),
    ).toEqual([]);
  });
});
