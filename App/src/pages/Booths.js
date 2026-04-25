import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Award, TrendingUp, FileText, ExternalLink, Calendar, Loader, Navigation } from 'lucide-react';

function Booths() {
  const [boothNumber, setBoothNumber] = useState('');
  const [boothData, setBoothData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState('');
  
  // Location detection states
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [availableBooths, setAvailableBooths] = useState([]);

  // Mock location data - Replace with actual API
  const karnatakaData = {
    'Bengaluru Urban': {
      constituencies: {
        'Bengaluru South': ['101', '102', '103'],
        'Bengaluru North': ['104', '105', '106'],
        'Jayanagar': ['107', '108', '109']
      }
    },
    'Mysuru': {
      constituencies: {
        'Mysuru City': ['201', '202', '203'],
        'Chamaraja': ['204', '205', '206']
      }
    },
    'Dharwad': {
      constituencies: {
        'Dharwad': ['301', '302', '303'],
        'Hubballi-Dharwad Central': ['304', '305', '306']
      }
    }
  };

  // Mock data - Replace with actual Firebase/API calls
  const mockBoothData = {
    '101': {
      boothNumber: '101',
      constituency: 'Bengaluru South',
      district: 'Bengaluru Urban',
      location: 'Government School, Jayanagar',
      totalVoters: 1250
    },
    '102': {
      boothNumber: '102',
      constituency: 'Bengaluru South',
      district: 'Bengaluru Urban',
      location: 'Community Hall, JP Nagar',
      totalVoters: 980
    },
    '201': {
      boothNumber: '201',
      constituency: 'Mysuru City',
      district: 'Mysuru',
      location: 'Municipal School, Vijayanagar',
      totalVoters: 1100
    }
  };

  const mockCandidates = {
    '101': [
      {
        id: 1,
        name: 'Rajesh Kumar',
        party: 'Indian National Congress',
        partyShort: 'INC',
        symbol: '🤚',
        age: 45,
        education: 'MBA, Harvard University',
        experience: '15 years in public service',
        history: [
          { year: 2018, position: 'MLA - Bengaluru South', achievement: 'Implemented 50+ development projects' },
          { year: 2015, position: 'City Council Member', achievement: 'Led infrastructure committee' },
          { year: 2012, position: 'Youth Congress President', achievement: 'Organized 100+ community programs' }
        ],
        manifesto: [
          'Improve public transportation',
          'Enhance education infrastructure',
          'Create 10,000 jobs',
          'Upgrade healthcare facilities'
        ],
        achievements: [
          'Built 25 schools in the constituency',
          'Implemented free bus pass scheme',
          'Reduced traffic congestion by 30%'
        ]
      },
      {
        id: 2,
        name: 'Priya Sharma',
        party: 'Bharatiya Janata Party',
        partyShort: 'BJP',
        symbol: '🪷',
        age: 42,
        education: 'Ph.D. in Economics',
        experience: '12 years in governance',
        history: [
          { year: 2019, position: 'State Minister - Finance', achievement: 'Managed ₹50,000 Cr budget' },
          { year: 2016, position: 'MLA - Bengaluru North', achievement: 'Digital literacy program' },
          { year: 2013, position: 'Party Spokesperson', achievement: 'Policy advocacy' }
        ],
        manifesto: [
          'Digital governance initiatives',
          'Start-up ecosystem development',
          'Women empowerment programs',
          'Smart city implementation'
        ],
        achievements: [
          'Launched e-governance portal',
          'Created 5,000 IT jobs',
          'Women safety helpline'
        ]
      },
      {
        id: 3,
        name: 'Suresh Reddy',
        party: 'Aam Aadmi Party',
        partyShort: 'AAP',
        symbol: '🧹',
        age: 38,
        education: 'B.Tech, IIT Delhi',
        experience: '8 years in social work',
        history: [
          { year: 2020, position: 'Social Activist', achievement: 'Anti-corruption campaigns' },
          { year: 2018, position: 'NGO Founder', achievement: 'Education for underprivileged' },
          { year: 2015, position: 'Community Leader', achievement: 'Water conservation projects' }
        ],
        manifesto: [
          'Free electricity up to 300 units',
          'Quality government schools',
          'Free healthcare',
          'Mohalla clinics'
        ],
        achievements: [
          'Built 500 water harvesting structures',
          'Provided free education to 2,000 children',
          'Organized 50+ health camps'
        ]
      }
    ],
    '102': [
      // Same candidates for demo
      {
        id: 1,
        name: 'Rajesh Kumar',
        party: 'Indian National Congress',
        partyShort: 'INC',
        symbol: '🤚',
        age: 45,
        education: 'MBA, Harvard University',
        experience: '15 years in public service',
        history: [
          { year: 2018, position: 'MLA - Bengaluru South', achievement: 'Implemented 50+ development projects' }
        ],
        manifesto: ['Improve public transportation', 'Enhance education infrastructure'],
        achievements: ['Built 25 schools in the constituency']
      }
    ]
  };

  // Auto-detect location using Geolocation API
  const detectLocation = () => {
    setDetectingLocation(true);
    setError('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // In production, use reverse geocoding API
          // For now, simulate detection
          setTimeout(() => {
            setDetectedLocation({
              latitude,
              longitude,
              district: 'Bengaluru Urban',
              constituency: 'Bengaluru South'
            });
            setSelectedDistrict('Bengaluru Urban');
            setSelectedConstituency('Bengaluru South');
            setAvailableBooths(karnatakaData['Bengaluru Urban'].constituencies['Bengaluru South']);
            setDetectingLocation(false);
          }, 1500);
        },
        (error) => {
          setError('Location detection failed. Please select manually.');
          setDetectingLocation(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setDetectingLocation(false);
    }
  };

  // Handle district selection
  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedConstituency('');
    setAvailableBooths([]);
    setBoothData(null);
    setCandidates([]);
  };

  // Handle constituency selection
  const handleConstituencyChange = (constituency) => {
    setSelectedConstituency(constituency);
    const booths = karnatakaData[selectedDistrict].constituencies[constituency];
    setAvailableBooths(booths);
  };

  // Handle booth selection from dropdown
  const handleBoothSelection = (booth) => {
    setBoothNumber(booth);
    handleSearch(booth);
  };

  const handleSearch = async (boothNum = boothNumber) => {
    if (!boothNum.trim()) {
      setError('Please enter a booth number or select from dropdown');
      return;
    }

    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      const booth = mockBoothData[boothNum];
      const candidatesList = mockCandidates[boothNum];

      if (booth && candidatesList) {
        setBoothData(booth);
        setCandidates(candidatesList);
        setError('');
      } else {
        setError('Booth number not found. Please check and try again.');
        setBoothData(null);
        setCandidates([]);
      }
      setLoading(false);
    }, 1000);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-gray-900 text-white p-6">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            Find Your{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-red-400 bg-clip-text text-transparent">
              Candidates
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Detect your location or select your region to see candidates
          </p>
        </motion.div>

        {/* Location Detection & Selection Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            
            {/* Auto-detect Location Button */}
            <div className="mb-6 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={detectLocation}
                disabled={detectingLocation}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold flex items-center gap-2 mx-auto hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50"
              >
                {detectingLocation ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    Auto-Detect My Location
                  </>
                )}
              </motion.button>
              
              {detectedLocation && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-green-400 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Location detected: {detectedLocation.district}, {detectedLocation.constituency}
                </motion.p>
              )}
            </div>

            <div className="text-center mb-6 text-gray-400">
              <span>OR</span>
            </div>

            {/* Manual Selection */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* District Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Select District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all"
                >
                  <option value="" className="bg-gray-900">Choose District</option>
                  {Object.keys(karnatakaData).map((district) => (
                    <option key={district} value={district} className="bg-gray-900">
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Constituency Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Select Constituency
                </label>
                <select
                  value={selectedConstituency}
                  onChange={(e) => handleConstituencyChange(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-gray-900">Choose Constituency</option>
                  {selectedDistrict && Object.keys(karnatakaData[selectedDistrict].constituencies).map((constituency) => (
                    <option key={constituency} value={constituency} className="bg-gray-900">
                      {constituency}
                    </option>
                  ))}
                </select>
              </div>

              {/* Booth Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Select Booth
                </label>
                <select
                  value={boothNumber}
                  onChange={(e) => handleBoothSelection(e.target.value)}
                  disabled={availableBooths.length === 0}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:border-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-gray-900">Choose Booth</option>
                  {availableBooths.map((booth) => (
                    <option key={booth} value={booth} className="bg-gray-900">
                      Booth {booth}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manual Booth Number Entry */}
            <div className="border-t border-white/10 pt-6">
              <p className="text-sm text-gray-400 mb-3 text-center">
                Or enter booth number directly:
              </p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Enter Booth Number (e.g., 101)"
                    value={boothNumber}
                    onChange={(e) => setBoothNumber(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-all"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Searching...' : 'Search'}
                </motion.button>
              </div>
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Booth Information */}
        <AnimatePresence mode="wait">
          {boothData && (
            <motion.div
              {...fadeInUp}
              className="mb-8 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Constituency</p>
                    <p className="font-semibold">{boothData.constituency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">District</p>
                    <p className="font-semibold">{boothData.district}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Voters</p>
                    <p className="font-semibold">{boothData.totalVoters}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-semibold text-sm">{boothData.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candidates Grid */}
        <AnimatePresence>
          {candidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                Participating Candidates ({candidates.length})
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    onClick={() => setSelectedCandidate(candidate)}
                    className="p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 cursor-pointer hover:border-yellow-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{candidate.symbol}</div>
                      <div className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
                        {candidate.partyShort}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">{candidate.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{candidate.party}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Age: {candidate.age}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">{candidate.experience}</span>
                      </div>
                    </div>
                    
                    <motion.div
                      className="mt-4 flex items-center text-yellow-400 font-semibold text-sm"
                      whileHover={{ x: 5 }}
                    >
                      View Full Profile
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Candidate Detail Modal */}
        <AnimatePresence>
          {selectedCandidate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCandidate(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 to-red-950 rounded-3xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-6">
                      <div className="text-6xl">{selectedCandidate.symbol}</div>
                      <div>
                        <h2 className="text-4xl font-bold mb-2">{selectedCandidate.name}</h2>
                        <p className="text-xl text-gray-300">{selectedCandidate.party}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCandidate(null)}
                      className="text-gray-400 hover:text-white text-2xl"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Age</p>
                      <p className="text-xl font-semibold">{selectedCandidate.age} years</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Education</p>
                      <p className="text-xl font-semibold">{selectedCandidate.education}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl">
                      <p className="text-sm text-gray-400 mb-1">Experience</p>
                      <p className="text-xl font-semibold">{selectedCandidate.experience}</p>
                    </div>
                  </div>

                  {/* History Timeline */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                      Political History
                    </h3>
                    <div className="space-y-4">
                      {selectedCandidate.history.map((item, idx) => (
                        <div key={idx} className="p-4 bg-white/5 rounded-xl border-l-4 border-yellow-500">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-lg">{item.position}</span>
                            <span className="text-sm text-gray-400">{item.year}</span>
                          </div>
                          <p className="text-gray-300">{item.achievement}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manifesto */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-yellow-400" />
                      Manifesto Highlights
                    </h3>
                    <ul className="space-y-2">
                      {selectedCandidate.manifesto.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <span className="text-yellow-400">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Achievements */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Award className="w-6 h-6 text-yellow-400" />
                      Key Achievements
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedCandidate.achievements.map((achievement, idx) => (
                        <div key={idx} className="p-4 bg-gradient-to-br from-yellow-500/10 to-red-500/10 rounded-xl border border-yellow-500/20">
                          <p className="text-gray-200">{achievement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Booths;