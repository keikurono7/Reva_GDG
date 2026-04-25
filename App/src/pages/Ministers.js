import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  User, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  TrendingUp,
  FileText,
  ExternalLink,
  Building2,
  Users,
  ChevronRight,
  Briefcase,
  Target
} from 'lucide-react';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { app } from '../services/firebase_';

const db = getFirestore(app);

// Mock data (always available as fallback)
const mockMinisters = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    post: 'Chief Minister',
    party: 'Indian National Congress',
    constituency: 'Bengaluru Central',
    age: 58,
    education: 'PhD in Political Science, Harvard University',
    phone: '+91 80 2222 3333',
    email: 'rajesh.kumar@gov.in',
    ministerType: 'cabinet',
    profileImage: null,
    schemes: 'Launched Skill Development Program, Digital Governance Initiative',
    electionHistory: 'Elected 4 times consecutively from Bengaluru Central (2008, 2013, 2018, 2023)',
    futurePlans: 'Focus on making Karnataka a $1 Trillion economy by 2030',
    initiatives: [
      { title: 'Digital Governance', description: 'E-governance portal for all services' },
      { title: 'Skill Development', description: 'Training 1 million youth by 2025' }
    ],
    milestones: [
      { title: 'New Metro Lines', budget: '15000 Cr', description: 'Extended metro to 5 new areas' },
      { title: 'Hospital Network', budget: '5000 Cr', description: 'Built 50 new hospitals' }
    ],
    achievements: [
      'Reduced unemployment by 15%',
      'Implemented free bus service for women',
      'Launched 100 new schools in rural areas'
    ]
  },
  {
    id: '2',
    name: 'Priya Sharma',
    post: 'Minister of Education',
    party: 'Bharatiya Janata Party',
    constituency: 'Mysuru North',
    age: 52,
    education: 'MA in Education Policy, Oxford University',
    phone: '+91 80 2222 4444',
    email: 'priya.sharma@gov.in',
    ministerType: 'cabinet',
    profileImage: null,
    schemes: 'Free Tablets for Students, Teacher Training Program',
    electionHistory: 'Elected 3 times from Mysuru North (2013, 2018, 2023)',
    futurePlans: 'Achieve 100% literacy rate by 2026',
    initiatives: [
      { title: 'Digital Classrooms', description: 'Smart boards in 10,000 schools' },
      { title: 'Mid-Day Meal Enhancement', description: 'Nutritious meals for 5M students' }
    ],
    milestones: [
      { title: 'New Universities', budget: '3000 Cr', description: 'Established 10 new universities' },
      { title: 'Scholarship Program', budget: '1000 Cr', description: '1 lakh scholarships annually' }
    ],
    achievements: [
      'Increased school enrollment by 25%',
      'Reduced dropout rate by 40%',
      'Launched teacher incentive program'
    ]
  },
  {
    id: '3',
    name: 'Suresh Patel',
    post: 'Minister of Health & Family Welfare',
    party: 'Janata Dal (Secular)',
    constituency: 'Hubli-Dharwad',
    age: 48,
    education: 'MBBS, MD in Public Health',
    phone: '+91 80 2222 5555',
    email: 'suresh.patel@gov.in',
    ministerType: 'cabinet',
    profileImage: null,
    schemes: 'Universal Health Coverage, Maternal Care Program',
    electionHistory: 'Elected 2 times from Hubli-Dharwad (2018, 2023)',
    futurePlans: 'Establish 500 primary health centers in rural areas by 2025',
    initiatives: [
      { title: 'Mobile Health Units', description: 'Healthcare access in remote villages' },
      { title: 'Telemedicine Network', description: 'Free online consultations' }
    ],
    milestones: [
      { title: 'COVID Management', budget: '2000 Cr', description: 'Successfully managed pandemic' },
      { title: 'Medical Colleges', budget: '5000 Cr', description: 'Opened 15 new medical colleges' }
    ],
    achievements: [
      'Reduced infant mortality by 30%',
      'Launched free ambulance service',
      'Vaccinated 90% of population'
    ]
  },
  {
    id: '4',
    name: 'Anita Reddy',
    post: 'State Minister for Rural Development',
    party: 'Aam Aadmi Party',
    constituency: 'Raichur',
    age: 45,
    education: 'MBA in Rural Management',
    phone: '+91 80 2222 6666',
    email: 'anita.reddy@gov.in',
    ministerType: 'state',
    profileImage: null,
    schemes: 'Rural Road Connectivity, Solar Power for Villages',
    electionHistory: 'Elected 2 times from Raichur (2018, 2023)',
    futurePlans: 'Connect all villages with paved roads by 2026',
    initiatives: [
      { title: 'Gram Sabha Digitization', description: 'Online participation in village meetings' },
      { title: 'Rural Entrepreneurship', description: 'Support for village businesses' }
    ],
    milestones: [
      { title: 'Road Network', budget: '8000 Cr', description: 'Built 5000 km of rural roads' },
      { title: 'Electrification', budget: '3000 Cr', description: '100% village electrification' }
    ],
    achievements: [
      'Improved rural connectivity by 60%',
      'Launched self-help groups for women',
      'Brought clean water to 1000 villages'
    ]
  },
  {
    id: '5',
    name: 'Vikram Singh',
    post: 'Minister of Transport',
    party: 'Indian National Congress',
    constituency: 'Mangaluru',
    age: 55,
    education: 'B.Tech in Civil Engineering',
    phone: '+91 80 2222 7777',
    email: 'vikram.singh@gov.in',
    ministerType: 'cabinet',
    profileImage: null,
    schemes: 'Metro Expansion, Electric Bus Fleet',
    electionHistory: 'Elected 4 times from Mangaluru (2008, 2013, 2018, 2023)',
    futurePlans: 'Launch high-speed rail corridor by 2028',
    initiatives: [
      { title: 'Green Transport', description: '5000 electric buses in operation' },
      { title: 'Smart Traffic', description: 'AI-based traffic management system' }
    ],
    milestones: [
      { title: 'Metro Phase 3', budget: '25000 Cr', description: 'Extended metro by 100 km' },
      { title: 'Bus Modernization', budget: '5000 Cr', description: 'Replaced old buses with new fleet' }
    ],
    achievements: [
      'Reduced traffic congestion by 35%',
      'Launched free bus service for students',
      'Improved public transport coverage by 50%'
    ]
  },
  {
    id: '6',
    name: 'Arjun Desai',
    post: 'Minister of Finance',
    party: 'Bharatiya Janata Party',
    constituency: 'Belagavi',
    age: 60,
    education: 'MBA from IIM Bangalore, CA',
    phone: '+91 80 2222 8888',
    email: 'arjun.desai@gov.in',
    ministerType: 'cabinet',
    profileImage: null,
    schemes: 'Fiscal Discipline Initiative, Startup Funding Program',
    electionHistory: 'Elected 5 times from Belagavi (2003, 2008, 2013, 2018, 2023)',
    futurePlans: 'Achieve fiscal surplus by 2027, attract ₹1 Lakh Cr investments',
    initiatives: [
      { title: 'Investment Portal', description: 'Single-window clearance system' },
      { title: 'GST Simplification', description: 'Reduced compliance burden for businesses' }
    ],
    milestones: [
      { title: 'Debt Reduction', budget: '20000 Cr', description: 'Reduced state debt by 15%' },
      { title: 'Revenue Growth', budget: '10000 Cr', description: 'Increased tax revenue by 25%' }
    ],
    achievements: [
      'Improved state credit rating',
      'Launched pension scheme for informal workers',
      'Reduced fiscal deficit by 40%'
    ]
  },
  {
    id: '7',
    name: 'Lakshmi Nair',
    post: 'Minister of Women & Child Development',
    party: 'Indian National Congress',
    constituency: 'Udupi',
    age: 49,
    education: 'MSW, PhD in Gender Studies',
    phone: '+91 80 2222 9999',
    email: 'lakshmi.nair@gov.in',
    ministerType: 'cabinet',
    profileImage: null,
    schemes: 'Shakti Scheme for Women, Child Nutrition Program',
    electionHistory: 'Elected 3 times from Udupi (2013, 2018, 2023)',
    futurePlans: 'Ensure safety and empowerment of all women by 2028',
    initiatives: [
      { title: 'Women Safety App', description: 'Emergency response within 5 minutes' },
      { title: 'Skill Training', description: 'Vocational training for 5 lakh women' }
    ],
    milestones: [
      { title: 'Anganwadi Centers', budget: '4000 Cr', description: 'Upgraded 10,000 centers' },
      { title: 'Women Helpline', budget: '500 Cr', description: '24/7 support service launched' }
    ],
    achievements: [
      'Reduced crimes against women by 30%',
      'Launched free bus travel for women',
      'Provided loans to 50,000 women entrepreneurs'
    ]
  },
  {
    id: '8',
    name: 'Karthik Rao',
    post: 'State Minister for IT & BT',
    party: 'Janata Dal (Secular)',
    constituency: 'Tumkur',
    age: 42,
    education: 'B.Tech from IIT Madras, MS from Stanford',
    phone: '+91 80 2222 1111',
    email: 'karthik.rao@gov.in',
    ministerType: 'state',
    profileImage: null,
    schemes: 'Tech Parks Development, Digital Literacy Program',
    electionHistory: 'Elected 2 times from Tumkur (2018, 2023)',
    futurePlans: 'Make Karnataka the tech capital of Asia by 2030',
    initiatives: [
      { title: 'Innovation Hubs', description: '50 innovation centers across state' },
      { title: 'Coding for All', description: 'Free coding classes in schools' }
    ],
    milestones: [
      { title: 'Tech Parks', budget: '12000 Cr', description: 'Built 20 new tech parks' },
      { title: 'Startup Fund', budget: '3000 Cr', description: 'Funded 500 startups' }
    ],
    achievements: [
      'Attracted 100+ global IT companies',
      'Created 2 lakh tech jobs',
      'Launched state AI policy'
    ]
  }
];

