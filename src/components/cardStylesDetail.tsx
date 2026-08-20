import React from "react";
import { CardStyle } from "../types";
import { DetailStyleProps, formatStars } from "./cardStyleProps";

type Variant = React.FC<DetailStyleProps>;

const avatarFor = (name: string, url?: string) => ({
  src: url || `https://ui-avatars.com/api/?name=${name.split("/")[0]}&background=random&size=100`,
  alt: "avatar",
  crossOrigin: "anonymous" as const,
  referrerPolicy: "no-referrer" as const,
  onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${name.split("/")[0]}/100/100`;
  },
});

const Summary = ({ p, className = "", style }: { p: DetailStyleProps; className?: string; style?: React.CSSProperties }) => (
  <div
    className={className}
    style={style}
    dangerouslySetInnerHTML={{ __html: p.highlightedHtml }}
  />
);

const base = (p: DetailStyleProps, cls = "", extra?: React.CSSProperties) => ({
  className: `w-full h-full rounded-2xl relative overflow-hidden flex flex-col ${cls}`,
  style: { backgroundColor: p.theme.cardBg, color: p.theme.textColor, ...extra },
});

const Classic: Variant = (p) => (
  <div {...base(p, "shadow-inner px-[6%] py-[6%]")}>
    <div className="flex items-center gap-4 mb-8">
      <img className="w-14 h-14 rounded-full object-cover shadow-sm flex-shrink-0" {...avatarFor(p.projectName, p.avatarUrl)} />
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-black tracking-tight leading-tight truncate mb-1">{p.projectName}</div>
        <div className="text-xs font-mono opacity-40 truncate">{p.projectUrl}</div>
      </div>
    </div>
    <div className="flex gap-3 mb-6">
      <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
        <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Rank</div>
        <div className="text-2xl font-black">#{p.currentIndex + 1}</div>
      </div>
      <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
        <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Total Stars</div>
        <div className="text-2xl font-black">{formatStars(p.stars)}</div>
      </div>
      <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5">
        <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-1">Stars Today</div>
        <div className="text-2xl font-black" style={{ color: p.theme.accentColor }}>+{formatStars(p.starsToday)}</div>
      </div>
    </div>
    <div className="flex-1 flex flex-col min-h-0 mb-6">
      <Summary p={p} className="text-[clamp(1rem,2.8vw,1.5rem)] font-bold leading-snug tracking-tight overflow-hidden line-clamp-[14]" />
    </div>
    <div className="pt-6 border-t border-white/5">
      <div className="text-[10px] uppercase tracking-widest opacity-40 font-bold mb-2">Topics</div>
      <div className="flex flex-wrap gap-1.5 max-h-[60px] overflow-hidden">
        {p.keywordList.slice(0, 20).map((tag, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider opacity-70">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const Poster: Variant = (p) => (
  <div {...base(p, "px-[6%] py-[6%]")}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">Rank #{p.currentIndex + 1}</span>
      <span className="text-[10px] font-mono opacity-50">{formatStars(p.stars)} ★</span>
    </div>
    <div className="text-[clamp(1.5rem,5.2vw,2.6rem)] font-black leading-tight tracking-tight line-clamp-2 break-all">{p.projectName}</div>
    <div className="mt-3 h-[3px] w-14 rounded-full" style={{ backgroundColor: p.theme.accentColor }} />
    <div className="mt-3 text-xs font-mono opacity-40 truncate">{p.projectUrl}</div>
    <div className="flex gap-3 my-6">
      <div className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: p.theme.accentColor + "18" }}>
        <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-1">Total Stars</div>
        <div className="text-3xl font-black">{formatStars(p.stars)}</div>
      </div>
      <div className="flex-1 p-4 rounded-2xl" style={{ backgroundColor: p.theme.accentColor + "18" }}>
        <div className="text-[10px] uppercase tracking-widest opacity-50 font-bold mb-1">Today</div>
        <div className="text-3xl font-black" style={{ color: p.theme.accentColor }}>+{formatStars(p.starsToday)}</div>
      </div>
    </div>
    <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
      <Summary p={p} className="text-[clamp(1rem,2.8vw,1.45rem)] font-bold leading-snug tracking-tight line-clamp-[12]" />
    </div>
    <div className="pt-4 flex flex-wrap gap-1.5">
      {p.keywordList.slice(0, 12).map((tag, i) => (
        <span key={i} className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider opacity-70">{tag}</span>
      ))}
    </div>
  </div>
);

const Terminal: Variant = (p) => (
  <div {...base(p, "font-mono")}>
    <div className="flex items-center gap-1.5 px-4 py-3 bg-white/[0.06] border-b border-white/10">
      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
      <span className="ml-3 text-[12px] opacity-50">MoneyPrinterTurbo — bash</span>
    </div>
    <div className="flex-1 px-5 py-4 flex flex-col gap-2 overflow-hidden">
      <div className="text-[12px] opacity-50">$ gh trend --detail {String(p.currentIndex + 1).padStart(2, "0")}</div>
      <div className="text-xl font-bold leading-tight break-all">{p.projectName}</div>
      <div className="text-[12px] opacity-50">{p.projectUrl}</div>
      <div className="flex gap-2 my-2">
        <div className="flex-1 border border-white/10 rounded-lg px-2.5 py-2"><div className="text-[9px] opacity-50 uppercase">rank</div><div className="text-base font-bold">#{p.currentIndex + 1}</div></div>
        <div className="flex-1 border border-white/10 rounded-lg px-2.5 py-2"><div className="text-[9px] opacity-50 uppercase">stars</div><div className="text-base font-bold" style={{ color: p.theme.accentColor }}>{formatStars(p.stars)}</div></div>
        <div className="flex-1 border border-white/10 rounded-lg px-2.5 py-2"><div className="text-[9px] opacity-50 uppercase">today</div><div className="text-base font-bold text-emerald-400">+{formatStars(p.starsToday)}</div></div>
      </div>
      <div className="text-[12px] opacity-50">$ cat README.md | ai --summary</div>
      <div className="flex-1 min-h-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <Summary p={p} className="text-[13px] leading-relaxed opacity-90 line-clamp-[12]" />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {p.keywordList.slice(0, 6).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-[11px]">#{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const Magazine: Variant = (p) => (
  <div {...base(p, "px-[6%] py-[6%]")}>
    <div className="flex items-center gap-3 mb-5">
      <img className="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0" {...avatarFor(p.projectName, p.avatarUrl)} />
      <div className="min-w-0">
        <div className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40 mb-1">Daily Pick · Rank #{p.currentIndex + 1}</div>
        <div className="text-xl font-black tracking-tight leading-tight truncate">{p.projectName}</div>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2 mb-5">
      <div className="border border-white/10 rounded-xl p-3"><div className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">Rank</div><div className="text-xl font-black font-mono">#{p.currentIndex + 1}</div></div>
      <div className="border border-white/10 rounded-xl p-3"><div className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">Stars</div><div className="text-xl font-black font-mono">{formatStars(p.stars)}</div></div>
      <div className="border border-white/10 rounded-xl p-3"><div className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-1">Today</div><div className="text-xl font-black font-mono" style={{ color: p.theme.accentColor }}>+{formatStars(p.starsToday)}</div></div>
    </div>
    <div className="flex-1 min-h-0 overflow-hidden">
      <div className="h-px w-full bg-white/20 mb-3" />
      <Summary p={p} className="text-[clamp(0.95rem,2.6vw,1.3rem)] font-medium leading-relaxed line-clamp-[13]" />
    </div>
    <div className="pt-4 border-t border-white/15">
      <div className="text-[9px] uppercase tracking-widest opacity-40 font-bold mb-2">Topics</div>
      <div className="flex flex-wrap gap-1.5">
        {p.keywordList.slice(0, 12).map((tag, i) => (
          <span key={i} className="px-2.5 py-1 rounded border border-white/10 text-[10px] font-bold uppercase tracking-wider opacity-70">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const Databar: Variant = (p) => {
  const total = parseFloat(String(p.stars).replace(/k/gi, "").replace(/,/g, "")) || 1;
  const today = parseFloat(String(p.starsToday).replace(/,/g, "")) || 1;
  return (
    <div {...base(p, "px-[7%] py-[6%]", { backgroundColor: "#ffffff", color: "#18181b" })}>
      <div className="font-mono text-[11px] tracking-[0.25em] uppercase opacity-50">Project #{p.currentIndex + 1} · {p.displayDate}</div>
      <h2 className="text-2xl font-black tracking-tight mt-1">{p.projectName.split("/")[1] || p.projectName}</h2>
      <div className="font-mono text-[12px] opacity-40 truncate mt-1">{p.projectUrl}</div>
      <div className="my-5">
        <div className="flex justify-between text-[13px] font-bold mb-1.5"><span>Total Stars</span><span className="font-mono">{formatStars(p.stars)}</span></div>
        <div className="h-[10px] rounded-full bg-zinc-100"><div className="h-full rounded-full" style={{ width: `${Math.min(total / 500, 1) * 100}%`, backgroundColor: p.theme.accentColor }} /></div>
        <div className="flex justify-between text-[13px] font-bold mt-4 mb-1.5"><span>今日新增</span><span className="font-mono" style={{ color: p.theme.accentColor }}>+{formatStars(p.starsToday)}</span></div>
        <div className="h-[10px] rounded-full bg-zinc-100"><div className="h-full rounded-full" style={{ width: `${Math.min((today / 2400) * 100, 100)}%`, backgroundColor: p.theme.accentColor }} /></div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl bg-zinc-50 border border-zinc-200 p-4">
        <Summary p={p} className="text-[15px] leading-relaxed font-medium line-clamp-[11]" />
      </div>
      <div className="pt-4 flex flex-wrap gap-1.5">
        {p.keywordList.slice(0, 8).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded text-[11px] font-bold" style={{ backgroundColor: p.theme.accentColor + "22", color: p.theme.accentColor }}>{tag}</span>
        ))}
      </div>
    </div>
  );
};

const Cardstack: Variant = (p) => (
  <div {...base(p, "gap-3 px-[6%] py-[6%]")}>
    <div className="flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 p-3">
      <img className="w-10 h-10 rounded-full object-cover flex-shrink-0" {...avatarFor(p.projectName, p.avatarUrl)} />
      <div className="min-w-0">
        <div className="text-lg font-black truncate">{p.projectName.split("/")[1] || p.projectName}</div>
        <div className="text-[11px] font-mono opacity-50 truncate">{p.projectUrl}</div>
      </div>
    </div>
    <div className="flex gap-2">
      <div className="flex-1 rounded-xl bg-white/10 border border-white/10 p-2.5"><div className="text-[9px] uppercase tracking-widest opacity-50">Rank</div><div className="text-lg font-black font-mono">#{p.currentIndex + 1}</div></div>
      <div className="flex-1 rounded-xl bg-white/10 border border-white/10 p-2.5"><div className="text-[9px] uppercase tracking-widest opacity-50">Stars</div><div className="text-lg font-black font-mono">{formatStars(p.stars)}</div></div>
      <div className="flex-1 rounded-xl bg-white/10 border border-white/10 p-2.5"><div className="text-[9px] uppercase tracking-widest opacity-50">Today</div><div className="text-lg font-black font-mono" style={{ color: p.theme.accentColor }}>+{formatStars(p.starsToday)}</div></div>
    </div>
    <div className="flex-1 min-h-0 overflow-hidden rounded-2xl bg-white/10 border border-white/10 p-4">
      <Summary p={p} className="text-[15px] font-semibold leading-snug line-clamp-[12]" />
    </div>
    <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
      <div className="text-[8px] uppercase tracking-widest opacity-50 mb-1.5">Topics</div>
      <div className="flex flex-wrap gap-1.5">
        {p.keywordList.slice(0, 10).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-md text-[11px] font-bold" style={{ backgroundColor: p.theme.accentColor + "22", color: p.theme.accentColor }}>{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const Glass: Variant = (p) => (
  <div {...base(p, "gap-3 px-[5%] py-[5%]")}>
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-3">
      <img className="w-12 h-12 rounded-full object-cover flex-shrink-0" {...avatarFor(p.projectName, p.avatarUrl)} />
      <div className="min-w-0">
        <div className="text-lg font-black tracking-tight truncate">{p.projectName.split("/")[1] || p.projectName}</div>
        <div className="text-[10px] font-mono opacity-50 truncate">{p.projectUrl}</div>
      </div>
    </div>
    <div className="flex gap-2.5">
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-3"><div className="text-[9px] uppercase tracking-widest opacity-50 font-bold mb-1">Rank</div><div className="text-xl font-black font-mono">#{p.currentIndex + 1}</div></div>
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-3"><div className="text-[9px] uppercase tracking-widest opacity-50 font-bold mb-1">Stars</div><div className="text-xl font-black font-mono">{formatStars(p.stars)}</div></div>
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-3"><div className="text-[9px] uppercase tracking-widest opacity-50 font-bold mb-1">Today</div><div className="text-xl font-black font-mono" style={{ color: p.theme.accentColor }}>+{formatStars(p.starsToday)}</div></div>
    </div>
    <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">
      <Summary p={p} className="text-[clamp(1rem,2.7vw,1.4rem)] font-bold leading-snug tracking-tight line-clamp-[11]" />
    </div>
    <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-3">
      <div className="text-[9px] uppercase tracking-widest opacity-50 font-bold mb-1.5">Topics</div>
      <div className="flex flex-wrap gap-1.5">
        {p.keywordList.slice(0, 10).map((tag, i) => (
          <span key={i} className="px-2.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-wider opacity-70">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const Chat: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#0f172a", color: "#ffffff" })}>
    <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.05] border-b border-white/10">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-sm">🤖</div>
      <div className="flex-1">
        <div className="text-[13px] font-black leading-none">Trending Bot</div>
        <div className="text-[9px] text-emerald-400 mt-1">● AI 在线</div>
      </div>
      <span className="text-[9px] font-mono text-zinc-500">AI</span>
    </div>
    <div className="flex-1 flex flex-col gap-3 px-4 py-4 overflow-hidden">
      <div className="self-end max-w-[75%] rounded-2xl rounded-br-sm bg-cyan-500/20 border border-cyan-400/30 px-3 py-2">
        <div className="text-[11px]">今天什么项目最火？</div>
      </div>
      <div className="flex gap-2 items-end">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[9px]">🤖</div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 border border-white/10 px-3 py-2.5">
          <div className="text-[11px] font-bold">{p.projectName.split("/")[1]} 🔥</div>
          <Summary p={p} className="text-[10px] leading-relaxed text-zinc-300 mt-1 line-clamp-[12]" />
          <div className="flex gap-1.5 mt-2">
            <span className="px-1.5 py-0.5 rounded bg-cyan-400/15 text-cyan-300 text-[8px] font-mono">★{formatStars(p.stars)}</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-400/15 text-emerald-300 text-[8px] font-mono">+{formatStars(p.starsToday)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-end">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[9px]">🤖</div>
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 border border-white/10 px-3 py-2">
          <div className="text-[9px] text-zinc-400 mb-1.5">相关话题</div>
          <div className="flex flex-wrap gap-1.5">
            {p.keywordList.slice(0, 6).map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-white/10 text-[9px]">#{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <div className="px-4 py-3 border-t border-white/10 flex items-center gap-2">
      <div className="flex-1 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-[10px] text-zinc-500">输入消息…</div>
      <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-sm">➤</div>
    </div>
  </div>
);

const Neon: Variant = (p) => (
  <div {...base(p, "px-[7%] py-[6%] relative", { backgroundColor: "#05050c", color: "#ffffff" })}>
    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-fuchsia-500/20 blur-[80px] pointer-events-none" />
    <div className="absolute -bottom-20 -left-16 w-60 h-60 rounded-full bg-cyan-500/20 blur-[80px] pointer-events-none" />
    <div className="relative flex items-center justify-between">
      <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-fuchsia-300 [text-shadow:0_0_12px_rgba(232,121,249,0.9)]">Rank #{p.currentIndex + 1}</span>
      <span className="font-mono text-[9px] text-zinc-500">{formatStars(p.stars)} ★</span>
    </div>
    <h2 className="relative mt-3 text-[28px] font-black leading-tight tracking-tight break-all [text-shadow:0_0_24px_rgba(34,211,238,0.65),0_0_48px_rgba(34,211,238,0.35)]">{p.projectName}</h2>
    <div className="relative mt-3 h-[2px] w-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-transparent" />
    <div className="relative flex gap-2.5 my-5">
      <div className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-400/5 p-3 [box-shadow:0_0_18px_rgba(34,211,238,0.25),inset_0_0_12px_rgba(34,211,238,0.1)]">
        <div className="text-[8px] uppercase tracking-widest text-cyan-300/70 font-bold">Stars</div>
        <div className="text-2xl font-black font-mono text-cyan-200 [text-shadow:0_0_12px_rgba(34,211,238,0.8)]">{formatStars(p.stars)}</div>
      </div>
      <div className="flex-1 rounded-xl border border-fuchsia-400/40 bg-fuchsia-400/5 p-3 [box-shadow:0_0_18px_rgba(232,121,249,0.25),inset_0_0_12px_rgba(232,121,249,0.1)]">
        <div className="text-[8px] uppercase tracking-widest text-fuchsia-300/70 font-bold">Today</div>
        <div className="text-2xl font-black font-mono text-fuchsia-200 [text-shadow:0_0_12px_rgba(232,121,249,0.8)]">+{formatStars(p.starsToday)}</div>
      </div>
    </div>
    <div className="relative flex-1 min-h-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <Summary p={p} className="text-[15px] font-semibold leading-relaxed line-clamp-[11]" />
    </div>
    <div className="relative pt-3 flex flex-wrap gap-1.5">
      {p.keywordList.slice(0, 6).map((tag, i) => (
        <span key={i} className="px-2 py-0.5 rounded border border-cyan-400/50 text-cyan-300 text-[9px] font-bold [text-shadow:0_0_8px_rgba(34,211,238,0.8)]">{tag}</span>
      ))}
    </div>
  </div>
);

const Newspaper: Variant = (p) => (
  <div {...base(p, "px-[8%] py-[7%]", { backgroundColor: "#f5f1e6", color: "#191512" })}>
    <div className="text-center">
      <h2 className="text-[16px] font-black tracking-[0.15em]" style={{ fontFamily: "Georgia, serif" }}>THE DAILY REPO</h2>
      <div className="mt-1 border-y border-[#191512] py-0.5 font-mono text-[7px] uppercase tracking-widest opacity-60">Vol.1 · {p.displayDate}</div>
    </div>
    <div className="mt-4 text-[8px] font-black tracking-[0.3em] uppercase opacity-60">Today's Pick · Rank #{p.currentIndex + 1}</div>
    <h3 className="text-[22px] font-black leading-tight mt-1" style={{ fontFamily: "Georgia, serif" }}>{p.projectName.split("/")[1] || p.projectName}</h3>
    <div className="font-mono text-[9px] opacity-50 mt-1">{p.projectUrl} · {formatStars(p.stars)}★</div>
    <div className="flex-1 min-h-0 overflow-hidden mt-3">
      <div className="h-px bg-[#191512]/40 mb-2" />
      <Summary p={p} className="text-[12px] leading-relaxed line-clamp-[14]" />
    </div>
    <div className="mt-3 pt-2 border-t border-[#191512] flex justify-between text-[8px] uppercase tracking-widest opacity-70">
      <span className="font-bold">Topics: {p.keywordList.slice(0, 3).join(" · ")}</span>
      <span className="font-mono">+{formatStars(p.starsToday)} today</span>
    </div>
  </div>
);

const Minimal: Variant = (p) => (
  <div {...base(p, "items-center px-[10%] py-[10%]", { backgroundColor: "#ffffff", color: "#18181b" })}>
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="text-[72px] font-black leading-none tracking-tighter">{formatStars(p.stars)}</div>
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-40 mt-2">Total Stars</div>
      <div className="w-8 h-[2px] bg-zinc-900 my-6" />
      <div className="text-lg font-bold tracking-tight">{p.projectName.split("/")[1] || p.projectName}</div>
      <div className="font-mono text-[11px] opacity-40 mt-1">{p.projectUrl.split("/")[0]} · RANK #{p.currentIndex + 1} · +{formatStars(p.starsToday)}</div>
      <Summary p={p} className="text-[14px] leading-relaxed opacity-60 mt-6 line-clamp-[8]" />
    </div>
    <div className="flex gap-3 text-[8px] uppercase tracking-[0.2em] opacity-40">
      {p.keywordList.slice(0, 3).map((tag, i) => <span key={i}>{tag}</span>)}
    </div>
  </div>
);

const Notebook: Variant = (p) => (
  <div {...base(p, "px-[9%] py-[8%] relative", { backgroundColor: "#fbf7ef", color: "#3a332b" })}>
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-rose-200/90 -rotate-2" />
    <div className="mt-5 flex items-start gap-2">
      <span className="text-[30px] leading-none text-rose-400" style={{ fontFamily: "'Caveat', cursive" }}>★</span>
      <h2 className="text-[32px] leading-tight" style={{ fontFamily: "'Caveat', cursive" }}>{p.projectName.split("/")[1] || p.projectName}</h2>
    </div>
    <div className="font-mono text-[9px] opacity-50 mt-1">RANK #{p.currentIndex + 1} · {formatStars(p.stars)} stars · +{formatStars(p.starsToday)} today</div>
    <div className="flex-1 min-h-0 overflow-hidden mt-4 border-2 border-dashed border-[#3a332b]/30 rounded-xl p-3.5">
      <Summary p={p} className="text-[20px] leading-snug line-clamp-[13]" style={{ fontFamily: "'Caveat', cursive" }} />
    </div>
    <div className="flex flex-wrap gap-2 mt-4">
      <span className="w-14 h-14 rounded-full bg-amber-200 flex flex-col items-center justify-center text-[9px] font-bold -rotate-3">{formatStars(p.stars)}<br />stars</span>
      <span className="w-14 h-14 rounded-full bg-emerald-200 flex flex-col items-center justify-center text-[9px] font-bold rotate-3">+{formatStars(p.starsToday)}<br />today</span>
      <span className="px-3 py-1.5 rounded-lg bg-white border border-[#3a332b]/20 text-[10px] font-bold self-center">#{p.keywordList[0] || "开源"}</span>
    </div>
  </div>
);

const Timeline: Variant = (p) => (
  <div {...base(p, "px-[9%] py-[7%]", { backgroundColor: "#0d1117", color: "#ffffff" })}>
    <span className="text-[9px] font-black tracking-[0.25em] uppercase opacity-50">Timeline Node #{p.currentIndex + 1}</span>
    <div className="flex items-center gap-3 mt-3">
      <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-black" style={{ backgroundColor: p.theme.accentColor }}>{String(p.currentIndex + 1).padStart(2, "0")}</span>
      <div className="min-w-0">
        <div className="text-xl font-black truncate">{p.projectName.split("/")[1] || p.projectName}</div>
        <div className="font-mono text-[11px] opacity-50">{p.projectUrl.split("/")[0]} · {p.displayDate}</div>
      </div>
    </div>
    <div className="mt-4 pl-[52px] relative">
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/15" />
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5"><div className="text-[9px] uppercase opacity-50">Total Stars</div><div className="text-lg font-black font-mono">{formatStars(p.stars)}</div></div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5"><div className="text-[9px] uppercase opacity-50">Today</div><div className="text-lg font-black font-mono" style={{ color: p.theme.accentColor }}>+{formatStars(p.starsToday)}</div></div>
      </div>
    </div>
    <div className="flex-1 min-h-0 overflow-hidden mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
      <Summary p={p} className="text-[14px] leading-relaxed opacity-90 line-clamp-[10]" />
    </div>
    <div className="pt-3 flex gap-1.5">
      {p.keywordList.slice(0, 5).map((tag, i) => (
        <span key={i} className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: p.theme.accentColor + "22", color: p.theme.accentColor }}>{tag}</span>
      ))}
    </div>
  </div>
);

const Browser: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#f6f8fa", color: "#18181b" })}>
    <div className="bg-[#e8ecf0] px-3 pt-2">
      <div className="flex gap-1">
        <div className="rounded-t-lg bg-[#f6f8fa] px-3 py-1.5 text-[10px] font-bold border border-zinc-200 border-b-0">{p.projectName.split("/")[1]}</div>
        <div className="rounded-t-lg bg-[#e8ecf0] px-3 py-1.5 text-[10px] text-zinc-500">+ new tab</div>
      </div>
    </div>
    <div className="flex items-center gap-2 bg-[#e8ecf0] px-3 py-1.5 border-b border-zinc-200">
      <div className="flex-1 flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1 text-[9px] text-zinc-500">
        <span className="text-emerald-500">🔒</span> {p.projectUrl}
      </div>
    </div>
    <div className="flex-1 px-4 py-3 overflow-hidden">
      <div className="flex items-start gap-3">
        <img className="w-11 h-11 rounded-lg object-cover" {...avatarFor(p.projectName, p.avatarUrl)} />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black truncate">{p.projectName}</div>
          <div className="text-[9px] text-zinc-500 mt-0.5">{p.keywordList.slice(0, 3).join(" · ")}</div>
          <div className="flex gap-1.5 mt-1.5">
            <span className="px-2 py-0.5 rounded-full bg-yellow-50 border border-yellow-200 text-[8px] text-yellow-700">★ {formatStars(p.stars)}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[8px] text-emerald-700">▲ +{formatStars(p.starsToday)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-3">
        <div className="text-[9px] font-black text-zinc-400 uppercase mb-1.5">README</div>
        <Summary p={p} className="text-[11px] leading-relaxed line-clamp-[13]" />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {p.keywordList.slice(0, 8).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-[#eef2ff] text-indigo-600 text-[8px] font-bold">{tag}</span>
        ))}
      </div>
    </div>
    <div className="px-4 py-2 border-t border-zinc-200 bg-white text-[8px] text-zinc-400 flex justify-between">
      <span>Rank #{p.currentIndex + 1}</span>
      <span className="font-mono">@xintao</span>
    </div>
  </div>
);

const GithubUI: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#ffffff", color: "#18181b" })}>
    <div className="px-4 py-3 border-b border-zinc-200 flex items-center gap-2">
      <span className="text-[11px] font-black">#{p.currentIndex + 1} · {p.projectName.split("/")[1] || p.projectName}</span>
      <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold">Merged</span>
    </div>
    <div className="flex-1 px-4 py-3 overflow-hidden">
      <div className="flex items-center gap-2.5">
        <img className="w-10 h-10 rounded-full object-cover" {...avatarFor(p.projectName, p.avatarUrl)} />
        <div className="min-w-0">
          <div className="text-[12px] font-black truncate">{p.projectName}</div>
          <div className="text-[9px] text-zinc-500">{formatStars(p.stars)} stars · rank #{p.currentIndex + 1}</div>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="text-[9px] font-black text-zinc-400 uppercase mb-1.5">Summary</div>
        <Summary p={p} className="text-[11px] leading-relaxed line-clamp-[12]" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-zinc-200 p-2.5"><div className="text-[8px] text-zinc-400">Stars</div><div className="text-base font-black font-mono">{formatStars(p.stars)}</div></div>
        <div className="rounded-lg border border-zinc-200 p-2.5"><div className="text-[8px] text-zinc-400">Today</div><div className="text-base font-black font-mono text-emerald-600">+{formatStars(p.starsToday)}</div></div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.keywordList.slice(0, 8).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-[#eef2ff] text-indigo-600 text-[8px] font-bold">{tag}</span>
        ))}
      </div>
    </div>
    <div className="px-4 py-2 border-t border-zinc-200 flex justify-between text-[8px] text-zinc-400">
      <span>✓ merged {p.timeText}</span>
      <span className="font-mono">@xintao</span>
    </div>
  </div>
);

const Cinema: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#0b0b0d", color: "#ffffff" })}>
    <div className="px-6 pt-4 flex justify-between text-[8px] uppercase tracking-[0.3em] text-zinc-500">
      <span>Rank #{p.currentIndex + 1}</span>
      <span className="font-mono">★ {formatStars(p.stars)}</span>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-[9px] font-black tracking-[0.35em] uppercase mb-3" style={{ color: p.theme.accentColor }}>Now Showing</div>
      <h2 className="text-[26px] font-black leading-tight">{p.projectName.split("/")[1] || p.projectName}</h2>
      <div className="text-[9px] tracking-[0.25em] uppercase text-zinc-500 mt-2">{p.projectName.split("/")[0]}</div>
      <div className="w-12 h-[2px] my-4" style={{ backgroundColor: p.theme.accentColor }} />
      <Summary p={p} className="text-[11px] leading-relaxed text-zinc-300 max-w-[240px] line-clamp-[8]" />
      <div className="flex gap-2 mt-5 text-[9px] uppercase tracking-widest text-zinc-400">
        {p.keywordList.slice(0, 3).map((tag, i) => <span key={i}>{tag}</span>)}
      </div>
    </div>
    <div className="border-t border-white/10 px-6 py-3 flex justify-between text-[8px] uppercase tracking-[0.25em] text-zinc-500">
      <span>Today +{formatStars(p.starsToday)}</span>
      <span className="font-mono">@xintao</span>
    </div>
  </div>
);

const Hud: Variant = (p) => (
  <div {...base(p, "px-[7%] py-[6%] relative", { backgroundColor: "#020a10", color: "#a5f3fc" })}>
    <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ background: "repeating-linear-gradient(0deg, transparent 0 2px, #22d3ee 2px 3px)" }} />
    <div className="relative font-mono text-[9px] tracking-[0.25em] uppercase text-cyan-500/70">Target #{String(p.currentIndex + 1).padStart(2, "0")}</div>
    <h2 className="relative mt-2 text-[26px] font-bold leading-tight break-all [text-shadow:0_0_16px_rgba(34,211,238,0.45)]">{p.projectName.split("/")[1] || p.projectName}</h2>
    <div className="relative font-mono text-[9px] opacity-60 mt-1">{p.projectUrl.split("/")[0]} · stars {formatStars(p.stars)}</div>
    <div className="relative grid grid-cols-3 gap-2 mt-4">
      <div className="border border-cyan-400/30 bg-cyan-400/5 rounded p-2"><div className="text-[7px] uppercase opacity-60">Rank</div><div className="font-mono text-sm font-bold">#{p.currentIndex + 1}</div></div>
      <div className="border border-cyan-400/30 bg-cyan-400/5 rounded p-2"><div className="text-[7px] uppercase opacity-60">Stars</div><div className="font-mono text-sm font-bold">{formatStars(p.stars)}</div></div>
      <div className="border border-cyan-400/30 bg-cyan-400/5 rounded p-2"><div className="text-[7px] uppercase opacity-60">Delta</div><div className="font-mono text-sm font-bold text-emerald-300">+{formatStars(p.starsToday)}</div></div>
    </div>
    <div className="relative flex-1 min-h-0 overflow-hidden mt-3 border border-cyan-400/20 bg-cyan-400/5 rounded p-3">
      <div className="font-mono text-[8px] uppercase text-cyan-500/70 mb-1.5">&gt; readme.summary</div>
      <Summary p={p} className="font-mono text-[13px] leading-relaxed opacity-90 line-clamp-[12]" />
    </div>
    <div className="relative pt-3 flex gap-1.5">
      {p.keywordList.slice(0, 6).map((tag, i) => (
        <span key={i} className="px-2 py-0.5 border border-cyan-400/40 text-cyan-300 font-mono text-[8px]">#{tag.toUpperCase()}</span>
      ))}
    </div>
  </div>
);

const Pixel: Variant = (p) => (
  <div {...base(p, "px-[7%] py-[6%]", { backgroundColor: "#1b1b3a", color: "#f4f4f4", fontFamily: "'Press Start 2P', monospace" })}>
    <div className="flex justify-between text-[8px] text-[#7ee787]"><span>STAGE #{p.currentIndex + 1}</span><span>★{formatStars(p.stars)}</span></div>
    <h2 className="text-[17px] leading-snug text-white mt-3 [text-shadow:3px_3px_0_#000]">{p.projectName.split("/")[1] || p.projectName}</h2>
    <div className="flex gap-2 mt-4">
      <div className="flex-1 bg-[#3b3b6b] p-2 [box-shadow:3px_3px_0_#000]"><div className="text-[6px] text-[#8b8bd4]">RANK</div><div className="text-[10px] text-[#ffd23f]">#{p.currentIndex + 1}</div></div>
      <div className="flex-1 bg-[#3b3b6b] p-2 [box-shadow:3px_3px_0_#000]"><div className="text-[6px] text-[#8b8bd4]">TODAY</div><div className="text-[10px] text-[#7ee787]">+{formatStars(p.starsToday)}</div></div>
    </div>
    <div className="flex-1 min-h-0 overflow-hidden mt-3 bg-[#3b3b6b] p-3 [box-shadow:3px_3px_0_#000]">
      <Summary p={p} className="text-[9px] leading-relaxed text-[#d4d4f0] line-clamp-[14]" />
    </div>
    <div className="flex gap-1.5 mt-3">
      {p.keywordList.slice(0, 4).map((tag, i) => (
        <span key={i} className={`px-2 py-1 text-[6px] [box-shadow:2px_2px_0_#000] ${i % 2 === 0 ? "bg-[#ffd23f] text-[#1b1b3a]" : "bg-[#7ee787] text-[#1b1b3a]"}`}>#{tag}</span>
      ))}
    </div>
  </div>
);

