import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { playClick } from '@/lib/audio';

type Metric = {
  label: string;
  value: string;
  delta: string;
  icon: typeof TrendingUp;
};

type TrendPoint = {
  month: string;
  revenue: number;
  efficiency: number;
};

type RegionPoint = {
  region: string;
  adoption: number;
};

type ChannelPoint = {
  name: string;
  value: number;
};

type Initiative = {
  name: string;
  owner: string;
  status: string;
  impact: string;
};

const metrics: Metric[] = [
  { label: 'Revenue Growth', value: '+32%', delta: '+8.4% QoQ', icon: TrendingUp },
  { label: 'Automation Coverage', value: '78%', delta: '+12% YoY', icon: ShieldCheck },
  { label: 'Active Teams', value: '14', delta: '+3 this quarter', icon: Users },
  { label: 'Forecast Accuracy', value: '96.1%', delta: '+1.8 pts', icon: Target },
];

const trendData: TrendPoint[] = [
  { month: 'Jan', revenue: 68, efficiency: 72 },
  { month: 'Feb', revenue: 74, efficiency: 75 },
  { month: 'Mar', revenue: 78, efficiency: 77 },
  { month: 'Apr', revenue: 85, efficiency: 82 },
  { month: 'May', revenue: 91, efficiency: 86 },
  { month: 'Jun', revenue: 97, efficiency: 90 },
];

const regionData: RegionPoint[] = [
  { region: 'APAC', adoption: 89 },
  { region: 'EMEA', adoption: 81 },
  { region: 'Americas', adoption: 94 },
  { region: 'LATAM', adoption: 68 },
];

const channelData: ChannelPoint[] = [
  { name: 'Executive', value: 36 },
  { name: 'Operations', value: 28 },
  { name: 'Finance', value: 20 },
  { name: 'Growth', value: 16 },
];

const initiatives: Initiative[] = [
  { name: 'Demand Forecasting', owner: 'Revenue Ops', status: 'Live', impact: '+14% precision' },
  { name: 'Supply Chain Alerts', owner: 'Operations', status: 'Scaling', impact: '-21% delays' },
  { name: 'Customer 360', owner: 'Experience', status: 'Live', impact: '+18 NPS' },
  { name: 'Risk Radar', owner: 'Compliance', status: 'Pilot', impact: '-34% review time' },
];

const COLORS = ['#3ddcff', '#7c5cff', '#26e7a6', '#f7c948'];

export function SenseAnalyticsPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    playClick();
    navigate('/my-project');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(61,220,255,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(124,92,255,0.16),_transparent_24%),linear-gradient(180deg,_#06111f_0%,_#0a1324_45%,_#050b14_100%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-0 pointer-events-none scanlines" />
      <div className="absolute inset-0 pointer-events-none vignette" />

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={handleBack}
        className="fixed top-4 left-4 z-50 rounded-full border border-white/15 bg-white/8 p-3 backdrop-blur-md transition-colors hover:border-cyan-400/60 hover:bg-white/12"
        aria-label="Back to My Projects"
      >
        <ArrowLeft className="h-5 w-5 text-cyan-300" />
      </motion.button>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-white/6 p-1 shadow-[0_0_50px_rgba(61,220,255,0.08)] backdrop-blur-xl"
        >
          <div className="rounded-[22px] border border-white/8 bg-slate-950/60 px-5 py-6 sm:px-7 sm:py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium tracking-[0.25em] text-cyan-200 uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Enterprise Intelligence Platform
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Sense Analytics
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  A polished executive dashboard for portfolio visibility, operational performance,
                  and AI-assisted decision making across teams, regions, and business units.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[520px]">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                        <Icon className="h-5 w-5 text-cyan-300" />
                      </div>
                      <div className="text-2xl font-semibold text-white">{metric.value}</div>
                      <div className="mt-1 text-xs text-slate-400">{metric.label}</div>
                      <div className="mt-2 text-xs font-medium text-emerald-300">{metric.delta}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-3">
          <DashboardPanel
            title="Performance Trend"
            icon={<TrendingUp className="h-4 w-4 text-cyan-300" />}
            subtitle="Revenue and efficiency tracking over the last six months"
            className="lg:col-span-2"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3ddcff" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#3ddcff" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="efficiencyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c5cff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7c5cff" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(61,220,255,0.28)',
                      borderRadius: 12,
                      color: '#e2e8f0',
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3ddcff" strokeWidth={3} fill="url(#revenueFill)" />
                  <Area type="monotone" dataKey="efficiency" stroke="#7c5cff" strokeWidth={3} fill="url(#efficiencyFill)" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Regional Adoption"
            icon={<Globe className="h-4 w-4 text-violet-300" />}
            subtitle="Platform engagement by territory"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="region" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(124,92,255,0.28)',
                      borderRadius: 12,
                      color: '#e2e8f0',
                    }}
                  />
                  <Bar dataKey="adoption" radius={[10, 10, 0, 0]}>
                    {regionData.map((entry, index) => (
                      <Cell key={entry.region} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Channel Mix"
            icon={<Building2 className="h-4 w-4 text-emerald-300" />}
            subtitle="Decision-maker coverage across business layers"
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={94}
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(61,220,255,0.28)',
                      borderRadius: 12,
                      color: '#e2e8f0',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </DashboardPanel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DashboardPanel
            title="Strategic Initiatives"
            icon={<BrainCircuit className="h-4 w-4 text-cyan-300" />}
            subtitle="Current roadmap items and measurable business impact"
          >
            <div className="overflow-hidden rounded-2xl border border-white/8">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {initiatives.map((initiative, index) => (
                    <tr
                      key={initiative.name}
                      className={index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'}
                    >
                      <td className="px-4 py-4 font-medium text-white">{initiative.name}</td>
                      <td className="px-4 py-4 text-slate-300">{initiative.owner}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-200">
                          {initiative.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-emerald-300">{initiative.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Executive Summary"
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-300" />}
            subtitle="Signals the leadership team can act on immediately"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <SummaryCard
                title="Operational Readiness"
                value="92%"
                note="Strong automation adoption across core workflows"
              />
              <SummaryCard
                title="Revenue Pipeline"
                value="$4.8M"
                note="Projected influenced pipeline for the next quarter"
              />
              <SummaryCard
                title="Risk Exposure"
                value="Low"
                note="Control thresholds remain within acceptable limits"
              />
              <SummaryCard
                title="Decision Latency"
                value="2.1h"
                note="Average time from insight to action has improved"
              />
            </div>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
}

function DashboardPanel({
  title,
  icon,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`rounded-3xl border border-white/10 bg-white/6 p-1 shadow-[0_0_40px_rgba(61,220,255,0.06)] backdrop-blur-xl ${className}`}
    >
      <div className="h-full rounded-[22px] border border-white/8 bg-slate-950/55 p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {icon}
              <h2 className="text-sm font-semibold tracking-[0.18em] text-cyan-200 uppercase">
                {title}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    </motion.section>
  );
}

function SummaryCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{title}</div>
      <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">{note}</p>
    </div>
  );
}
