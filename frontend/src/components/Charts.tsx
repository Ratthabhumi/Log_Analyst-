"use client";

import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import { StatsData } from "@/lib/types";
import { t } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ChartsProps {
  stats: StatsData;
  language: string;
}

const COLORS = ['#0078d4', '#107c10', '#d83b01', '#5c2d91', '#00188f', '#e81123'];

export function Charts({ stats, language }: ChartsProps) {
  // Sort daily trends by date to ensure chronological order
  const sortedTrends = useMemo(() => {
    if (!stats.dailyTrends) return [];
    return [...stats.dailyTrends].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [stats.dailyTrends]);

  if (!stats.dailyTrends || stats.dailyTrends.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {language === 'th' ? "แนวโน้มรายสัปดาห์ (Daily Trends)" : "Weekly Trends (Last 7 Days)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedTrends}>
                <XAxis dataKey="date" tickFormatter={(str) => {
                  const date = new Date(str);
                  return `${date.getMonth()+1}/${date.getDate()}`;
                }} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(str) => new Date(str).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
                />
                <Bar dataKey="count" fill="#0078d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {language === 'th' ? "สัดส่วน Error ตามประเภท (Provider)" : "Error Distribution (Provider)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