function Ministers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinister, setSelectedMinister] = useState(null);
  const [ministers, setMinisters] = useState([]);
  const [filteredMinisters, setFilteredMinisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, cabinet, state

  // Fetch ministers from Firestore
  useEffect(() => {
    const fetchMinisters = async () => {
      setLoading(true);
      try {
        // Query users collection where role is 'politician' or has 'post' field
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'politician')
        );
        
        const snapshot = await getDocs(q);
        const ministersList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.post); // Only include users with a post/position

        // If we have real ministers from Firebase, use them; otherwise use mock data
        if (ministersList.length > 0) {
          setMinisters(ministersList);
          setFilteredMinisters(ministersList);
        } else {
          // Use mock data as fallback
          console.log('No ministers found in Firebase, using mock data');
          setMinisters(mockMinisters);
          setFilteredMinisters(mockMinisters);
        }
      } catch (error) {
        console.error('Error fetching ministers:', error);
        // Always fallback to mock data on error
        setMinisters(mockMinisters);
        setFilteredMinisters(mockMinisters);
      } finally {
        setLoading(false);
      }
    };

    fetchMinisters();
  }, []);

  // Search and filter logic
  useEffect(() => {
    let results = ministers;

    // Filter by search term
    if (searchTerm.trim()) {
      results = results.filter(minister =>
        minister.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        minister.post?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        minister.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        minister.constituency?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === 'cabinet') {
      results = results.filter(m => m.ministerType === 'cabinet' || m.post?.toLowerCase().includes('minister'));
    } else if (activeTab === 'state') {
      results = results.filter(m => m.ministerType === 'state' || m.post?.toLowerCase().includes('state'));
    }

    setFilteredMinisters(results);
  }, [searchTerm, ministers, activeTab]);

  const tabs = [
    { id: 'all', label: 'All Ministers', icon: Users },
    { id: 'cabinet', label: 'Cabinet Ministers', icon: Award },
    { id: 'state', label: 'State Ministers', icon: Building2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
            Ministers Directory
          </h1>
          <p className="text-gray-400">
            Search and explore profiles of government ministers
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, position, party, or constituency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-yellow-500 to-red-500 shadow-lg'
                  : 'bg-white/10 border border-white/10 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading ministers...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <p className="text-gray-400 mb-4">
            Found {filteredMinisters.length} minister{filteredMinisters.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Ministers Grid */}
        {!loading && filteredMinisters.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMinisters.map((minister) => (
              <motion.div
                key={minister.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedMinister(minister)}
                className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer hover:border-yellow-500/50 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  {minister.profileImage ? (
                    <img
                      src={minister.profileImage}
                      alt={minister.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-yellow-500"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{minister.name}</h3>
                    <p className="text-sm text-yellow-400 mb-1">{minister.post}</p>
                    <p className="text-xs text-gray-400">{minister.party}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{minister.constituency}</span>
                  </div>
                  {minister.age && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Age: {minister.age}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center text-yellow-400 font-semibold text-sm">
                  View Full Profile
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredMinisters.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-2xl font-bold mb-2">No Ministers Found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </motion.div>

      {/* Minister Detail Modal */}
      <AnimatePresence>
        {selectedMinister && (
          <MinisterDetailModal
            minister={selectedMinister}
            onClose={() => setSelectedMinister(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Minister Detail Modal Component
function MinisterDetailModal({ minister, onClose }) {
  const [activeDetailTab, setActiveDetailTab] = useState('overview');

  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'initiatives', label: 'Initiatives', icon: Target },
    { id: 'achievements', label: 'Achievements', icon: Award },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-red-950 rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-red-950 border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            {minister.profileImage ? (
              <img
                src={minister.profileImage}
                alt={minister.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-yellow-500"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-3xl font-bold">{minister.name}</h2>
              <p className="text-yellow-400">{minister.post}</p>
              <p className="text-sm text-gray-400">{minister.party}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Detail Tabs */}
        <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDetailTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition-all whitespace-nowrap ${
                activeDetailTab === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeDetailTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Constituency</p>
                  <p className="font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-yellow-500" />
                    {minister.constituency}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Age</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    {minister.age} years
                  </p>
                </div>
              </div>

              {minister.education && (
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    Education
                  </h3>
                  <p className="text-gray-300 p-4 bg-white/5 rounded-xl">
                    {minister.education}
                  </p>
                </div>
              )}

              {minister.electionHistory && (
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                    Election History
                  </h3>
                  <p className="text-gray-300 p-4 bg-white/5 rounded-xl">
                    {minister.electionHistory}
                  </p>
                </div>
              )}

              {minister.schemes && (
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-yellow-500" />
                    Key Schemes
                  </h3>
                  <p className="text-gray-300 p-4 bg-white/5 rounded-xl">
                    {minister.schemes}
                  </p>
                </div>
              )}

              {minister.futurePlans && (
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-500" />
                    Future Plans
                  </h3>
                  <p className="text-gray-300 p-4 bg-white/5 rounded-xl">
                    {minister.futurePlans}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Initiatives Tab */}
          {activeDetailTab === 'initiatives' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-4">Major Initiatives</h3>
              
              {minister.initiatives && minister.initiatives.length > 0 ? (
                <div className="space-y-4">
                  {minister.initiatives.map((initiative, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-xl">
                      <h4 className="font-semibold text-lg mb-2">{initiative.title}</h4>
                      <p className="text-gray-400">{initiative.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No initiatives listed</p>
              )}

              {minister.milestones && minister.milestones.length > 0 && (
                <>
                  <h3 className="text-2xl font-bold mb-4 mt-8">Milestones Achieved</h3>
                  <div className="space-y-4">
                    {minister.milestones.map((milestone, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-lg">{milestone.title}</h4>
                          <span className="text-yellow-400 font-bold">₹{milestone.budget}</span>
                        </div>
                        <p className="text-gray-400">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeDetailTab === 'achievements' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-2xl font-bold mb-4">Key Achievements</h3>
              
              {minister.achievements && minister.achievements.length > 0 ? (
                <div className="space-y-3">
                  {minister.achievements.map((achievement, idx) => (
                    <div key={idx} className="p-4 bg-white/5 rounded-xl flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-black font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-gray-300 flex-1">{achievement}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No achievements listed</p>
              )}
            </motion.div>
          )}

          {/* Contact Tab */}
          {activeDetailTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                {minister.phone && (
                  <a
                    href={`tel:${minister.phone}`}
                    className="p-4 bg-white/5 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all"
                  >
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="font-semibold">{minister.phone}</p>
                    </div>
                  </a>
                )}

                {minister.email && (
                  <a
                    href={`mailto:${minister.email}`}
                    className="p-4 bg-white/5 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="font-semibold">{minister.email}</p>
                    </div>
                  </a>
                )}

                <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Constituency Office</p>
                    <p className="font-semibold">{minister.constituency}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Ministers;