const Ticket: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#fdf6ec", color: "#2a2118" })}>
    <div className="px-5 pt-4">
      <div className="text-[8px] font-black tracking-[0.25em] uppercase opacity-60">Ticket #{p.currentIndex + 1}</div>
      <h2 className="text-[20px] font-black leading-tight mt-1">{p.projectName.split("/")[1] || p.projectName}</h2>
      <div className="font-mono text-[8px] opacity-50 mt-0.5">{p.projectUrl.split("/")[0]} · {p.displayDate} · {p.timeText}</div>
    </div>
    <div className="flex-1 px-5 py-3 space-y-2 overflow-hidden">
      <div className="flex justify-between border-b border-dashed border-[#2a2118]/30 pb-2 text-[10px]"><span>RANK</span><span className="font-mono font-bold">#{p.currentIndex + 1}</span></div>
      <div className="flex justify-between border-b border-dashed border-[#2a2118]/30 pb-2 text-[10px]"><span>TOTAL STARS</span><span className="font-mono font-bold">{formatStars(p.stars)}</span></div>
      <div className="flex justify-between border-b border-dashed border-[#2a2118]/30 pb-2 text-[10px]"><span>TODAY</span><span className="font-mono font-bold text-emerald-700">+{formatStars(p.starsToday)}</span></div>
      <Summary p={p} className="text-[11px] leading-relaxed pt-1 line-clamp-[12]" />
    </div>
    <div className="border-t-2 border-dashed border-[#2a2118]/40" />
    <div className="px-5 py-3 flex items-center gap-3">
      <div className="flex gap-1.5 flex-1 flex-wrap">
        {p.keywordList.slice(0, 6).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 border border-[#2a2118]/30 text-[8px] font-bold">#{tag}</span>
        ))}
      </div>
      <div className="h-6 w-24 opacity-80" style={{ background: "repeating-linear-gradient(90deg, #2a2118 0 2px, transparent 2px 5px)" }} />
    </div>
  </div>
);

