"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  BarChart2,
  LineChart as LineChartIcon,
  ChevronDown,
  Clock,
  CalendarDays,
  Sparkles,
} from "lucide-react";

export type RawBooking = {
  id: string;
  createdAt: string;
  totalPrice: number;
  seats: number;
  status: string;
  classEventId: string;
  classEventName: string;
  classStartTime: string;
  classEndTime: string;
  classDate: string;
};

export type RawClass = {
  id: string;
  name: string;
  price: number;
  totalSeats: number;
  startTime: string;
  endTime: string;
  date: string;
};

interface AdminAnalyticsDashboardProps {
  bookings: RawBooking[];
  classes: RawClass[];
}

type PeriodType = "7d" | "30d" | "3m" | "6m" | "1y" | "all";
type GranularityType = "day" | "week" | "month";
type MetricType = "revenue" | "bookings" | "seats";

const PALETTE = [
  "#e51d53", // Brand Red
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#6366f1", // Indigo
  "#84cc16", // Lime
];

const DAY_NAMES = [
  "อาทิตย์ (Sun)",
  "จันทร์ (Mon)",
  "อังคาร (Tue)",
  "พุธ (Wed)",
  "พฤหัสบดี (Thu)",
  "ศุกร์ (Fri)",
  "เสาร์ (Sat)",
];

