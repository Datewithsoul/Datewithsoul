"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: {
    label: "รายได้ (฿)",
    color: "hsl(var(--chart-1))",
  },
  bookings: {
    label: "จำนวนจอง",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function DashboardChart({
  data
}: {
  data: { month: string; revenue: number; bookings: number }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>สรุปรายได้และการจองรายเดือน</CardTitle>
        <CardDescription>แสดงข้อมูลย้อนหลัง 6 เดือน</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
            <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