const Sign: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#e8ecf1", color: "#ffffff" })}>
    <div className="w-full h-full rounded-2xl border-4 border-white p-[5%] flex flex-col" style={{ backgroundColor: "#0b6b3a" }}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black tracking-[0.25em] uppercase opacity-80">Rank #{p.currentIndex + 1}</span>
        <span className="text-[9px] font-black tracking-[0.25em] uppercase opacity-80">★ {formatStars(p.stars)}</span>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-[28px] font-black leading-none">{p.projectName.split("/")[1] || p.projectName}</div>
        <div className="font-mono text-[10px] opacity-80 mt-2">{p.projectUrl.split("/")[0]} · +{formatStars(p.starsToday)} today</div>
        <div className="my-4 h-[3px] w-16 bg-white" />
        <Summary p={p} className="text-[12px] leading-relaxed opacity-95 line-clamp-[10]" />
        <div className="flex gap-2 mt-4">
          {p.keywordList.slice(0, 3).map((tag, i) => (
            <span key={i} className={`px-2.5 py-1 text-[9px] font-black uppercase ${i === 0 ? "bg-white text-[#0b6b3a]" : "bg-white/20"}`}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-2.5 border-t border-white/40 text-[9px] font-black tracking-[0.2em] uppercase">
        <span>This Exit</span>
        <span className="font-mono">@xintao · {p.timeText}</span>
      </div>
    </div>
  </div>
);

const Toc: Variant = (p) => (
  <div {...base(p, "px-[9%] py-[8%]", { backgroundColor: "#fdfaf1", color: "#2a1f3d" })}>
    <div className="flex justify-between text-[8px] font-black tracking-[0.3em] uppercase opacity-50">
      <span>Chapter {String(p.currentIndex + 1).padStart(2, "0")}</span>
      <span className="font-mono">P.01</span>
    </div>
    <h2 className="text-[24px] font-black leading-tight mt-3" style={{ fontFamily: "Georgia, serif" }}>{p.projectName.split("/")[1] || p.projectName}</h2>
    <div className="font-mono text-[9px] opacity-50 mt-1">{p.projectUrl.split("/")[0]} · {formatStars(p.stars)} stars</div>
    <div className="mt-3 w-10 h-[2px] bg-amber-500" />
    <div className="flex-1 min-h-0 overflow-hidden mt-3">
      <Summary p={p} className="text-[13px] leading-relaxed line-clamp-[14]" style={{ fontFamily: "Georgia, serif" }} />
    </div>
    <div className="mt-3 pt-2 border-t border-[#2a1f3d]/15 flex justify-between text-[9px] font-bold">
      <span style={{ fontFamily: "Georgia, serif" }}>Topics：{p.keywordList.slice(0, 3).join(" · ")}</span>
      <span className="font-mono opacity-60">+{formatStars(p.starsToday)}</span>
    </div>
  </div>
);

const Notify: Variant = (p) => (
  <div {...base(p, "px-[6%] py-[6%]", { background: "linear-gradient(to bottom, #14171c, #0b0d10)", color: "#ffffff" })}>
    <div className="text-center text-[9px] font-mono text-zinc-500 mb-3">{p.displayDate} {p.timeText}</div>
    <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-4 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg" style={{ background: `linear-gradient(135deg, ${p.theme.accentColor}, ${p.theme.textColor})` }}>🔥</div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold" style={{ color: p.theme.accentColor }}>GitHub Trending</div>
          <div className="text-[9px] text-zinc-400">刚刚</div>
        </div>
      </div>
      <h2 className="text-lg font-black mt-3">{p.projectName.split("/")[1] || p.projectName}</h2>
      <Summary p={p} className="text-[11px] leading-relaxed text-zinc-300 mt-1.5 line-clamp-[10]" />
      <div className="flex gap-2 mt-3">
        <span className="px-2 py-1 rounded-lg bg-white/10 text-[9px] font-bold">★ {formatStars(p.stars)}</span>
        <span className="px-2 py-1 rounded-lg bg-emerald-400/15 text-emerald-300 text-[9px] font-bold">+{formatStars(p.starsToday)}</span>
      </div>
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {p.keywordList.slice(0, 6).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-white/10 text-[8px]">#{tag}</span>
        ))}
      </div>
    </div>
    <div className="flex-1" />
    <div className="text-center text-[9px] text-zinc-500 font-mono">@xintao · 查看全部</div>
  </div>
);

