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
        if (res.ok) setDetail(mapDetail(data));
      } catch (e) {
        console.error("Failed to load details:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [placeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Failed to load details</p>
          <button onClick={onBack} className="gradient-text font-semibold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
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
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-full bg-white/90 shadow-soft backdrop-blur-sm
                       hover:bg-white hover:shadow-card transition-all"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <button
            onClick={onToggleFavorite}
            className="p-2.5 rounded-full bg-white/90 shadow-soft backdrop-blur-sm
                       hover:bg-white hover:shadow-card transition-all"
          >
            <Heart
              size={20}
              className={cn(
                isFavorite
                  ? "fill-brand-magenta text-brand-magenta"
                  : "text-text-muted"
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
                  "h-2 rounded-full transition-all shadow-sm",
                  i === activePhoto
                    ? "w-6 gradient-brand"
                    : "w-2 bg-black/20"
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
              <span className="text-xs font-bold gradient-text uppercase tracking-wider">
                {detail.typeLabel}
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary mt-1">
                {detail.name}
              </h1>
            </div>
            {detail.priceLevelLabel && (
              <span className="text-xl font-extrabold gradient-text shrink-0">
                {detail.priceLevelLabel}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-text-primary">
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
                  className="px-4 py-1.5 rounded-full text-sm font-medium gradient-border gradient-brand-subtle gradient-text"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Date Plan */}
        {detail.suggestedPlan && (
          <div className="bg-surface-elevated/60 border border-surface-border/60 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center">
                <Bookmark size={13} className="text-white" />
              </div>
              <h3 className="text-sm font-bold text-text-primary">
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
              <h3 className="text-sm font-bold text-text-primary">Hours</h3>
            </div>
            <div className="bg-surface-elevated/50 border border-surface-border/60 rounded-2xl p-4 space-y-2">
              {detail.hours.map((h) => (
                <div key={h.day} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{h.day}</span>
                  <span className="text-text-primary font-medium">{h.hours}</span>
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
                  className="bg-white border border-surface-border/60 rounded-2xl p-4 shadow-soft"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {review.author}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="text-xs text-text-secondary font-medium">
                        {review.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                    {review.text}
                  </p>
                  {review.timeAgo && (
                    <p className="text-xs text-text-muted mt-2">{review.timeAgo}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 glass-strong border-t border-surface-border/40
                      px-5 py-4 z-30">
        <div className="max-w-3xl mx-auto flex gap-3">
          {detail.mapsUrl && (
            <a
              href={detail.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 flex-1 rounded-xl
                         btn-gradient"
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
                         text-text-secondary hover:text-brand-purple hover:shadow-glow
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
                         text-text-secondary hover:text-brand-purple hover:shadow-glow
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
