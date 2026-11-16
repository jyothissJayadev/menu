// webMenu/src/components/ScrollTimePicker.jsx
import React, { useRef, useEffect } from "react";
import { ChevronUp, ChevronDown, Clock } from "lucide-react";

const HOURS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
const PERIODS = ["AM", "PM"];

const ITEM_HEIGHT = 40; // 40px per item
const VIEWPORT_HEIGHT = 140; // 140px total wheel height
const PADDING_Y = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2; // 50px top/bottom padding to center items

const WheelColumn = ({ items, selected, onSelect, label }) => {
  const containerRef = useRef(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  const selectedIndex = items.indexOf(selected) !== -1 ? items.indexOf(selected) : 0;

  // Scroll to selected item smoothly when selected changes from outside
  useEffect(() => {
    if (!isUserScrolling.current && containerRef.current) {
      containerRef.current.scrollTo({
        top: selectedIndex * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Handle manual scroll
  const handleScroll = (e) => {
    isUserScrolling.current = true;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    const scrollTop = e.target.scrollTop;
    const index = Math.max(0, Math.min(items.length - 1, Math.round(scrollTop / ITEM_HEIGHT)));

    if (items[index] && items[index] !== selected) {
      onSelect(items[index]);
    }

    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
      // Snap to exact center
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: index * ITEM_HEIGHT,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  const handleStep = (delta) => {
    const nextIdx = Math.max(0, Math.min(items.length - 1, selectedIndex + delta));
    onSelect(items[nextIdx]);
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

      {/* Wheel Drum */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: `${VIEWPORT_HEIGHT}px`,
          paddingTop: `${PADDING_Y}px`,
          paddingBottom: `${PADDING_Y}px`,
        }}
        className="w-14 sm:w-16 overflow-y-auto overscroll-contain snap-y snap-mandatory scrollbar-none select-none relative"
      >
        {items.map((item, idx) => {
          const isSelected = item === selected;
          return (
            <div
              key={item}
              onClick={() => {
                onSelect(item);
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: idx * ITEM_HEIGHT,
                    behavior: "smooth",
                  });
                }
              }}
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
  // Parse incoming value like "04:30 PM"
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
    <div className="bg-gradient-to-b from-amber-50/70 via-white to-amber-50/40 rounded-2xl border border-amber-200/80 p-3 shadow-inner">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-amber-100">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>Scroll Alarm-Setter Clock</span>
        </div>
        <span className="text-xs font-black text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-200">
          {hour}:{minute} {period}
        </span>
      </div>

      {/* 3D Wheel Cylinder Area */}
      <div className="relative flex items-center justify-center gap-2 sm:gap-4 py-1">
        {/* Center Golden Highlight Strip */}
        <div
          style={{ height: `${ITEM_HEIGHT}px` }}
          className="absolute inset-x-2 top-1/2 -translate-y-1/2 bg-amber-400/20 border-y-2 border-amber-500/60 rounded-xl pointer-events-none shadow-xs"
        />

        {/* Top Fade Gradient */}
        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10" />

        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />

        {/* Hour Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-0.5">
            Hour
          </span>
          <WheelColumn
            items={HOURS}
            selected={hour}
            onSelect={(h) => update(h, minute, period)}
            label="Hour"
          />
        </div>

        {/* Time Colon */}
        <div className="flex flex-col items-center justify-center pt-5">
          <span className="text-2xl font-black text-amber-700 leading-none pb-1 animate-pulse">
            :
          </span>
        </div>

        {/* Minute Column */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-0.5">
            Minute
          </span>
          <WheelColumn
            items={MINUTES}
            selected={minute}
            onSelect={(m) => update(hour, m, period)}
            label="Minute"
          />
        </div>

        {/* AM / PM Column */}
        <div className="flex flex-col items-center ml-1 sm:ml-2">
          <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-0.5">
            AM/PM
          </span>
          <WheelColumn
            items={PERIODS}
            selected={period}
            onSelect={(p) => update(hour, minute, p)}
            label="AM/PM"
          />
        </div>
      </div>

      <p className="text-center text-[11px] text-amber-800/80 font-medium mt-1">
        Scroll up/down or click buttons to adjust pickup/delivery time
      </p>
    </div>
  );
};