const Receipt: Variant = (p) => (
  <div {...base(p, "font-mono", { backgroundColor: "#fbfaf6", color: "#1d1d1d" })}>
    <div className="px-6 pt-5 text-center">
      <div className="text-[11px] font-black tracking-[0.2em]">PROJECT RECEIPT</div>
      <div className="text-[8px] opacity-60 mt-1">No.{p.displayDate.replace(/-/g, "")}-{String(p.currentIndex + 1).padStart(2, "0")}</div>
      <div className="mt-2 border-t border-dashed border-zinc-400" />
    </div>
    <div className="flex-1 px-6 py-3 space-y-[7px] overflow-hidden">
      <div className="text-[11px] font-bold">{p.projectName}</div>
      <div className="flex justify-between text-[10px]"><span>RANK</span><span>#{p.currentIndex + 1}</span></div>
      <div className="flex justify-between text-[10px]"><span>TOTAL STARS</span><span>{formatStars(p.stars)}</span></div>
      <div className="flex justify-between text-[10px]"><span>TODAY</span><span className="text-emerald-700">+{formatStars(p.starsToday)}</span></div>
      <div className="border-t border-dashed border-zinc-400 pt-1.5" />
      <Summary p={p} className="text-[9px] leading-relaxed opacity-80 line-clamp-[10]" />
      <div className="flex justify-between text-[10px]"><span>Topics</span><span>{p.keywordList.slice(0, 3).map((t) => `#${t}`).join(" ")}</span></div>
      <div className="border-t border-dashed border-zinc-400 pt-1.5" />
      <div className="text-center text-[9px] opacity-70">@xintao · {p.timeText}</div>
    </div>
    <div className="px-6 pb-4 flex justify-center">
      <div className="h-6 w-[70%] opacity-70" style={{ background: "repeating-linear-gradient(90deg, #1d1d1d 0 2px, transparent 2px 5px)" }} />
    </div>
  </div>
);

