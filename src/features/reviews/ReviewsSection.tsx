'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { commerceService } from '@/commerce';
import { useStore } from '@/hooks/useStore';
import { getProductStudioSvg } from '@/lib/artwork';

interface ReviewsSectionProps {
  productId?: string;
  productName?: string;
  productSlug?: string;
}

export function ReviewsSection({
  productId,
  productName,
  productSlug,
}: ReviewsSectionProps) {
  const { customReviews, addCustomReview } = useStore();
  const [visibleCount, setVisibleCount] = useState(10);
  const [sortOrder, setSortOrder] = useState<'recent' | 'highest'>('recent');
  const [isWritingReview, setIsWritingReview] = useState(false);

  // Demo review form state
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const allReviews = useMemo(() => {
    const base = commerceService.reviews.getReviewsForProduct(productId);
    const combined = [...customReviews, ...base];
    if (sortOrder === 'highest') {
      return [...combined].sort((a, b) => b.rating - a.rating);
    }
    return combined;
  }, [productId, customReviews, sortOrder]);

  function handleSubmitDemoReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewerName.trim() || !comment.trim()) return;
    addCustomReview({
      productId: productId || 'prod-dome-huggie-hoop',
      productName: productName || 'Dome Huggie Hoop Earrings',
      productSlug: productSlug || 'dome-huggie-hoop-earrings',
      variantTitle: 'Gold',
      reviewerName: reviewerName.trim(),
      reviewerInitials: reviewerName.trim().slice(0, 2).toUpperCase(),
      verifiedBuyer: false,
      rating,
      comment: comment.trim(),
    });
    setReviewerName('');
    setComment('');
    setIsWritingReview(false);
  }

  return (
    <section
      id="reviews"
      className="max-w-[900px] mx-auto px-4 sm:px-6 py-14"
      aria-label="Customer Reviews"
    >
      {/* Header matching Screenshots 5 & 7 */}
      <div className="flex items-center justify-between pb-6 border-b border-[#EAE6E4]">
        <div className="flex items-center gap-4">
          <h2 className="text-[20px] sm:text-[22px] tracking-[0.08em] uppercase font-medium text-[#292929]">
            REVIEWS
          </h2>
          <select
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as 'recent' | 'highest')
            }
            aria-label="Sort reviews"
            className="text-[11.5px] text-[#777777] border border-[#EAE6E4] px-2.5 py-1 bg-white focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWritingReview((prev) => !prev)}
            className="border border-[#EAE6E4] hover:border-[#292929] px-4 py-2 text-[10.5px] tracking-[0.12em] uppercase text-[#292929] transition-colors"
          >
            {isWritingReview ? 'CANCEL' : 'WRITE DEMO REVIEW'}
          </button>
          <button
            type="button"
            onClick={() => setVisibleCount(allReviews.length)}
            className="border border-[#EAE6E4] hover:border-[#292929] px-4 py-2 text-[10.5px] tracking-[0.12em] uppercase text-[#292929] transition-colors"
          >
            READ ALL
          </button>
        </div>
      </div>

      {/* Optional Demo Review Submission Form */}
      {isWritingReview && (
        <form
          onSubmit={handleSubmitDemoReview}
          className="my-6 p-6 bg-[#FAF8F7] border border-[#EAE6E4] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium uppercase tracking-wider text-[#292929]">
              Submit a Local Demo Review
            </h3>
            <span className="text-[11px] text-[#777777]">
              Stored locally in your browser
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11.5px] text-[#777777] mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                required
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                placeholder="e.g. Camille R."
                className="w-full bg-white border border-[#EAE6E4] px-3 py-2 text-[13px] focus:outline-none focus:border-[#292929]"
              />
            </div>

            <div>
              <label className="block text-[11.5px] text-[#777777] mb-1">
                Rating
              </label>
              <div className="flex items-center gap-1.5 pt-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} stars`}
                    className="p-0.5"
                  >
                    <Star
                      className="w-4 h-4 text-[#E7A7AA]"
                      fill={star <= rating ? '#E7A7AA' : 'none'}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] text-[#777777] mb-1">
              Your Review
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how this piece fits and feels..."
              className="w-full bg-white border border-[#EAE6E4] px-3 py-2 text-[13px] focus:outline-none focus:border-[#292929]"
            />
          </div>

          <button
            type="submit"
            className="bg-[#E7A7AA] text-white px-6 py-2.5 text-[11.5px] tracking-[0.12em] uppercase font-medium hover:bg-[#dc9599]"
          >
            Post Demo Review
          </button>
        </form>
      )}

      {/* Review List matching Screenshots 5 & 7 */}
      <div className="divide-y divide-[#EAE6E4]">
        {allReviews.slice(0, visibleCount).map((rev, idx) => {
          const thumbProd = commerceService.catalog.getProductById(
            rev.productId
          );
          const thumbImg = thumbProd
            ? thumbProd.images[0]
            : getProductStudioSvg({
                shape: 'dome-huggie',
                primaryFinish: 'Gold',
              });

          return (
            <article
              key={rev.id}
              className="py-6 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <Link
                  href={`/products/${rev.productSlug}`}
                  className="w-11 h-11 bg-[#F6F6F6] shrink-0 overflow-hidden block mt-0.5"
                >
                  <img
                    src={thumbImg}
                    alt={rev.productName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="space-y-1">
                  {/* Stars */}
                  <div
                    className="flex items-center gap-0.5"
                    aria-label={`${rev.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-3 h-3 text-[#E7A7AA]"
                        fill={s <= rev.rating ? '#E7A7AA' : 'none'}
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-[12.5px] text-[#292929] leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Author + Demo Badge */}
                  <div className="flex items-center gap-2 pt-1 text-[11px]">
                    <span className="text-[#777777]">{rev.reviewerName}</span>
                    <span className="bg-[#292929] text-white text-[9px] px-1.5 py-0.2 font-medium tracking-wider">
                      {rev.verifiedBuyer ? 'Verified Buyer (Demo)' : 'Demo Reviewer'}
                    </span>
                  </div>

                  {/* Reviewed Product Link */}
                  <Link
                    href={`/products/${rev.productSlug}`}
                    className="text-[11px] text-[#777777] hover:underline block"
                  >
                    {rev.productName} - {rev.variantTitle}
                  </Link>
                </div>
              </div>

              <span className="text-[11px] text-[#777777] tabular-nums shrink-0">
                {rev.date}
              </span>
            </article>
          );
        })}
      </div>

      {/* Bottom Read All Reviews Button */}
      {visibleCount < allReviews.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="border border-[#EAE6E4] hover:border-[#292929] px-7 py-2.5 text-[11px] tracking-[0.12em] uppercase text-[#292929] transition-colors"
          >
            READ ALL REVIEWS
          </button>
        </div>
      )}
    </section>
  );
}
