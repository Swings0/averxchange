// Single source of truth for all plan data
// Used in: trading-plans page, plans API, admin dashboard, my-plans page

export type Plan = {
  id: string;
  name: string;
  price: number;
  totalProfit: number;
  dailyProfit: number;
  profitPct: number;
  duration: number;
  color: string;
  border: string;
  badge: string;
  glow: string;
};

export const PLANS: Plan[] = [
  {
    id: "bronze",
    name: "Bronze Plan",
    price: 500,
    totalProfit: 1500,
    dailyProfit: 71.43,   // 1500 / 21
    profitPct: 14.29,
    duration: 21,
    color: "from-amber-600 to-yellow-500",
    border: "border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-300",
    glow: "shadow-amber-500/20",
  },
  {
    id: "silver",
    name: "Silver Plan",
    price: 1000,
    totalProfit: 3200,
    dailyProfit: 152.38,  // 3200 / 21
    profitPct: 15.24,
    duration: 21,
    color: "from-slate-400 to-gray-300",
    border: "border-slate-400/30",
    badge: "bg-slate-400/20 text-slate-300",
    glow: "shadow-slate-400/20",
  },
  {
    id: "gold",
    name: "Gold Plan",
    price: 2000,
    totalProfit: 6800,
    dailyProfit: 323.81,  // 6800 / 21
    profitPct: 16.19,
    duration: 21,
    color: "from-yellow-400 to-amber-400",
    border: "border-yellow-400/30",
    badge: "bg-yellow-400/20 text-yellow-300",
    glow: "shadow-yellow-400/20",
  },
  {
    id: "platinum",
    name: "Platinum Plan",
    price: 5000,
    totalProfit: 18000,
    dailyProfit: 857.14,  // 18000 / 21
    profitPct: 17.14,
    duration: 21,
    color: "from-cyan-400 to-teal-400",
    border: "border-cyan-400/30",
    badge: "bg-cyan-400/20 text-cyan-300",
    glow: "shadow-cyan-400/20",
  },
  {
    id: "diamond",
    name: "Diamond Plan",
    price: 10000,
    totalProfit: 38010,
    dailyProfit: 1810,    // 38010 / 21
    profitPct: 18.10,
    duration: 21,
    color: "from-blue-400 to-indigo-500",
    border: "border-blue-400/30",
    badge: "bg-blue-400/20 text-blue-300",
    glow: "shadow-blue-400/20",
  },
  {
    id: "elite",
    name: "Elite Plan",
    price: 20000,
    totalProfit: 80010,
    dailyProfit: 3810,    // 80010 / 21
    profitPct: 19.05,
    duration: 21,
    color: "from-violet-500 to-purple-600",
    border: "border-violet-500/30",
    badge: "bg-violet-500/20 text-violet-300",
    glow: "shadow-violet-500/20",
  },
  {
    id: "legacy",
    name: "Legacy Plan",
    price: 40000,
    totalProfit: 168000,
    dailyProfit: 8000,    // 168000 / 21
    profitPct: 20.00,
    duration: 21,
    color: "from-rose-500 to-pink-600",
    border: "border-rose-500/30",
    badge: "bg-rose-500/20 text-rose-300",
    glow: "shadow-rose-500/20",
  },
  {
    id: "exclusive",
    name: "Exclusive Plan",
    price: 60000,
    totalProfit: 270900,
    dailyProfit: 12900,   // 270900 / 21
    profitPct: 21.50,
    duration: 21,
    color: "from-fuchsia-500 to-pink-500",
    border: "border-fuchsia-500/30",
    badge: "bg-fuchsia-500/20 text-fuchsia-300",
    glow: "shadow-fuchsia-500/20",
  },
  {
    id: "prestige",
    name: "Prestige Plan",
    price: 100000,
    totalProfit: 483000,
    dailyProfit: 23000,   // 483000 / 21
    profitPct: 23.00,
    duration: 21,
    color: "from-orange-400 to-red-500",
    border: "border-orange-400/30",
    badge: "bg-orange-400/20 text-orange-300",
    glow: "shadow-orange-400/20",
  },
];

// // Single source of truth for all plan data
// // Used in: trading-plans page, plans API, admin dashboard, my-plans page