const Aurora: Variant = (p) => (
  <div {...base(p, "px-[7%] py-[6%] relative", { backgroundColor: "#060b18", color: "#ffffff" })}>
    <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-violet-500/30 blur-[90px]" />
    <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-cyan-400/25 blur-[100px]" />
    <div className="relative font-mono text-[9px] tracking-[0.25em] uppercase opacity-60">Rank #{p.currentIndex + 1} · Today's Pick</div>
    <h2 className="relative text-[26px] font-black leading-tight mt-2">{p.projectName.split("/")[1] || p.projectName}</h2>
    <div className="relative font-mono text-[9px] opacity-50 mt-1">{p.projectUrl.split("/")[0]} · ★ {formatStars(p.stars)}</div>
    <div className="relative flex gap-2.5 mt-4">
      <div className="flex-1 rounded-2xl bg-white/10 border border-white/15 p-3 backdrop-blur-md"><div className="text-[8px] uppercase opacity-60">Stars</div><div className="text-lg font-black font-mono">{formatStars(p.stars)}</div></div>
      <div className="flex-1 rounded-2xl bg-emerald-400/10 border border-emerald-300/20 p-3 backdrop-blur-md"><div className="text-[8px] uppercase opacity-60">Today</div><div className="text-lg font-black font-mono text-emerald-300">+{formatStars(p.starsToday)}</div></div>
    </div>
    <div className="relative flex-1 min-h-0 overflow-hidden mt-3 rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur-md">
      <Summary p={p} className="text-[15px] font-semibold leading-relaxed line-clamp-[11]" />
    </div>
    <div className="relative pt-3 flex gap-1.5 flex-wrap">
      {p.keywordList.slice(0, 6).map((tag, i) => (
        <span key={i} className="px-2.5 py-1 rounded-full bg-cyan-400/15 text-cyan-200 text-[9px] font-bold">#{tag}</span>
      ))}
    </div>
  </div>
);

