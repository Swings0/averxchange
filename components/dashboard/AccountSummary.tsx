import {
  Wallet,
  TrendingUp,
  Gift,
  BarChart2,
  Users,
  Download,
  Upload,
} from "lucide-react";

interface AccountSummaryProps {
  balance: number;
  totalProfit: number;
  bonus: number;
  tradingAccounts: number;
  referralBonus: number;
  totalDeposit: number;
  totalWithdrawal: number;
}

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

const CARDS = (p: AccountSummaryProps) => [
  {
    label: "Account Balance",
    value: fmt(p.balance),
    icon: Wallet,
    gradient: "from-cyan-500/15 to-blue-600/15",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    label: "Total Profit",
    value: fmt(p.totalProfit),
    icon: TrendingUp,
    gradient: "from-emerald-500/15 to-green-600/15",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    label: "Bonus",
    value: fmt(p.bonus),
    icon: Gift,
    gradient: "from-violet-500/15 to-purple-600/15",
    border: "border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    label: "Trading Accounts",
    value: String(p.tradingAccounts),
    icon: BarChart2,
    gradient: "from-sky-500/15 to-indigo-600/15",
    border: "border-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    label: "Referral Bonus",
    value: fmt(p.referralBonus),
    icon: Users,
    gradient: "from-amber-500/15 to-orange-600/15",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    label: "Total Deposit",
    value: fmt(p.totalDeposit),
    icon: Download,
    gradient: "from-teal-500/15 to-cyan-600/15",
    border: "border-teal-500/20",
    iconColor: "text-teal-400",
  },
  {
    label: "Total Withdrawal",
    value: fmt(p.totalWithdrawal),
    icon: Upload,
    gradient: "from-rose-500/15 to-red-600/15",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
  },
];

export default function AccountSummary(props: AccountSummaryProps) {
  const cards = CARDS(props);

  return (
    <section>
      <h2 className="text-base font-semibold text-white/70 uppercase tracking-widest mb-4">
        Account Summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`
                relative rounded-2xl border ${card.border}
                bg-gradient-to-br ${card.gradient}
                backdrop-blur-sm p-5
                flex items-center justify-between
                hover:scale-[1.02] transition-transform duration-200
              `}
            >
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-white">{card.value}</p>
              </div>
              <div
                className={`
                  w-11 h-11 rounded-xl flex items-center justify-center
                  bg-white/5 border border-white/10 flex-shrink-0
                  ${card.iconColor}
                `}
              >
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}