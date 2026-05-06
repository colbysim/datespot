"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Phone,
  Globe,
  Navigation,
  Clock,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mapDetail } from "@/lib/mappers";
import type { PlaceDetail } from "@/lib/types";
import SpotImage from "./SpotImage";

interface SpotDetailProps {
  placeId: string;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function SpotDetail({
  placeId,
  onBack,
  isFavorite,
  onToggleFavorite,
}: SpotDetailProps) {
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/details/${placeId}`);
        const data = await res.json();
        if (res.ok) {
          setDetail(mapDetail(data));
        }
      } catch (e) {
        console.error("Failed to load details:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [placeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-base">
        <div className="aspect-[16/10] skeleton" />
        <div className="p-6 space-y-4">
          <div className="h-6 w-3/4 skeleton rounded" />
          <div className="h-4 w-1/2 skeleton rounded" />
          <div className="h-20 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Failed to load details</p>
          <button onClick={onBack} className="text-brand-orange font-medium">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base pb-24">
      {/* Hero Image */}
      <div className="relative aspect-[16/10] md:aspect-[2.5/1] overflow-hidden">
        <SpotImage
          src={detail.photoUrls[activePhoto] || detail.photoUrl}
          alt={detail.name}
          types={detail.types}
          id={detail.id}
          className="w-full h-full"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-transparent to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <button
            onClick={onToggleFavorite}
            className="p-2.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
          >
            <Heart
              size={20}
              className={cn(
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
          </button>
        </div>

        {/* Photo dots */}
        {detail.photoUrls.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
            {detail.photoUrls.map((_, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  i === activePhoto
                    ? "bg-brand-orange w-5"
                    : "bg-white/40 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 md:px-8 max-w-3xl mx-auto -mt-6 relative z-10 space-y-6">
        {/* Title block */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-orange uppercase tracking-wide">
                {detail.typeLabel}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mt-1">
                {detail.name}
              </h1>
            </div>
            {detail.priceLevelLabel && (
              <span className="text-xl font-bold text-brand-orange shrink-0">
                {detail.priceLevelLabel}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-brand-orange text-brand-orange" />
              <span className="font-semibold text-text-primary">
                {detail.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-text-muted">
              ({detail.ratingCount.toLocaleString()} reviews)
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary leading-relaxed">
          {detail.description}
        </p>

        {/* Best For */}
        {detail.bestFor.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-2">
              Best For
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.bestFor.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-sm font-medium
                             bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Date Plan */}
        {detail.suggestedPlan && (
          <div className="bg-surface-card border border-surface-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bookmark size={16} className="text-brand-orange" />
              <h3 className="text-sm font-semibold text-text-primary">
                Date Plan Idea
              </h3>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {detail.suggestedPlan}
            </p>
          </div>
        )}

        {/* Address */}
        <div className="flex items-start gap-3">
          <MapPin size={18} className="text-text-muted mt-0.5 shrink-0" />
          <p className="text-sm text-text-secondary">{detail.address}</p>
        </div>

        {/* Hours */}
        {detail.hours.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-text-muted" />
              <h3 className="text-sm font-semibold text-text-primary">
                Hours
              </h3>
            </div>
            <div className="bg-surface-card border border-surface-border rounded-xl p-4 space-y-1.5">
              {detail.hours.map((h) => (
                <div
                  key={h.day}
                  className="flex justify-between text-sm"
                >
                  <span className="text-text-secondary">{h.day}</span>
                  <span className="text-text-primary font-medium">
                    {h.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {detail.reviews.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
              Reviews
            </h3>
            <div className="space-y-3">
              {detail.reviews.map((review, i) => (
                <div
                  key={i}
                  className="bg-surface-card border border-surface-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">
                      {review.author}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star
                        size={12}
                        className="fill-brand-orange text-brand-orange"
                      />
                      <span className="text-xs text-text-secondary">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-3">
                    {review.text}
                  </p>
                  {review.timeAgo && (
                    <p className="text-xs text-text-muted mt-2">
                      {review.timeAgo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 glass border-t border-surface-border
                      px-5 py-4 z-30">
        <div className="max-w-3xl mx-auto flex gap-3">
          {detail.mapsUrl && (
            <a
              href={detail.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 flex-1 rounded-xl
                         bg-brand-orange text-white font-semibold
                         hover:bg-brand-orange-dark active:scale-[0.98] transition-all"
            >
              <Navigation size={16} />
              Directions
            </a>
          )}
          {detail.phone && (
            <a
              href={`tel:${detail.phone}`}
              className="flex items-center justify-center h-12 w-12 rounded-xl
                         bg-surface-elevated border border-surface-border
                         text-text-secondary hover:text-brand-orange hover:border-brand-orange/30
                         transition-all"
              aria-label="Call"
            >
              <Phone size={18} />
            </a>
          )}
          {detail.website && (
            <a
              href={detail.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-12 w-12 rounded-xl
                         bg-surface-elevated border border-surface-border
                         text-text-secondary hover:text-brand-orange hover:border-brand-orange/30
                         transition-all"
              aria-label="Website"
            >
              <Globe size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