const Cyber: Variant = (p) => (
  <div {...base(p, "px-[7%] py-[6%] relative", { backgroundColor: "#080a12", color: "#d6ffe0" })}>
    <div className="absolute inset-0 opacity-[0.05]" style={{ background: "linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
    <span className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
    <span className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-fuchsia-400" />
    <span className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-fuchsia-400" />
    <span className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
    <div className="relative font-mono text-[9px] tracking-[0.25em] uppercase text-cyan-300/80">Target #{String(p.currentIndex + 1).padStart(2, "0")} · 锁定</div>
    <h2 className="relative mt-2 text-[24px] font-black leading-tight break-all [text-shadow:0_0_16px_rgba(34,211,238,0.5)]">{p.projectName.split("/")[1] || p.projectName}</h2>
    <div className="relative font-mono text-[9px] opacity-60 mt-1">{p.projectUrl.split("/")[0]} · {formatStars(p.stars)}★ · +{formatStars(p.starsToday)}</div>
    <div className="relative flex-1 min-h-0 overflow-hidden mt-4 border border-cyan-400/30 bg-cyan-400/5 p-3.5">
      <Summary p={p} className="text-[14px] leading-relaxed line-clamp-[12]" />
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {p.keywordList.slice(0, 6).map((tag, i) => (
          <span key={i} className={`px-2 py-0.5 border font-mono text-[8px] ${i % 2 === 0 ? "border-cyan-400/40 text-cyan-300" : "border-fuchsia-400/40 text-fuchsia-300"}`}>#{tag}</span>
        ))}
      </div>
    </div>
    <div className="relative mt-3 grid grid-cols-2 gap-2">
      <div className="border border-cyan-400/25 p-2"><div className="text-[7px] uppercase opacity-60">Stars</div><div className="font-mono text-sm font-bold">{formatStars(p.stars)}</div></div>
      <div className="border border-fuchsia-400/25 p-2"><div className="text-[7px] uppercase opacity-60">Today</div><div className="font-mono text-sm font-bold text-fuchsia-300">+{formatStars(p.starsToday)}</div></div>
    </div>
  </div>
);

const Glitch: Variant = (p) => (
  <div {...base(p, "px-[7%] py-[6%] relative", { backgroundColor: "#0d0d12", color: "#ffffff" })}>
    <div className="relative font-mono text-[9px] tracking-[0.25em] uppercase text-cyan-300/80">&gt; decode #{String(p.currentIndex + 1).padStart(2, "0")}</div>
    <h2 className="relative mt-2 text-[24px] font-black leading-tight break-all">
      <span className="absolute inset-0 text-cyan-400/60 translate-x-[1.5px]">{p.projectName}</span>
      <span className="absolute inset-0 text-fuchsia-400/60 -translate-x-[1.5px]">{p.projectName}</span>
      <span className="relative">{p.projectName}</span>
    </h2>
    <div className="relative font-mono text-[9px] opacity-60 mt-1">{p.projectUrl.split("/")[0]} · ★{formatStars(p.stars)} · +{formatStars(p.starsToday)}</div>
    <div className="relative flex-1 min-h-0 overflow-hidden mt-4 border border-white/15 bg-white/[0.04] p-3.5">
      <Summary p={p} className="text-[14px] leading-relaxed line-clamp-[12]" />
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {p.keywordList.slice(0, 6).map((tag, i) => (
          <span key={i} className={`px-2 py-0.5 border text-[8px] ${i % 2 === 0 ? "border-cyan-400/40 text-cyan-300" : "border-white/20"}`}>#{tag}</span>
        ))}
      </div>
    </div>
    <div className="relative mt-3 grid grid-cols-2 gap-2 font-mono">
      <div className="border border-white/15 p-2"><div className="text-[7px] uppercase opacity-60">Stars</div><div className="text-sm font-bold">{formatStars(p.stars)}</div></div>
      <div className="border border-cyan-400/30 p-2"><div className="text-[7px] uppercase opacity-60">Today</div><div className="text-sm font-bold text-cyan-300">+{formatStars(p.starsToday)}</div></div>
    </div>
  </div>
);

const Bauhaus: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#f3f0e8", color: "#111111" })}>
    <div className="absolute top-0 left-0 w-28 h-28 bg-blue-600 rounded-br-[3rem]" />
    <div className="absolute bottom-0 right-0 w-24 h-24 bg-yellow-400" />
    <div className="relative flex-1 flex flex-col px-[8%] py-[7%]">
      <span className="self-end bg-black text-white px-2 py-1 text-[8px] font-black tracking-[0.2em] uppercase">#{p.currentIndex + 1}</span>
      <h2 className="text-[24px] font-black leading-tight mt-4">{p.projectName.split("/")[1] || p.projectName}</h2>
      <div className="flex gap-3 mt-4">
        <div className="bg-red-500 text-white px-3 py-2"><div className="text-[7px] uppercase opacity-80">Stars</div><div className="text-base font-black">{formatStars(p.stars)}</div></div>
        <div className="bg-black text-white px-3 py-2"><div className="text-[7px] uppercase opacity-80">Today</div><div className="text-base font-black text-yellow-300">+{formatStars(p.starsToday)}</div></div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden mt-4">
        <Summary p={p} className="text-[12px] leading-relaxed font-medium line-clamp-[13]" />
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        {p.keywordList.slice(0, 4).map((tag, i) => (
          <span key={i} className={`px-2 py-1 text-[8px] font-black uppercase ${i % 2 === 0 ? "bg-blue-600 text-white" : "bg-yellow-400"}`}>{tag}</span>
        ))}
      </div>
    </div>
  </div>
);

const Greeting: Variant = (p) => (
  <div {...base(p, "items-center px-[9%] py-[8%] relative", { backgroundColor: "#fdf9f0", color: "#8a6d2f" })}>
    <div className="absolute inset-3 rounded-[1.5rem] border border-[#d4b978] pointer-events-none" />
    <div className="text-[8px] font-black tracking-[0.4em] uppercase text-[#b3984f]">Rank #{p.currentIndex + 1} · A Gift for You</div>
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <h2 className="text-[28px] font-black leading-tight" style={{ fontFamily: "Georgia, serif" }}>{p.projectName.split("/")[1] || p.projectName}</h2>
      <div className="mt-4 w-10 h-[2px] bg-[#d4b978]" />
      <Summary p={p} className="text-[14px] leading-relaxed mt-4 line-clamp-[10]" style={{ fontFamily: "Georgia, serif" }} />
      <div className="flex gap-2 mt-5">
        <span className="px-3 py-1 rounded-full border border-[#d4b978] text-[9px] font-bold">★ {formatStars(p.stars)}</span>
        <span className="px-3 py-1 rounded-full border border-[#d4b978] text-[9px] font-bold">+{formatStars(p.starsToday)}</span>
      </div>
    </div>
    <div className="text-[9px] font-black tracking-[0.3em] uppercase text-[#b3984f]">— @xintao —</div>
  </div>
);

const Infographic: Variant = (p) => {
  const total = parseFloat(String(p.stars).replace(/k/gi, "").replace(/,/g, "")) || 1;
  const today = parseFloat(String(p.starsToday).replace(/,/g, "")) || 1;
  return (
    <div {...base(p, "px-[8%] py-[7%]", { backgroundColor: "#ffffff", color: "#18181b" })}>
      <div className="flex items-center gap-3">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-8 border-zinc-100" />
          <div className="absolute inset-0 rounded-full border-8 border-emerald-500" style={{ borderRightColor: "transparent", transform: "rotate(-90deg)" }} />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-black">#{p.currentIndex + 1}</div>
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-black truncate">{p.projectName.split("/")[1] || p.projectName}</div>
          <div className="text-[9px] opacity-50 mt-0.5">{p.projectUrl.split("/")[0]} · {p.displayDate}</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-2.5"><div className="text-base font-black">{formatStars(p.stars)}</div><div className="text-[7px] uppercase opacity-50 mt-0.5">Stars</div></div>
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-2.5"><div className="text-base font-black text-emerald-600">+{formatStars(p.starsToday)}</div><div className="text-[7px] uppercase opacity-50 mt-0.5">Today</div></div>
        <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-2.5"><div className="text-base font-black">{Math.round((today / Math.max(total, 1)) * 10000) / 100}%</div><div className="text-[7px] uppercase opacity-50 mt-0.5">增长</div></div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden mt-4">
        <Summary p={p} className="text-[12px] leading-relaxed line-clamp-[11]" />
        <div className="flex flex-wrap gap-1.5 mt-3">
          {p.keywordList.slice(0, 8).map((tag, i) => (
            <span key={i} className={`px-2 py-0.5 rounded text-[8px] font-bold ${i === 0 ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="pt-3 border-t border-zinc-200 flex justify-between text-[9px] uppercase tracking-widest opacity-50">
        <span className="font-bold">@xintao</span>
        <span className="font-mono">{p.timeText}</span>
      </div>
    </div>
  );
};

const Pornhub: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#000000", color: "#ffffff" })}>
    <div className="flex items-center justify-center gap-1 py-2.5 border-b border-white/10 relative">
      <span className="text-[18px] font-black text-orange-500 tracking-tight">Github</span>
      <span className="text-[13px] font-black text-orange-500">▶</span>
      <span className="text-[18px] font-black text-orange-500 tracking-tight">hub</span>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-orange-500 text-orange-500 text-[8px] font-bold">HD</span>
    </div>
    <div className="relative flex-1 flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black" />
      <div className="relative text-center px-6">
        <div className="text-[22px] font-black leading-tight text-orange-500">{p.projectName.split("/")[1] || p.projectName}</div>
        <Summary p={p} className="text-[11px] text-zinc-300 mt-1.5 line-clamp-2" />
        <div className="text-[10px] text-orange-400 font-mono mt-1.5">★ {formatStars(p.stars)} · 今日 +{formatStars(p.starsToday)}</div>
      </div>
      <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="font-bold">Rank #{p.currentIndex + 1} - {formatStars(p.stars)} stars</span>
          <span className="font-mono text-orange-500">{p.timeText}</span>
        </div>
        <div className="h-1 rounded-full bg-white/20 overflow-hidden"><div className="h-full w-2/3 bg-orange-500" /></div>
      </div>
    </div>
    <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
      <div className="flex gap-1.5 flex-wrap">
        {p.keywordList.slice(0, 4).map((tag, i) => (
          <span key={i} className={`px-2 py-0.5 rounded text-[8px] font-bold ${i === 0 ? "bg-orange-500/20 text-orange-400" : "bg-white/10"}`}>#{tag}</span>
        ))}
      </div>
      <span className="text-[9px] text-zinc-500 font-mono">@xintao</span>
    </div>
  </div>
);

const XPost: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#ffffff", color: "#0f1419" })}>
    <div className="px-4 pt-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-base font-black">𝕏</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[12px] font-black truncate">GitHub Trending <span className="text-[#1d9bf0]">✓</span></div>
        <div className="text-[10px] text-zinc-500">@githubtrending · 刚刚</div>
      </div>
    </div>
    <div className="px-4 py-2 text-[11px] text-zinc-500">回复 @xintao</div>
    <div className="px-4 flex-1 min-h-0 overflow-hidden">
      <p className="text-[13px] leading-relaxed">
        今日榜首 <span className="font-black">{p.projectName.split("/")[1] || p.projectName}</span> —— AI 一键生成爆款视频的开源神器 🧵
      </p>
      <Summary p={p} className="text-[11px] leading-relaxed text-zinc-600 mt-1.5 line-clamp-[11]" />
      <div className="mt-3 flex gap-2">
        <span className="px-2.5 py-1 rounded-full bg-[#e8f1fd] text-[#1d9bf0] text-[10px] font-bold">★ {formatStars(p.stars)}</span>
        <span className="px-2.5 py-1 rounded-full bg-[#e8f5e9] text-[#188a42] text-[10px] font-bold">▲ +{formatStars(p.starsToday)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p.keywordList.slice(0, 6).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-full bg-[#e8f1fd] text-[#1d9bf0] text-[9px] font-bold">#{tag}</span>
        ))}
      </div>
    </div>
    <div className="px-4 py-3 border-t border-zinc-100 flex justify-around text-[10px] text-zinc-500">
      <span>💬 {p.keywordList.length}</span><span>🔁 {formatStars(p.stars)}</span><span className="text-[#f91880]">❤️ +{formatStars(p.starsToday)}</span><span>📊 #{p.currentIndex + 1}</span>
    </div>
  </div>
);

const Telegram: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#e7ebf0", color: "#111111" })}>
    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#2aabee] text-white">
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#2aabee] font-black text-sm">✈</div>
      <div className="flex-1">
        <div className="text-[12px] font-bold leading-none">GitHub Trending</div>
        <div className="text-[8px] opacity-80 mt-0.5">在线</div>
      </div>
    </div>
    <div className="flex-1 px-3 py-3 flex flex-col gap-2 overflow-hidden">
      <div className="self-end max-w-[80%] rounded-xl rounded-tr-sm bg-[#effdde] px-3 py-2 shadow-sm">
        <div className="text-[11px]">今天什么项目最火？</div>
      </div>
      <div className="max-w-[88%] rounded-xl rounded-tl-sm bg-white px-3 py-2.5 shadow-sm">
        <div className="text-[10px] font-bold text-[#2aabee]">GitHub Trending</div>
        <div className="text-[11px] font-bold mt-1">{p.projectName.split("/")[1] || p.projectName} 🔥</div>
        <Summary p={p} className="text-[11px] leading-relaxed mt-1 line-clamp-[11]" />
        <div className="flex gap-1.5 mt-2">
          <span className="px-1.5 py-0.5 rounded bg-[#e8f3fd] text-[#2aabee] text-[8px] font-bold">★ {formatStars(p.stars)}</span>
          <span className="px-1.5 py-0.5 rounded bg-[#e8f5e9] text-[#188a42] text-[8px] font-bold">+{formatStars(p.starsToday)}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {p.keywordList.slice(0, 6).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-[#e8f3fd] text-[#2aabee] text-[8px]">#{tag}</span>
          ))}
        </div>
      </div>
      <div className="self-center text-[9px] text-zinc-400">{p.timeText}</div>
    </div>
    <div className="px-3 py-2.5 bg-white flex items-center gap-2">
      <div className="flex-1 rounded-full bg-[#e7ebf0] px-3 py-1.5 text-[10px] text-zinc-500">消息</div>
      <div className="w-7 h-7 rounded-full bg-[#2aabee] flex items-center justify-center text-white text-xs">➤</div>
    </div>
  </div>
);

const Instagram: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#ffffff", color: "#262626" })}>
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
        <img {...avatarFor(p.projectName, p.avatarUrl)} className="w-full h-full rounded-full object-cover" />
      </div>
      <div className="flex-1 text-[12px] font-bold truncate">{p.projectName.split("/")[0]}</div>
      <span className="text-lg text-zinc-500">⋯</span>
    </div>
    <div className="flex-1 flex items-center justify-center px-6 text-white" style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d)" }}>
      <div className="text-center">
        <div className="text-[26px] font-black leading-tight">{p.projectName.split("/")[1] || p.projectName}</div>
        <div className="text-[10px] opacity-85 mt-2">{formatStars(p.stars)}★ · +{formatStars(p.starsToday)} today</div>
      </div>
    </div>
    <div className="px-3 py-2.5">
      <div className="flex gap-3 text-xl"><span className="text-[#fd1d1d]">♥</span><span>💬</span><span>📤</span><span className="ml-auto">🔖</span></div>
      <div className="text-[11px] font-bold mt-1.5">{(parseInt(String(p.starsToday).replace(/,/g, ""), 10) || 0).toLocaleString()} 次赞</div>
      <div className="text-[10px] mt-0.5"><Summary p={p} className="inline text-[10px] leading-relaxed" /></div>
      <div className="text-[10px] text-[#00376b] mt-0.5">
        {p.keywordList.slice(0, 5).map((t) => `#${t}`).join(" ")}
      </div>
      <div className="text-[9px] text-zinc-400 mt-1">{p.timeText}</div>
    </div>
  </div>
);

const Onlyfans: Variant = (p) => (
  <div {...base(p, "", { backgroundColor: "#0d1017", color: "#ffffff" })}>
    <div className="px-4 pt-4 flex items-center justify-between">
      <span className="font-black italic text-[16px] text-[#0095f2]">OnlyFans</span>
      <span className="text-[10px] text-zinc-500">订阅内容</span>
    </div>
    <div className="relative flex-1 mx-4 mt-3 rounded-xl overflow-hidden border border-white/10">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0b3a5e, #0d1017)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <img className="w-12 h-12 rounded-full object-cover mb-3" {...avatarFor(p.projectName, p.avatarUrl)} />
        <div className="text-[18px] font-black">{p.projectName.split("/")[1] || p.projectName}</div>
        <div className="text-[10px] text-zinc-400 mt-1">AI 一键生成爆款视频 · +{formatStars(p.starsToday)}★</div>
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 text-[9px] font-black text-[#0095f2] border border-[#0095f2]/50">🔒 免费解锁</div>
    </div>
    <div className="px-4 py-3.5">
      <div className="flex items-center justify-between rounded-xl border border-[#0095f2]/40 bg-[#0095f2]/10 px-3.5 py-2.5 gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-black">今日榜首分析</div>
          <div className="text-[9px] text-zinc-400 mt-0.5 truncate">★ {formatStars(p.stars)} · +{formatStars(p.starsToday)} · {p.keywordList.slice(0, 3).map((t) => `#${t}`).join(" ")}</div>
        </div>
        <span className="px-3 py-1.5 rounded-lg bg-[#0095f2] text-[10px] font-black shrink-0">UNLOCK</span>
      </div>
    </div>
  </div>
);

export const DetailVariants: Record<CardStyle, Variant> = {
  classic: Classic,
  poster: Poster,
  terminal: Terminal,
  magazine: Magazine,
  databar: Databar,
  cardstack: Cardstack,
  glass: Glass,
  chat: Chat,
  neon: Neon,
  newspaper: Newspaper,
  minimal: Minimal,
  notebook: Notebook,
  timeline: Timeline,
  browser: Browser,
  github: GithubUI,
  cinema: Cinema,
  hud: Hud,
  pixel: Pixel,
  ticket: Ticket,
  sign: Sign,
  toc: Toc,
  notify: Notify,
  receipt: Receipt,
  aurora: Aurora,
  cyber: Cyber,
  glitch: Glitch,
  bauhaus: Bauhaus,
  greeting: Greeting,
  infographic: Infographic,
  pornhub: Pornhub,
  x: XPost,
  telegram: Telegram,
  instagram: Instagram,
  onlyfans: Onlyfans,
};
