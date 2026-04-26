import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPinned,
  MessageCircleMore,
  ShieldAlert,
  ClipboardCheck,
  LineChart,
  Users,
  ChevronRight,
  Sparkles,
  Bot,
  Eye,
  Globe,
  Timer
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
      icon: MapPinned,
      title: 'Geo-Tagged Issue Reporting',
      description: 'Citizens can report local issues with location context and tag the right representative in minutes.',
      color: 'from-amber-400 to-orange-500'
    },
    {
      icon: MessageCircleMore,
      title: 'Pre-Policy Consultation',
      description: 'Collect citizen feedback and votes before policies are finalized to reduce conflict and improve trust.',
      color: 'from-orange-400 to-red-400'
    },
    {
      icon: ShieldAlert,
      title: 'AI Conflict-Risk Alerts',
      description: 'Gemini analyzes issue sentiment and flags high-tension topics early for proactive intervention.',
      color: 'from-amber-300 to-orange-400'
    },
    {
      icon: ClipboardCheck,
      title: 'Transparent Work Profiles',
      description: 'Track issue resolution rate, engagement history, and public updates from elected representatives.',
      color: 'from-amber-500 to-red-400'
    },
    {
      icon: LineChart,
      title: 'Constituency Insights',
      description: 'Weekly digests summarize top local concerns so officials can prioritize impact-driven decisions.',
      color: 'from-orange-300 to-amber-500'
    },
    {
      icon: Bot,
      title: 'Real-Time Accountability',
      description: 'Every update is visible as it happens, so citizens see progress and institutions build credibility.',
      color: 'from-amber-600 to-orange-400'
    }
  ];

  const stats = [
    { label: 'Active Citizens', value: '14M+', icon: Users },
    { label: 'Constituencies Connected', value: '30+', icon: Globe },
    { label: 'Issue Escalation Speed', value: 'Real-time', icon: Timer },
    { label: 'Transparency Visibility', value: 'Live', icon: Eye }
  ];

  const handleExplorePlatform = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_26%),linear-gradient(180deg,#fffdf9_0%,#fff8f1_56%,#f7f1e7_100%)] text-slate-900">
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
        <nav className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_12px_30px_rgba(249,115,22,0.18)]">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Pratinidhi
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExplorePlatform}
            className="rounded-full border border-amber-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-amber-300 hover:text-slate-900 hover:shadow-md sm:px-6 sm:py-3 sm:text-base"
          >
            Get Started
          </motion.button>
        </nav>

        <div className="container mx-auto px-4 pb-20 pt-12 sm:px-6 sm:pb-32 sm:pt-20">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="mb-5 text-4xl font-bold leading-tight sm:text-5xl md:mb-6 md:text-7xl">
                Participatory{' '}
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-400 bg-clip-text text-transparent">
                  Governance
                </span>
                <br />
                for Peaceful Cities
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg md:mb-12 md:text-2xl">
                Pratinidhi bridges citizens and elected representatives through real-time consultation, transparent issue tracking, and AI-powered conflict prevention.
              </p>

              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={() => navigate('/auth')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-base font-bold text-white shadow-[0_18px_45px_rgba(245,158,11,0.24)] transition-all hover:shadow-[0_22px_55px_rgba(245,158,11,0.3)] sm:px-8 sm:py-4 sm:text-lg"
                >
                  <span>Enter Pratinidhi</span>
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-14 grid grid-cols-1 gap-4 sm:mt-24 sm:grid-cols-2 sm:gap-6 md:grid-cols-4"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-lg sm:p-6"
                >
                  <stat.icon className="mx-auto mb-3 h-8 w-8 text-amber-500" />
                  <div className="mb-1 bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center sm:mb-20"
          >
            <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-5xl">
              Platform{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Capabilities
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-500 sm:text-xl">
              Designed for continuous citizen-government engagement, not just election-time visibility
            </p>
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 sm:gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/80 bg-white/82 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-all duration-300 hover:border-amber-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.1)] sm:p-8"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />

                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-[0_14px_30px_rgba(245,158,11,0.16)] transition-transform duration-300 group-hover:scale-110`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="mb-4 text-xl font-bold text-slate-900 transition-colors group-hover:text-amber-600 sm:text-2xl">
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

      <div className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-4xl rounded-[2rem] border border-amber-100 bg-white/88 p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-12"
          >
            <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-5xl">
              Build Trust Before{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Tensions Escalate
              </span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-base text-slate-600 sm:mb-10 sm:text-xl">
              Start reporting issues, participating in consultations, and tracking resolution updates in one shared civic system.
            </p>
            <motion.button
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-7 py-3 text-base font-bold text-white shadow-[0_18px_45px_rgba(245,158,11,0.24)] transition-all hover:shadow-[0_22px_55px_rgba(245,158,11,0.3)] sm:px-10 sm:py-5 sm:text-xl"
            >
              Start Participating
            </motion.button>
          </motion.div>
        </div>
      </div>

      <footer className="border-t border-black/5 py-10 sm:py-12">
        <div className="container mx-auto px-4 text-center text-slate-500 sm:px-6">
          <div className="mb-4 flex items-center justify-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Pratinidhi</span>
          </div>
          <p className="mb-2">A transparent civic platform for citizens and representatives.</p>
          <p className="text-sm">&#169; 2026 Pratinidhi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