const DAY_NAMES_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export function AdminAnalyticsDashboard({
  bookings,
  classes,
}: AdminAnalyticsDashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("6m");
  const [selectedCourseName, setSelectedCourseName] = useState<string>("all");
  const [metric, setMetric] = useState<MetricType>("revenue");
  const [rankingSort, setRankingSort] = useState<"revenue" | "bookings" | "seats">("revenue");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Group all unique course names from classes & bookings
  const uniqueCourseNames = useMemo(() => {
    const set = new Set<string>();
    classes.forEach((c) => {
      if (c.name) set.add(c.name.trim());
    });
    bookings.forEach((b) => {
      if (b.classEventName) set.add(b.classEventName.trim());
    });
    return Array.from(set).sort();
  }, [classes, bookings]);

  // 2. Determine date boundary based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    const start = new Date(now);

    switch (period) {
      case "7d":
        start.setDate(now.getDate() - 7);
        break;
      case "30d":
        start.setDate(now.getDate() - 30);
        break;
      case "3m":
        start.setMonth(now.getMonth() - 3);
        break;
      case "6m":
        start.setMonth(now.getMonth() - 6);
        break;
      case "1y":
        start.setFullYear(now.getFullYear() - 1);
        break;
      case "all":
      default:
        start.setFullYear(2020, 0, 1);
        break;
    }
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }, [period]);

  // Determine auto-granularity
  const granularity: GranularityType = useMemo(() => {
    if (period === "7d" || period === "30d") return "day";
    if (period === "3m" || period === "6m") return "week";
    return "month";
  }, [period]);

  // 3. Filter confirmed bookings by date range and selected course name
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.status !== "CONFIRMED" && b.status !== "COMPLETED") return false;
      const bDate = new Date(b.createdAt);
      if (bDate < dateRange.start || bDate > dateRange.end) return false;
      if (selectedCourseName !== "all" && b.classEventName?.trim() !== selectedCourseName) {
        return false;
      }
      return true;
    });
  }, [bookings, dateRange, selectedCourseName]);

  // 4. Overall metrics in selected period
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalBookings = filteredBookings.length;
    let totalSeats = 0;

    filteredBookings.forEach((b) => {
      totalRevenue += b.totalPrice;
      totalSeats += b.seats;
    });

    const aov = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

    return { totalRevenue, totalBookings, totalSeats, aov };
  }, [filteredBookings]);

  // 5. Aggregate by Course Name (รวมคอร์สที่ชื่อเดียวกันเข้าด้วยกัน)
  const courseStatsList = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        sessionCount: number;
        revenue: number;
        bookings: number;
        seats: number;
        avgPrice: number;
      }
    >();

    // Initialize with all unique course names
    uniqueCourseNames.forEach((name) => {
      const courseClasses = classes.filter((c) => c.name?.trim() === name);
      const avgPrice =
        courseClasses.length > 0
          ? Math.round(
              courseClasses.reduce((sum, c) => sum + c.price, 0) / courseClasses.length
            )
          : 0;

      map.set(name, {
        name,
        sessionCount: courseClasses.length,
        revenue: 0,
        bookings: 0,
        seats: 0,
        avgPrice,
      });
    });

    // Populate with filtered bookings
    filteredBookings.forEach((b) => {
      const name = b.classEventName?.trim() || "คอร์สเรียนทั่วไป";
      let item = map.get(name);
      if (!item) {
        item = {
          name,
          sessionCount: 1,
          revenue: 0,
          bookings: 0,
          seats: 0,
          avgPrice: b.totalPrice / (b.seats || 1),
        };
        map.set(name, item);
      }
      item.revenue += b.totalPrice;
      item.bookings += 1;
      item.seats += b.seats;
    });

    return Array.from(map.values()).sort((a, b) => b[rankingSort] - a[rankingSort]);
  }, [uniqueCourseNames, classes, filteredBookings, rankingSort]);

  const topSellingCourse = useMemo(() => {
    return courseStatsList.length > 0 && courseStatsList[0].revenue > 0
      ? courseStatsList[0]
      : null;
  }, [courseStatsList]);

  // 6. Time-Series Data for Area Chart and Multi-line Chart
  const timeSeriesData = useMemo(() => {
    const buckets: {
      key: string;
      label: string;
      date: Date;
      totalRevenue: number;
      totalBookings: number;
      totalSeats: number;
      [courseKey: string]: any;
    }[] = [];

    const monthNames = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];

    const cur = new Date(dateRange.start);

    // Build empty time series buckets
    if (granularity === "day") {
      while (cur <= dateRange.end) {
        const dStr = `${cur.getDate()} ${monthNames[cur.getMonth()]}`;
        const key = cur.toISOString().slice(0, 10);
        buckets.push({
          key,
          label: dStr,
          date: new Date(cur),
          totalRevenue: 0,
          totalBookings: 0,
          totalSeats: 0,
        });
        cur.setDate(cur.getDate() + 1);
      }
    } else if (granularity === "week") {
      while (cur <= dateRange.end) {
        const weekEnd = new Date(cur);
        weekEnd.setDate(cur.getDate() + 6);
        const label = `${cur.getDate()} ${monthNames[cur.getMonth()]} - ${weekEnd.getDate()} ${monthNames[weekEnd.getMonth()]}`;
        const key = cur.toISOString().slice(0, 10);
        buckets.push({
          key,
          label,
          date: new Date(cur),
          totalRevenue: 0,
          totalBookings: 0,
          totalSeats: 0,
        });
        cur.setDate(cur.getDate() + 7);
      }
    } else {
      // Monthly
      while (cur <= dateRange.end) {
        const label = `${monthNames[cur.getMonth()]} ${(cur.getFullYear() + 543) % 100}`;
        const key = `${cur.getFullYear()}-${cur.getMonth()}`;
        buckets.push({
          key,
          label,
          date: new Date(cur),
          totalRevenue: 0,
          totalBookings: 0,
          totalSeats: 0,
        });
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    // Top 6 courses for multi-line comparison
    const topCourses = courseStatsList.slice(0, 6);

    buckets.forEach((b) => {
      topCourses.forEach((c, idx) => {
        b[`course_${idx}`] = 0;
      });
      b["others"] = 0;
    });

    filteredBookings.forEach((b) => {
      const bDate = new Date(b.createdAt);
      const bCourseName = b.classEventName?.trim();
      let matchedBucket = null;

      if (granularity === "day") {
        const bKey = bDate.toISOString().slice(0, 10);
        matchedBucket = buckets.find((bucket) => bucket.key === bKey);
      } else if (granularity === "week") {
        matchedBucket = buckets.find((bucket, idx) => {
          const next = buckets[idx + 1];
          return bDate >= bucket.date && (!next || bDate < next.date);
        });
      } else {
        const bKey = `${bDate.getFullYear()}-${bDate.getMonth()}`;
        matchedBucket = buckets.find((bucket) => bucket.key === bKey);
      }

      if (matchedBucket) {
        matchedBucket.totalRevenue += b.totalPrice;
        matchedBucket.totalBookings += 1;
        matchedBucket.totalSeats += b.seats;

        const val =
          metric === "revenue" ? b.totalPrice : metric === "bookings" ? 1 : b.seats;
        const topIndex = topCourses.findIndex((c) => c.name === bCourseName);
        if (topIndex >= 0) {
          matchedBucket[`course_${topIndex}`] =
            (matchedBucket[`course_${topIndex}`] || 0) + val;
        } else {
          matchedBucket["others"] = (matchedBucket["others"] || 0) + val;
        }
      }
    });

    return {
      buckets,
      topCourses,
    };
  }, [dateRange, granularity, filteredBookings, courseStatsList, metric]);

  // 7. Day of Week Analysis (คนจองวันไหนมากที่สุด)
  const dayOfWeekStats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const revenues = [0, 0, 0, 0, 0, 0, 0];
    const seats = [0, 0, 0, 0, 0, 0, 0];

    filteredBookings.forEach((b) => {
      const cDate = b.classDate ? new Date(b.classDate) : new Date(b.createdAt);
      const day = cDate.getDay();
      counts[day] += 1;
      revenues[day] += b.totalPrice;
      seats[day] += b.seats;
    });

    const data = DAY_NAMES.map((fullName, index) => {
      return {
        dayIndex: index,
        dayName: DAY_NAMES_SHORT[index],
        fullName,
        bookings: counts[index],
        revenue: revenues[index],
        seats: seats[index],
      };
    });

    let peakDay = data[0];
    data.forEach((d) => {
      const currentVal =
        metric === "revenue" ? d.revenue : metric === "bookings" ? d.bookings : d.seats;
      const peakVal =
        metric === "revenue"
          ? peakDay.revenue
          : metric === "bookings"
          ? peakDay.bookings
          : peakDay.seats;
      if (currentVal > peakVal) {
        peakDay = d;
      }
    });

    return { data, peakDay };
  }, [filteredBookings, metric]);

  // 8. Time Slot Analysis (ช่วงเวลาไหนมีคนจองมากที่สุด)
  const timeSlotStats = useMemo(() => {
    const map = new Map<string, { timeSlot: string; bookings: number; revenue: number; seats: number }>();

    filteredBookings.forEach((b) => {
      const slot =
        b.classStartTime && b.classEndTime
          ? `${b.classStartTime} - ${b.classEndTime}`
          : b.classStartTime
          ? `${b.classStartTime} น.`
          : "ไม่ระบุเวลา";

      let item = map.get(slot);
      if (!item) {
        item = { timeSlot: slot, bookings: 0, revenue: 0, seats: 0 };
        map.set(slot, item);
      }
      item.bookings += 1;
      item.revenue += b.totalPrice;
      item.seats += b.seats;
    });

    const data = Array.from(map.values()).sort((a, b) => {
      const valA = metric === "revenue" ? a.revenue : metric === "bookings" ? a.bookings : a.seats;
      const valB = metric === "revenue" ? b.revenue : metric === "bookings" ? b.bookings : b.seats;
      return valB - valA;
    });

    const peakSlot =
      data.length > 0 && (metric === "revenue" ? data[0].revenue > 0 : data[0].bookings > 0)
        ? data[0]
        : null;

    return { data, peakSlot };
  }, [filteredBookings, metric]);

  const metricLabel =
    metric === "revenue"
      ? "ยอดขาย (บาท)"
      : metric === "bookings"
      ? "จำนวนการจอง (ครั้ง)"
      : "จำนวนที่นั่ง (ที่)";

  // Shadcn Chart Configurations
  const areaChartConfig: ChartConfig = {
    totalRevenue: {
      label: "ยอดขายรวม (บาท)",
      color: "#e51d53",
    },
    totalBookings: {
      label: "จำนวนการจอง (ครั้ง)",
      color: "#e51d53",
    },
    totalSeats: {
      label: "จำนวนที่นั่ง (ที่)",
      color: "#e51d53",
    },
  };

  const multiLineChartConfig: ChartConfig = useMemo(() => {
    const cfg: ChartConfig = {};
    timeSeriesData.topCourses.forEach((c, idx) => {
      cfg[`course_${idx}`] = {
        label: c.name,
        color: PALETTE[idx % PALETTE.length],
      };
    });
    cfg["others"] = {
      label: "คอร์สอื่นๆ",
      color: "#9ca3af",
    };
    return cfg;
  }, [timeSeriesData.topCourses]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Filter Bar with Shadcn Card */}
      <Card className="border-[#ddd4c8] bg-white shadow-xs p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Period Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#f4f1ec] p-1 rounded-lg">
            <span className="text-xs font-semibold text-[#6a5d50] px-2 flex items-center gap-1">
              <Calendar size={14} /> ช่วงเวลา:
            </span>
            {(
              [
                { key: "7d", label: "7 วัน (สัปดาห์)" },
                { key: "30d", label: "30 วัน (เดือน)" },
                { key: "3m", label: "3 เดือน" },
                { key: "6m", label: "6 เดือน" },
                { key: "1y", label: "1 ปี" },
                { key: "all", label: "ทั้งหมด" },
              ] as const
            ).map((item) => (
              <Button
                key={item.key}
                variant={period === item.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod(item.key)}
                className={`text-xs font-bold ${
                  period === item.key
                    ? "bg-[#3d3229] text-white hover:bg-[#2b231d]"
                    : "text-[#6a5d50] hover:text-[#3d3229] hover:bg-white/80"
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* Right Controls: Course Group Filter & Metric Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:flex-none min-w-[220px]">
              <Select value={selectedCourseName} onValueChange={setSelectedCourseName}>
                <SelectTrigger className="w-full bg-[#faf8f5] border-[#ddd4c8] text-[#3d3229] font-semibold h-9 focus:ring-[#8f3b2c]">
                  <SelectValue placeholder="🌟 ทุกคอร์สเรียน (รวมทุกคอร์ส)">
                    {selectedCourseName === "all" ? "🌟 ทุกคอร์สเรียน (รวมทุกคอร์ส)" : `📚 ${selectedCourseName}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-semibold text-[#3d3229]">
                    🌟 ทุกคอร์สเรียน (รวมทุกคอร์ส)
                  </SelectItem>
                  {uniqueCourseNames.map((name) => (
                    <SelectItem key={name} value={name} className="font-medium text-[#3d3229]">
                      📚 {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metric Selector Buttons */}
            <div className="flex items-center bg-[#f4f1ec] p-1 rounded-lg gap-1">
              <Button
                variant={metric === "revenue" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMetric("revenue")}
                className={`text-xs font-bold ${
                  metric === "revenue"
                    ? "bg-[#8f3b2c] text-white hover:bg-[#783124]"
                    : "text-[#6a5d50] hover:text-[#3d3229]"
                }`}
              >
                ฿ ยอดขาย
              </Button>
              <Button
                variant={metric === "bookings" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMetric("bookings")}
                className={`text-xs font-bold ${
                  metric === "bookings"
                    ? "bg-[#8f3b2c] text-white hover:bg-[#783124]"
                    : "text-[#6a5d50] hover:text-[#3d3229]"
                }`}
              >
                🎟️ จำนวนจอง
              </Button>
              <Button
                variant={metric === "seats" ? "default" : "ghost"}
                size="sm"
                onClick={() => setMetric("seats")}
                className={`text-xs font-bold ${
                  metric === "seats"
                    ? "bg-[#8f3b2c] text-white hover:bg-[#783124]"
                    : "text-[#6a5d50] hover:text-[#3d3229]"
                }`}
              >
                🪑 ที่นั่ง
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards using Shadcn Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="border-[#ddd4c8] bg-white shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6a5d50]">
            <span className="text-xs font-bold uppercase tracking-wider">ยอดขายรวมในช่วงเวลา</span>
            <div className="p-2 rounded-lg bg-[#faf8f5] text-[#8f3b2c] border border-[#ddd4c8]">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-[#3d3229] tabular-nums">
              ฿{stats.totalRevenue.toLocaleString("th-TH")}
            </div>
            <p className="text-xs text-[#8a6d1f] font-medium mt-1">
              เฉลี่ย ฿{stats.aov.toLocaleString("th-TH")} / การจอง
            </p>
          </div>
        </Card>

        {/* Total Bookings */}
        <Card className="border-[#ddd4c8] bg-white shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6a5d50]">
            <span className="text-xs font-bold uppercase tracking-wider">รายการจองสำเร็จ</span>
            <div className="p-2 rounded-lg bg-[#faf8f5] text-[#3b82f6] border border-[#ddd4c8]">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-[#3d3229] tabular-nums">
              {stats.totalBookings.toLocaleString("th-TH")} <span className="text-sm font-semibold text-gray-500">ครั้ง</span>
            </div>
            <p className="text-xs text-green-700 font-medium mt-1">
              สถานะชำระเงินเรียบร้อย (Confirmed)
            </p>
          </div>
        </Card>

        {/* Total Seats Sold */}
        <Card className="border-[#ddd4c8] bg-white shadow-xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#6a5d50]">
            <span className="text-xs font-bold uppercase tracking-wider">ที่นั่งที่จำหน่ายได้</span>
            <div className="p-2 rounded-lg bg-[#faf8f5] text-[#10b981] border border-[#ddd4c8]">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-black text-[#3d3229] tabular-nums">
              {stats.totalSeats.toLocaleString("th-TH")} <span className="text-sm font-semibold text-gray-500">ที่นั่ง</span>
            </div>
            <p className="text-xs text-[#6a5d50] font-medium mt-1">
              {selectedCourseName === "all" ? "จากทุกคอร์สเรียนรวมกัน" : `เฉพาะคอร์ส ${selectedCourseName}`}
            </p>
          </div>
        </Card>

        {/* Top Selling Course */}
        <Card className="border-2 border-[#f59e0b] bg-gradient-to-br from-[#faf8f5] to-[#f5efe6] shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8a6d1f]">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Award size={16} className="text-[#f59e0b]" /> คอร์สยอดนิยมอันดับ #1
            </span>
            <Badge variant="default" className="bg-[#f59e0b] hover:bg-[#d97706] text-white text-[10px] font-bold">
              TOP COURSE
            </Badge>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-[#3d3229] truncate" title={topSellingCourse?.name || "-"}>
              {topSellingCourse ? topSellingCourse.name : "ยังไม่มีข้อมูล"}
            </div>
            {topSellingCourse ? (
              <p className="text-xs font-semibold text-[#8f3b2c] mt-1">
                ฿{topSellingCourse.revenue.toLocaleString("th-TH")} ({topSellingCourse.bookings} จอง / {topSellingCourse.seats} ที่)
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">-</p>
            )}
          </div>
        </Card>
      </div>

      {/* Main Charts Section using Shadcn Card */}
      <div className="grid grid-cols-1 gap-8">
        {/* 1. Primary Trend: Area Chart */}
        <Card className="border-[#ddd4c8] bg-white shadow-xs overflow-hidden">
          <CardHeader className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fdfcfb]">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#8f3b2c]/10 text-[#8f3b2c] rounded-md">
                  <BarChart2 size={16} />
                </span>
                <CardTitle className="text-base font-bold text-[#3d3229]">
                  แนวโน้ม{metricLabel} {selectedCourseName !== "all" ? `(คอร์ส: ${selectedCourseName})` : "(ภาพรวมทุกคอร์ส)"}
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#6a5d50] mt-0.5">
                แสดงผลแยกตาม{granularity === "day" ? "รายวัน" : granularity === "week" ? "รายสัปดาห์" : "รายเดือน"} ในช่วง {period.toUpperCase()}
              </CardDescription>
            </div>

            <Badge variant="outline" className="border-[#ddd4c8] bg-[#faf8f5] text-[#3d3229] font-bold text-xs gap-1.5 py-1 px-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e51d53]"></span>
              {metric === "revenue" ? "ยอดขายรวม (บาท)" : metric === "bookings" ? "ยอดการจอง (ครั้ง)" : "จำนวนที่นั่ง"}
            </Badge>
          </CardHeader>

          <CardContent className="p-5">
            {!isMounted ? (
              <div className="h-[320px] w-full flex items-center justify-center text-sm text-[#6a5d50]">
                กำลังโหลดกราฟ...
              </div>
            ) : (
              <ChartContainer config={areaChartConfig} className="w-full h-[320px]">
                <AreaChart
                  data={timeSeriesData.buckets}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e51d53" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e51d53" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee8e0" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "#ddd4c8" }}
                    tick={{ fill: "#6a5d50", fontSize: 11 }}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6a5d50", fontSize: 11 }}
                    tickFormatter={(v) =>
                      metric === "revenue"
                        ? v >= 1000
                          ? `฿${(v / 1000).toFixed(0)}k`
                          : `฿${v}`
                        : v
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="bg-[#3d3229] text-white p-3 rounded-lg shadow-xl text-xs border border-white/10">
                          <p className="font-bold text-[#f59e0b] mb-1.5">{label}</p>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-300">ยอดขายรวม:</span>
                              <span className="font-bold">฿{item.totalRevenue.toLocaleString("th-TH")}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-300">จำนวนการจอง:</span>
                              <span className="font-bold">{item.totalBookings} ครั้ง</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-300">จำนวนที่นั่ง:</span>
                              <span className="font-bold">{item.totalSeats} ที่</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={
                      metric === "revenue"
                        ? "totalRevenue"
                        : metric === "bookings"
                        ? "totalBookings"
                        : "totalSeats"
                    }
                    stroke="#e51d53"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#areaGradient)"
                    dot={{ fill: "#e51d53", r: 3 }}
                    activeDot={{ r: 6, fill: "#e51d53", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* 2. Multi-Class Comparison: Line Chart */}
        <Card className="border-[#ddd4c8] bg-white shadow-xs overflow-hidden">
          <CardHeader className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fdfcfb]">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#3b82f6]/10 text-[#3b82f6] rounded-md">
                  <LineChartIcon size={16} />
                </span>
                <CardTitle className="text-base font-bold text-[#3d3229]">
                  เปรียบเทียบระหว่างคอร์สเรียน ({metricLabel})
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-[#6a5d50] mt-0.5">
                เปรียบเทียบแนวโน้มของคอร์สเรียนแต่ละชื่อ เพื่อวิเคราะห์ว่าคอร์สไหนเติบโตสูงสุดในแต่ละสัปดาห์/เดือน
              </CardDescription>
            </div>

            <span className="text-xs font-semibold text-[#6a5d50]">
              แสดง 6 คอร์สยอดนิยม + คอร์สอื่นๆ
            </span>
          </CardHeader>

          <CardContent className="p-5">
            {!isMounted ? (
              <div className="h-[340px] w-full flex items-center justify-center text-sm text-[#6a5d50]">
                กำลังโหลดกราฟ...
              </div>
            ) : (
              <ChartContainer config={multiLineChartConfig} className="w-full h-[340px]">
                <LineChart
                  data={timeSeriesData.buckets}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee8e0" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: "#ddd4c8" }}
                    tick={{ fill: "#6a5d50", fontSize: 11 }}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6a5d50", fontSize: 11 }}
                    tickFormatter={(v) =>
                      metric === "revenue"
                        ? v >= 1000
                          ? `฿${(v / 1000).toFixed(0)}k`
                          : `฿${v}`
                        : v
                    }
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      return (
                        <div className="bg-[#3d3229] text-white p-3 rounded-lg shadow-xl text-xs border border-white/10 min-w-[220px]">
                          <p className="font-bold text-[#f59e0b] mb-2">{label}</p>
                          <div className="flex flex-col gap-1.5">
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                  ></span>
                                  <span className="truncate text-gray-200">{entry.name}</span>
                                </div>
                                <span className="font-bold shrink-0">
                                  {metric === "revenue"
                                    ? `฿${Number(entry.value).toLocaleString("th-TH")}`
                                    : Number(entry.value).toLocaleString("th-TH")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "14px", fontSize: "12px" }}
                    iconType="circle"
                  />
                  {timeSeriesData.topCourses.map((cls, idx) => (
                    <Line
                      key={cls.name}
                      type="monotone"
                      dataKey={`course_${idx}`}
                      name={cls.name}
                      stroke={PALETTE[idx % PALETTE.length]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                  {courseStatsList.length > 6 && (
                    <Line
                      type="monotone"
                      dataKey="others"
                      name="คอร์สอื่นๆ"
                      stroke="#9ca3af"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  )}
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Deep-Dive: Peak Days & Peak Time Slots Analysis with Shadcn Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Day of Week Chart */}
        <Card className="border-[#ddd4c8] bg-white shadow-xs overflow-hidden flex flex-col">
          <CardHeader className="border-b border-[#ddd4c8] px-5 py-4 flex flex-row items-center justify-between bg-[#fdfcfb]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#f59e0b]/10 text-[#f59e0b] rounded-md">
                <CalendarDays size={16} />
              </span>
              <div>
                <CardTitle className="text-base font-bold text-[#3d3229]">
                  วันไหนมีคนจองมากที่สุด (Day of Week)
                </CardTitle>
                <CardDescription className="text-xs text-[#6a5d50] mt-0.5">
                  วิเคราะห์ความหนาแน่นของผู้เรียนแยกตามวันในสัปดาห์ (จันทร์ - อาทิตย์)
                </CardDescription>
              </div>
            </div>
            {dayOfWeekStats.peakDay && (
              <Badge variant="outline" className="border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#8a6d1f] font-bold text-xs gap-1">
                <Award size={12} /> ยอดนิยม: {dayOfWeekStats.peakDay.dayName}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            {!isMounted ? (
              <div className="h-[240px] w-full flex items-center justify-center text-sm text-[#6a5d50]">
                กำลังโหลดกราฟ...
              </div>
            ) : (
              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={dayOfWeekStats.data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee8e0" />
                    <XAxis
                      dataKey="dayName"
                      tickLine={false}
                      axisLine={{ stroke: "#ddd4c8" }}
                      tick={{ fill: "#6a5d50", fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6a5d50", fontSize: 11 }}
                      tickFormatter={(v) =>
                        metric === "revenue"
                          ? v >= 1000
                            ? `฿${(v / 1000).toFixed(0)}k`
                            : `฿${v}`
                          : v
                      }
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#3d3229] text-white p-3 rounded-lg shadow-xl text-xs border border-white/10">
                            <p className="font-bold text-[#f59e0b] mb-1.5">{d.fullName}</p>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">ยอดขาย:</span>
                                <span className="font-bold">฿{d.revenue.toLocaleString("th-TH")}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">จำนวนการจอง:</span>
                                <span className="font-bold">{d.bookings} ครั้ง</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">ที่นั่ง:</span>
                                <span className="font-bold">{d.seats} ที่</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey={
                        metric === "revenue"
                          ? "revenue"
                          : metric === "bookings"
                          ? "bookings"
                          : "seats"
                      }
                      radius={[4, 4, 0, 0]}
                    >
                      {dayOfWeekStats.data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.dayIndex === dayOfWeekStats.peakDay?.dayIndex &&
                            (metric === "revenue" ? entry.revenue > 0 : entry.bookings > 0)
                              ? "#f59e0b"
                              : "#8f3b2c"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#eee8e0] flex items-center justify-between text-xs text-[#6a5d50]">
              <span>💡 คำแนะนำ: นำข้อมูลนี้ไปวางแผนเปิดรอบสอนในวันที่ลูกค้าสะดวกที่สุด</span>
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Chart */}
        <Card className="border-[#ddd4c8] bg-white shadow-xs overflow-hidden flex flex-col">
          <CardHeader className="border-b border-[#ddd4c8] px-5 py-4 flex flex-row items-center justify-between bg-[#fdfcfb]">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#10b981]/10 text-[#10b981] rounded-md">
                <Clock size={16} />
              </span>
              <div>
                <CardTitle className="text-base font-bold text-[#3d3229]">
                  ช่วงเวลาไหนมีคนจองมากที่สุด (Time Slots)
                </CardTitle>
                <CardDescription className="text-xs text-[#6a5d50] mt-0.5">
                  เปรียบเทียบรอบเวลาสอน (เช่น 10:00-12:00, 14:00-16:00)
                </CardDescription>
              </div>
            </div>
            {timeSlotStats.peakSlot && (
              <Badge variant="outline" className="border-[#10b981]/40 bg-[#10b981]/10 text-[#065f46] font-bold text-xs gap-1">
                <Clock size={12} /> ยอดนิยม: {timeSlotStats.peakSlot.timeSlot}
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-5 flex-1 flex flex-col justify-between">
            {!isMounted ? (
              <div className="h-[240px] w-full flex items-center justify-center text-sm text-[#6a5d50]">
                กำลังโหลดกราฟ...
              </div>
            ) : timeSlotStats.data.length === 0 ? (
              <div className="h-[240px] w-full flex items-center justify-center text-sm text-[#6a5d50]">
                ยังไม่มีข้อมูลรอบเวลาสอนในช่วงเวลานี้
              </div>
            ) : (
              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={timeSlotStats.data.slice(0, 6)}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 40, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee8e0" />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#6a5d50", fontSize: 11 }}
                      tickFormatter={(v) =>
                        metric === "revenue"
                          ? v >= 1000
                            ? `฿${(v / 1000).toFixed(0)}k`
                            : `฿${v}`
                          : v
                      }
                    />
                    <YAxis
                      dataKey="timeSlot"
                      type="category"
                      tickLine={false}
                      axisLine={{ stroke: "#ddd4c8" }}
                      tick={{ fill: "#3d3229", fontSize: 11, fontWeight: "bold" }}
                      width={85}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="bg-[#3d3229] text-white p-3 rounded-lg shadow-xl text-xs border border-white/10">
                            <p className="font-bold text-[#10b981] mb-1.5">{d.timeSlot}</p>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">ยอดขาย:</span>
                                <span className="font-bold">฿{d.revenue.toLocaleString("th-TH")}</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">จำนวนการจอง:</span>
                                <span className="font-bold">{d.bookings} ครั้ง</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-gray-300">ที่นั่ง:</span>
                                <span className="font-bold">{d.seats} ที่</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey={
                        metric === "revenue"
                          ? "revenue"
                          : metric === "bookings"
                          ? "bookings"
                          : "seats"
                      }
                      radius={[0, 4, 4, 0]}
                    >
                      {timeSlotStats.data.slice(0, 6).map((entry, index) => (
                        <Cell
                          key={`cell-time-${index}`}
                          fill={index === 0 ? "#10b981" : "#3b82f6"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#eee8e0] flex items-center justify-between text-xs text-[#6a5d50]">
              <span>💡 ช่วงเวลาที่มีการจองหนาแน่นที่สุด คือช่วงเวลาที่แนะนำให้เปิดรอบสอนเพิ่ม</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Performance Breakdown & Ranking Table using Shadcn Card & Table */}
      <Card className="border-[#ddd4c8] bg-white shadow-xs overflow-hidden">
        <CardHeader className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fdfcfb]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#f59e0b]/10 text-[#f59e0b] rounded-md">
                <Award size={16} />
              </span>
              <CardTitle className="text-base font-bold text-[#3d3229]">
                ตารางสรุปและเปรียบเทียบอันดับคอร์สเรียนทั้งหมด (รวมคอร์สชื่อเดียวกัน)
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-[#6a5d50] mt-0.5">
              วิเคราะห์คอร์สที่มียอดจองและยอดขายสูงสุดในช่วงเวลาที่เลือก (คลิกแถวเพื่อกรองเฉพาะคอร์สนั้น)
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6a5d50]">จัดเรียงตาม:</span>
            <div className="flex bg-[#f4f1ec] p-0.5 rounded-lg text-xs font-bold gap-1">
              <Button
                variant={rankingSort === "revenue" ? "default" : "ghost"}
                size="xs"
                onClick={() => setRankingSort("revenue")}
                className={rankingSort === "revenue" ? "bg-[#3d3229] text-white" : "text-[#6a5d50]"}
              >
                ยอดขาย
              </Button>
              <Button
                variant={rankingSort === "bookings" ? "default" : "ghost"}
                size="xs"
                onClick={() => setRankingSort("bookings")}
                className={rankingSort === "bookings" ? "bg-[#3d3229] text-white" : "text-[#6a5d50]"}
              >
                ยอดจอง
              </Button>
              <Button
                variant={rankingSort === "seats" ? "default" : "ghost"}
                size="xs"
                onClick={() => setRankingSort("seats")}
                className={rankingSort === "seats" ? "bg-[#3d3229] text-white" : "text-[#6a5d50]"}
              >
                จำนวนที่นั่ง
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#faf8f5] hover:bg-[#faf8f5]">
                <TableHead className="w-12 text-center text-[#6a5d50] font-bold">อันดับ</TableHead>
                <TableHead className="text-[#6a5d50] font-bold">ชื่อคอร์สเรียน</TableHead>
                <TableHead className="text-center text-[#6a5d50] font-bold">จำนวนรอบสอน</TableHead>
                <TableHead className="text-right text-[#6a5d50] font-bold">ราคาเฉลี่ย</TableHead>
                <TableHead className="text-right text-[#6a5d50] font-bold">ยอดจอง (ครั้ง)</TableHead>
                <TableHead className="text-right text-[#6a5d50] font-bold">ที่นั่งที่ขายได้</TableHead>
                <TableHead className="text-right text-[#6a5d50] font-bold">ยอดขายรวม (บาท)</TableHead>
                <TableHead className="w-44 text-[#6a5d50] font-bold">สัดส่วนยอดขาย</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseStatsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-[#6a5d50]">
                    ไม่มีข้อมูลคอร์สเรียนในช่วงเวลานี้
                  </TableCell>
                </TableRow>
              ) : (
                courseStatsList.map((item, idx) => {
                  const sharePct =
                    stats.totalRevenue > 0
                      ? Math.round((item.revenue / stats.totalRevenue) * 100)
                      : 0;
                  const isSelected = selectedCourseName === item.name;
                  return (
                    <TableRow
                      key={item.name}
                      onClick={() =>
                        setSelectedCourseName(isSelected ? "all" : item.name)
                      }
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#8f3b2c]/10 hover:bg-[#8f3b2c]/15"
                          : "hover:bg-[#f7f4ef]/50"
                      }`}
                    >
                      <TableCell className="text-center">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f59e0b] text-white font-bold text-xs shadow-xs">
                            🥇
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#9ca3af] text-white font-bold text-xs">
                            🥈
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#d97706] text-white font-bold text-xs">
                            🥉
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-gray-500">{idx + 1}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-[#3d3229] flex items-center gap-2">
                          {item.name}
                          {isSelected && (
                            <Badge variant="default" className="bg-[#8f3b2c] text-white text-[10px] py-0 px-1.5">
                              กำลังเลือก
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center tabular-nums text-[#6a5d50]">
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {item.sessionCount} รอบ
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-[#6a5d50]">
                        ฿{item.avgPrice.toLocaleString("th-TH")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#3d3229] tabular-nums">
                        {item.bookings.toLocaleString("th-TH")}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#3d3229] tabular-nums">
                        {item.seats.toLocaleString("th-TH")}
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#8f3b2c] tabular-nums text-base">
                        ฿{item.revenue.toLocaleString("th-TH")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                            <div
                              className="bg-[#e51d53] h-full rounded-full transition-all duration-500"
                              style={{ width: `${sharePct}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-600 w-8 text-right">
                            {sharePct}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
