"use client";

import { useEffect, useRef, useState } from "react";

function getInstructions(): string {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/.test(ua);
  const isMobile = isIOS || isAndroid || /Mobi/.test(ua);

  if (isIOS) {
    return "באייפון: לחצו על כפתור השיתוף (⬆️ בתחתית הדפדפן) ואז 'הוסף למסך הבית' - ככה יהיה לכם אייקון שחוזר ישר לכאן.";
  }
  if (isAndroid) {
    return "באנדרואיד: לחצו על שלוש הנקודות (⋮) למעלה בדפדפן ואז 'הוסף למסך הבית' - ככה יהיה לכם אייקון שחוזר ישר לכאן.";
  }
  const isMac = /Mac/.test(navigator.platform ?? "");
  return `במחשב: לחצו ${isMac ? "Cmd+D" : "Ctrl+D"} כדי להוסיף את הדף הזה למועדפים.`;
}

export default function AddToFavorites() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleClick() {
    setText(getInstructions());
    setOpen((v) => !v);
  }

  return (
    <div className="favorites-bar" ref={ref}>
      <button type="button" className="favorites-btn" onClick={handleClick}>
        ⭐ הוסיפו למועדפים
      </button>
      {open && (
        <div className="favorites-tooltip" role="tooltip">
          {text}
        </div>
      )}
    </div>
  );
}
