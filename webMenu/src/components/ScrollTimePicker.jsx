// webMenu/src/components/ScrollTimePicker.jsx
import React, { useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"];

const ITEM_HEIGHT = 44; // 44px per slot
const VIEW_HEIGHT = ITEM_HEIGHT * 3; // 132px (3 items visible)
const PADDING = ITEM_HEIGHT; // 44px top/bottom padding to center first & last item

const WheelColumn = ({ items, value, onChange, label, width = "w-16" }) => {
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollDebounceRef = useRef(null);

  const selectedIndex = items.indexOf(value) !== -1 ? items.indexOf(value) : 0;

  // Sync scroll position when value changes from outside (not while user is dragging)
  useEffect(() => {
    if (!isScrollingRef.current && containerRef.current) {
      containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
  }, [selectedIndex]);

  const handleScroll = (e) => {
    isScrollingRef.current = true;
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);

    const scrollTop = e.target.scrollTop;

    // Settle on scroll stop (80ms debounce) to avoid re-rendering parent mid-gesture
    scrollDebounceRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      const index = Math.max(0, Math.min(items.length - 1, Math.round(scrollTop / ITEM_HEIGHT)));
      if (items[index] && items[index] !== value) {
        onChange(items[index]);
      }
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: index * ITEM_HEIGHT,
          behavior: "smooth",
        });
      }
    }, 80);
  };

  const handleItemClick = (idx, itemVal) => {
    onChange(itemVal);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: idx * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
  };

  const handleStep = (delta) => {
    const nextIdx = Math.max(0, Math.min(items.length - 1, selectedIndex + delta));
    onChange(items[nextIdx]);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: nextIdx * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Up Button */}
      <button
        type="button"
        onClick={() => handleStep(-1)}
        disabled={selectedIndex === 0}
        className="w-8 h-6 flex items-center justify-center text-gray-400 hover:text-amber-800 disabled:opacity-20 transition-colors"
        title={`Previous ${label}`}
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      {/* Scrollable Drum Window */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: `${VIEW_HEIGHT}px`,
          paddingTop: `${PADDING}px`,
          paddingBottom: `${PADDING}px`,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className={`${width} overflow-y-auto overscroll-contain snap-y snap-mandatory select-none relative [&::-webkit-scrollbar]:hidden`}
      >
        {items.map((item, idx) => {
          const isSelected = item === value;
          return (
            <div
              key={item}
              onClick={() => handleItemClick(idx, item)}
              style={{ height: `${ITEM_HEIGHT}px` }}
              className={`flex items-center justify-center snap-center cursor-pointer font-bold transition-all ${
                isSelected
                  ? "text-amber-950 font-black text-xl scale-110"
                  : "text-gray-400 text-sm hover:text-gray-600"
              }`}
            >
              {item}
            </div>
          );
        })}
      </div>

      {/* Down Button */}
      <button
        type="button"
        onClick={() => handleStep(1)}
        disabled={selectedIndex === items.length - 1}
        className="w-8 h-6 flex items-center justify-center text-gray-400 hover:text-amber-800 disabled:opacity-20 transition-colors"
        title={`Next ${label}`}
      >
        <ChevronDown className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ScrollTimePicker = ({ value, onChange }) => {
  const parseTime = (str) => {
    if (!str || str.includes("ASAP")) {
      return { hour: "04", minute: "00", period: "PM" };
    }
    const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      const h = match[1].padStart(2, "0");
      const m = match[2];
      const p = match[3].toUpperCase();
      const validH = HOURS.includes(h) ? h : "04";
      const validM = MINUTES.includes(m) ? m : "00";
      const validP = PERIODS.includes(p) ? p : "PM";
      return { hour: validH, minute: validM, period: validP };
    }
    return { hour: "04", minute: "00", period: "PM" };
  };

  const { hour, minute, period } = parseTime(value);

  const update = (newH, newM, newP) => {
    onChange(`${newH}:${newM} ${newP}`);
  };

  return (
    <div className="bg-amber-50/60 rounded-2xl border border-amber-200 p-3 shadow-xs">
      {/* 3D Drum Wheel Area */}
      <div className="relative flex items-center justify-center gap-2 sm:gap-4 py-1">
        {/* Center Golden Selection Strip */}
        <div
          style={{ height: `${ITEM_HEIGHT}px`, top: `calc(${PADDING}px + 24px)` }}
          className="absolute inset-x-2 bg-amber-500/15 border-y-2 border-amber-500/60 rounded-xl pointer-events-none shadow-xs"
        />

        {/* Top Fade Gradient Mask */}
        <div
          style={{ top: "24px", height: `${PADDING}px` }}
          className="absolute inset-x-0 bg-gradient-to-b from-amber-50/90 via-amber-50/60 to-transparent pointer-events-none z-10"
        />

        {/* Bottom Fade Gradient Mask */}
        <div
          style={{ bottom: "24px", height: `${PADDING}px` }}
          className="absolute inset-x-0 bg-gradient-to-t from-amber-50/90 via-amber-50/60 to-transparent pointer-events-none z-10"
        />

        {/* Hour Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">
            Hour
          </span>
          <WheelColumn
            items={HOURS}
            value={hour}
            onChange={(h) => update(h, minute, period)}
            label="Hour"
            width="w-14"
          />
        </div>

        {/* Colon Separator */}
        <div className="flex flex-col items-center justify-center pt-5">
          <span className="text-2xl font-black text-amber-700 leading-none pb-1 animate-pulse">
            :
          </span>
        </div>

        {/* Minute Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">
            Minute
          </span>
          <WheelColumn
            items={MINUTES}
            value={minute}
            onChange={(m) => update(hour, m, period)}
            label="Minute"
            width="w-14"
          />
        </div>

        {/* Period Column */}
        <div className="flex flex-col items-center ml-1 sm:ml-2">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">
            AM/PM
          </span>
          <WheelColumn
            items={PERIODS}
            value={period}
            onChange={(p) => update(hour, minute, p)}
            label="AM/PM"
            width="w-14"
          />
        </div>
      </div>

      <p className="text-center text-[11px] text-amber-800 font-medium mt-1">
        Scroll wheel or click numbers to select exact time
      </p>
    </div>
  );
};
