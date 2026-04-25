import React, { useState, useEffect } from 'react';
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
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: LayoutDashboard,
      title: "Interactive Dashboard",
      description: "Explore planned initiatives, bills passed, and ongoing public discussions in real-time",
      color: "from-yellow-400 to-amber-500"
    },
    {
      icon: MessageSquare,
      title: "Open Discussion Spaces",
      description: "Department-wise channels for direct engagement with officials and policy feedback",
      color: "from-red-500 to-rose-600"
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Unified search for politicians and departments with instant access to projects and records",
      color: "from-amber-400 to-orange-500"
    },
    {
      icon: Vote,
      title: "Election Mode",
      description: "Booth-wise candidate lists, experience, and track records for informed voting",
      color: "from-yellow-500 to-red-500"
    },
    {
      icon: BarChart3,
      title: "Public Feedback & Polling",
      description: "Vote, comment, and suggest improvements on government initiatives",
      color: "from-red-400 to-amber-500"
    },
    {
      icon: TrendingUp,
      title: "Data Dashboard for Officials",
      description: "Analytics on citizen sentiment, engagement, and feedback for better decisions",
      color: "from-yellow-600 to-red-400"
    }
  ];

  const stats = [
    { label: "Active Citizens", value: "2.5M+", icon: Users },
    { label: "Initiatives Tracked", value: "1,200+", icon: Eye },
    { label: "Bills Discussed", value: "450+", icon: Shield },
    { label: "Engagement Rate", value: "87%", icon: Heart }
  ];

  const handleExplorePlatform = () => {
    navigate('/dashboard');
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-yellow-500 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-red-600 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-red-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              Belaku
            </span>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full font-semibold hover:shadow-2xl hover:shadow-yellow-500/50 transition-all"
          >
            Get Started
          </motion.button>
        </nav>

        <div className="container mx-auto px-6 pt-20 pb-32">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Reimagining{' '}
                <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-red-400 bg-clip-text text-transparent">
                  Governance
                </span>
                <br />
                for Karnataka
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                A participatory, data-driven system where citizens and government collaborate in real-time to shape the state's progress through transparency and digital engagement.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => navigate('/auth')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full font-bold text-lg flex items-center justify-center space-x-2 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all"
                >
                  <span>Explore Platform</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="p-6 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg rounded-2xl border border-white/10"
                >
                  <stat.icon className="w-8 h-8 text-yellow-400 mb-3 mx-auto" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-300 to-red-400 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 bg-gradient-to-b from-transparent via-black/30 to-transparent">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Powerful{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-red-400 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              AI-powered insights and real-time collaboration tools designed for modern governance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                onHoverStart={() => setActiveFeature(idx)}
                className="group relative p-8 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-yellow-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="mt-6 flex items-center text-yellow-400 font-semibold"
                >
                  Learn more <ChevronRight className="w-5 h-5 ml-1" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-32">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center p-12 bg-gradient-to-br from-yellow-500/10 via-red-500/10 to-yellow-500/10 backdrop-blur-xl rounded-3xl border border-yellow-500/20"
          >
            <h2 className="text-5xl font-bold mb-6">
              Shape Karnataka's{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-red-400 bg-clip-text text-transparent">
                Future
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of citizens in building a transparent, collaborative governance system for Karnataka
            </p>
            <motion.button
              onClick={() => navigate('/auth')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full font-bold text-xl shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-all"
            >
              Join Belaku Today
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-red-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Belaku</span>
          </div>
          <p className="mb-2">Empowering Karnataka through transparent governance</p>
          <p className="text-sm">© 2025 Government of Karnataka. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}