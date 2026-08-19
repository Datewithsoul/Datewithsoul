"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: {
    label: "รายได้ (บาท)",
    color: "#3d3229",
  },
  bookings: {
    label: "จำนวนการจอง",
    color: "#8a6d1f",
  },
} satisfies ChartConfig

export function DashboardChart({
  data
}: {
  data: { month: string; revenue: number; bookings: number }[]
}) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#ddd4c8" />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fill: "#6a5d50", fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={2} />
        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={2} />
      </BarChart>
    </ChartContainer>
  )
}
