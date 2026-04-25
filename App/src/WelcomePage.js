import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  Vote,
  BarChart3,
  Users,
  Shield,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Eye,
  Heart
} from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Interactive Dashboard',
      description: "Explore planned initiatives, bills passed, and ongoing public discussions in real-time",
      color: 'from-amber-400 to-orange-500'
    },
    {
      icon: MessageSquare,
      title: 'Open Discussion Spaces',
      description: 'Department-wise channels for direct engagement with officials and policy feedback',
      color: 'from-orange-400 to-red-400'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Unified search for politicians and departments with instant access to projects and records',
      color: 'from-amber-300 to-orange-400'
    },
    {
      icon: Vote,
      title: 'Election Mode',
      description: 'Booth-wise candidate lists, experience, and track records for informed voting',
      color: 'from-amber-500 to-red-400'
    },
    {
      icon: BarChart3,
      title: 'Public Feedback & Polling',
      description: 'Vote, comment, and suggest improvements on government initiatives',
      color: 'from-orange-300 to-amber-500'
    },
    {
      icon: TrendingUp,
      title: 'Data Dashboard for Officials',
      description: 'Analytics on citizen sentiment, engagement, and feedback for better decisions',
      color: 'from-amber-600 to-orange-400'
    }
  ];

  const stats = [
    { label: 'Active Citizens', value: '2.5M+', icon: Users },
    { label: 'Initiatives Tracked', value: '1,200+', icon: Eye },
    { label: 'Bills Discussed', value: '450+', icon: Shield },
    { label: 'Engagement Rate', value: '87%', icon: Heart }
  ];

  const handleExplorePlatform = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_26%),linear-gradient(180deg,#fffdf9_0%,#fff8f1_56%,#f7f1e7_100%)] text-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.14, 0.2, 0.14]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-br from-amber-200 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.16, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-tr from-orange-200 to-transparent blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.04}px)` }}
        />
      </div>

      <div className="relative">
        <nav className="container mx-auto flex items-center justify-between px-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_12px_30px_rgba(249,115,22,0.18)]">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent">
              Pratinidhi
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExplorePlatform}
            className="rounded-full border border-amber-200 bg-white/85 px-6 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:border-amber-300 hover:text-slate-900 hover:shadow-md"
          >
            Get Started
          </motion.button>
        </nav>

        <div className="container mx-auto px-6 pb-32 pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="mb-6 text-6xl font-bold leading-tight md:text-7xl">
                Reimagining{' '}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-400 bg-clip-text text-transparent">
                  Governance
                </span>
                <br />
                for Bengaluru
              </h1>

              <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-slate-600 md:text-2xl">
                A participatory, data-driven system where citizens and government collaborate in real-time to shape the state's progress through transparency and digital engagement.
              </p>

              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() => navigate('/auth')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-lg font-bold text-white shadow-[0_18px_45px_rgba(245,158,11,0.24)] transition-all hover:shadow-[0_22px_55px_rgba(245,158,11,0.3)]"
                >
                  <span>Explore Platform</span>
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-24 grid grid-cols-2 gap-6 md:grid-cols-4"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-lg"
                >
                  <stat.icon className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                  <div className="mb-1 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-3xl font-bold text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="mb-6 text-5xl font-bold">
              Powerful{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-slate-500">
              AI-powered insights and real-time collaboration tools designed for modern governance
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/80 bg-white/82 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-amber-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.1)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />

                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-[0_14px_30px_rgba(245,158,11,0.16)] transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="mb-4 text-2xl font-bold text-slate-900 transition-colors group-hover:text-amber-600">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {feature.description}
                </p>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="mt-6 flex items-center font-semibold text-amber-600"
                >
                  Learn more <ChevronRight className="ml-1 h-5 w-5" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-[2rem] border border-amber-100 bg-white/88 p-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl"
          >
            <h2 className="mb-6 text-5xl font-bold">
              Shape Bengaluru&apos;s{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Future
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
              Join thousands of citizens in building a transparent, collaborative governance system for Bengaluru
            </p>
            <motion.button
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-10 py-5 text-xl font-bold text-white shadow-[0_18px_45px_rgba(245,158,11,0.24)] transition-all hover:shadow-[0_22px_55px_rgba(245,158,11,0.3)]"
            >
              Join Pratinidhi Today
            </motion.button>
          </motion.div>
        </div>
      </div>

      <footer className="border-t border-black/5 py-12">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <div className="mb-4 flex items-center justify-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Pratinidhi</span>
          </div>
          <p className="mb-2">Empowering Bengaluru through transparent governance</p>
          <p className="text-sm">&#169; 2025 Government of Bengaluru. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
