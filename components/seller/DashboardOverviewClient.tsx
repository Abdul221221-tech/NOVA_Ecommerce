'use client'

import React from 'react'
import { motion, useReducedMotion, Variants } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingBag, Package, TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import { CountUp } from './CountUp'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardMetrics {
  revenue: number
  orders: number
  products: number
  views: number
  recentOrders: any[]
  pendingOrders: number
  cancellations: number
  refunds: number
  returns: number
  exchanges: number
  trendData?: { date: string, revenue: number }[]
}

export function DashboardOverviewClient({ metrics }: { metrics: DashboardMetrics }) {
  const prefersReducedMotion = useReducedMotion()

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  }

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', bounce: 0.3, duration: 0.6 }
    }
  }

  const drawPath: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1.5, ease: "easeInOut", delay: 0.2 }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">Welcome back to your Seller Centre. Here's what's happening with your store today.</p>
      </div>

      <motion.div 
        className="grid gap-4 md:grid-cols-3 lg:grid-cols-6"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants} className="group col-span-1">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <CountUp value={metrics.orders} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="group col-span-1">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-4 w-4 text-accent-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <CountUp value={metrics.pendingOrders} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="group col-span-1">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <CountUp value={metrics.cancellations} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="group col-span-1">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunds</CardTitle>
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <CountUp value={metrics.refunds} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="group col-span-1">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Returns</CardTitle>
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <CountUp value={metrics.returns} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants} className="group col-span-1">
          <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exchanges</CardTitle>
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <CountUp value={metrics.exchanges} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={cardVariants} className="col-span-4 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 pt-0">
              <div className="w-full h-[250px] bg-slate-50 dark:bg-slate-800/50 rounded-xl border flex flex-col items-center justify-center relative overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.trendData || []} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent-primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent-primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      tickFormatter={(value: any) => `?${value}`}
                      tick={{ fontSize: 12 }} 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))"
                      width={60}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: any) => [`?${value.toLocaleString('en-IN')}`, 'Revenue']}
                      labelStyle={{ color: 'black', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--accent-primary))" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={cardVariants} className="col-span-3 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {metrics.recentOrders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No recent orders.</p>
                ) : (
                  metrics.recentOrders.map((order, index) => (
                    <motion.div 
                      key={order.id} 
                      className="flex items-center group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + (index * 0.1) }}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground group-hover:text-accent-primary transition-colors" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none group-hover:text-accent-primary transition-colors">Order #{order.order_group_id.split('-')[0]}</p>
                        <p className="text-xs text-muted-foreground">{order.profiles?.email || 'Customer'}</p>
                      </div>
                      <div className="ml-auto font-medium text-sm">
                        +₹{order.seller_payout.toLocaleString('en-IN')}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
