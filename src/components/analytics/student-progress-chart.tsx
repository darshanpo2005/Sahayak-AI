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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { QuizResult } from "@/lib/services"

const chartConfig = {
  students: {
    label: "Students",
  },
  "90-100": { label: "90-100%", color: "hsl(var(--chart-5))" },
  "80-89": { label: "80-89%", color: "hsl(var(--chart-4))" },
  "70-79": { label: "70-79%", color: "hsl(var(--chart-3))" },
  "60-69": { label: "60-69%", color: "hsl(var(--chart-2))" },
  "<60": { label: "<60%", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig

export function StudentProgressChart({ results }: { results: QuizResult[] }) {
  const scoreDistribution = [
    { range: "90-100", count: 0 },
    { range: "80-89", count: 0 },
    { range: "70-79", count: 0 },
    { range: "60-69", count: 0 },
    { range: "<60", count: 0 },
  ]

  results.forEach(result => {
    const score = result.score;
    if (score >= 90) scoreDistribution[0].count++;
    else if (score >= 80) scoreDistribution[1].count++;
    else if (score >= 70) scoreDistribution[2].count++;
    else if (score >= 60) scoreDistribution[3].count++;
    else scoreDistribution[4].count++;
  });
  
  const chartData = scoreDistribution.map(d => ({
    range: chartConfig[d.range as keyof typeof chartConfig].label,
    students: d.count,
    fill: chartConfig[d.range as keyof typeof chartConfig].color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Score Distribution</CardTitle>
        <CardDescription>
          Shows the distribution of the latest quiz scores for the selected course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-64">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="range"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="students" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
