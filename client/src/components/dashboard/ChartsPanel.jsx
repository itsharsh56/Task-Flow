import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { EmptyState } from '../common/EmptyState'

const statusColors = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#22d3ee',
  DONE: '#34d399',
}

const priorityColors = {
  LOW: '#38bdf8',
  MEDIUM: '#f59e0b',
  HIGH: '#fb7185',
}

const tooltipStyle = {
  background: 'rgba(2, 6, 23, 0.96)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  color: '#e2e8f0',
}

function prettyLabel(value) {
  return String(value).replaceAll('_', ' ')
}

function ChartShell({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-5 h-80">{children}</div>
    </div>
  )
}

export function ChartsPanel({ statusAnalytics = [], priorityAnalytics = [] }) {
  const statusData = statusAnalytics.map((item) => ({
    ...item,
    label: prettyLabel(item.status),
  }))

  const priorityData = priorityAnalytics.map((item) => ({
    ...item,
    label: prettyLabel(item.priority),
  }))

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartShell title="Task Status Distribution">
        {statusData.length === 0 ? (
          <EmptyState
            title="No status data"
            description="Create a few tasks first and this chart will light up."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="label"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {statusData.map((item) => (
                  <Cell
                    key={item.status}
                    fill={statusColors[item.status] ?? '#22d3ee'}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartShell>

      <ChartShell title="Priority Breakdown">
        {priorityData.length === 0 ? (
          <EmptyState
            title="No priority data"
            description="Once tasks are created with priorities, this chart will populate."
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" />
              <Bar dataKey="count" name="Tasks" radius={[10, 10, 0, 0]}>
                {priorityData.map((item) => (
                  <Cell
                    key={item.priority}
                    fill={priorityColors[item.priority] ?? '#38bdf8'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartShell>
    </div>
  )
}