// export const PLANS = [
//   {
//     id: "bronze",
//     name: "Bronze Plan",
//     price: 500,
//     totalProfit: 1500,
//     dailyProfit: 71.43,   // 1500 / 21
//     profitPct: 14.29,
//     duration: 21,
//     color: "from-amber-600 to-yellow-500",
//     border: "border-amber-500/30",
//     badge: "bg-amber-500/20 text-amber-300",
//     glow: "shadow-amber-500/20",
//   },
//   {
//     id: "silver",
//     name: "Silver Plan",
//     price: 1000,
//     totalProfit: 3200,
//     dailyProfit: 152.38,  // 3200 / 21
//     profitPct: 15.24,
//     duration: 21,
//     color: "from-slate-400 to-gray-300",
//     border: "border-slate-400/30",
//     badge: "bg-slate-400/20 text-slate-300",
//     glow: "shadow-slate-400/20",
//   },
//   {
//     id: "gold",
//     name: "Gold Plan",
//     price: 2000,
//     totalProfit: 6800,
//     dailyProfit: 323.81,  // 6800 / 21
//     profitPct: 16.19,
//     duration: 21,
//     color: "from-yellow-400 to-amber-400",
//     border: "border-yellow-400/30",
//     badge: "bg-yellow-400/20 text-yellow-300",
//     glow: "shadow-yellow-400/20",
//   },
//   {
//     id: "platinum",
//     name: "Platinum Plan",
//     price: 5000,
//     totalProfit: 18000,
//     dailyProfit: 857.14,  // 18000 / 21
//     profitPct: 17.14,
//     duration: 21,
//     color: "from-cyan-400 to-teal-400",
//     border: "border-cyan-400/30",
//     badge: "bg-cyan-400/20 text-cyan-300",
//     glow: "shadow-cyan-400/20",
//   },
//   {
//     id: "diamond",
//     name: "Diamond Plan",
//     price: 10000,
//     totalProfit: 38010,
//     dailyProfit: 1810,    // 38010 / 21
//     profitPct: 18.10,
//     duration: 21,
//     color: "from-blue-400 to-indigo-500",
//     border: "border-blue-400/30",
//     badge: "bg-blue-400/20 text-blue-300",
//     glow: "shadow-blue-400/20",
//   },
//   {
//     id: "elite",
//     name: "Elite Plan",
//     price: 20000,
//     totalProfit: 80010,
//     dailyProfit: 3810,    // 80010 / 21
//     profitPct: 19.05,
//     duration: 21,
//     color: "from-violet-500 to-purple-600",
//     border: "border-violet-500/30",
//     badge: "bg-violet-500/20 text-violet-300",
//     glow: "shadow-violet-500/20",
//   },
//   {
//     id: "legacy",
//     name: "Legacy Plan",
//     price: 40000,
//     totalProfit: 168000,
//     dailyProfit: 8000,    // 168000 / 21
//     profitPct: 20.00,
//     duration: 21,
//     color: "from-rose-500 to-pink-600",
//     border: "border-rose-500/30",
//     badge: "bg-rose-500/20 text-rose-300",
//     glow: "shadow-rose-500/20",
//   },
//   {
//     id: "exclusive",
//     name: "Exclusive Plan",
//     price: 60000,
//     totalProfit: 270900,
//     dailyProfit: 12900,   // 270900 / 21
//     profitPct: 21.50,
//     duration: 21,
//     color: "from-fuchsia-500 to-pink-500",
//     border: "border-fuchsia-500/30",
//     badge: "bg-fuchsia-500/20 text-fuchsia-300",
//     glow: "shadow-fuchsia-500/20",
//   },
//   {
//     id: "prestige",
//     name: "Prestige Plan",
//     price: 100000,
//     totalProfit: 483000,
//     dailyProfit: 23000,   // 483000 / 21
//     profitPct: 23.00,
//     duration: 21,
//     color: "from-orange-400 to-red-500",
//     border: "border-orange-400/30",
//     badge: "bg-orange-400/20 text-orange-300",
//     glow: "shadow-orange-400/20",
//   },
// ] as const;

// export type Plan = typeof PLANS[number];