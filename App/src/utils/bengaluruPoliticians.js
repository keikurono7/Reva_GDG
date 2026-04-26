// Bengaluru Lok Sabha Constituencies and MLAs
export const bengaluruPoliticians = {
  constituencies: [
    {
      id: "bangalore-central",
      name: "Bangalore Central",
      mp: {
        name: "P. C. Mohan",
        party: "BJP"
      },
      mlAs: [
        { name: "K. J. George", assembly: "Sarvagnanagar" },
        { name: "S. Raghu", assembly: "C.V. Raman Nagar (SC)" },
        { name: "Rizwan Arshad", assembly: "Shivajinagar" },
        { name: "N. A. Haris", assembly: "Shanti Nagar" },
        { name: "Dinesh Gundu Rao", assembly: "Gandhi Nagar" },
        { name: "S. Suresh Kumar", assembly: "Rajaji Nagar" },
        { name: "Zameer Ahmed Khan", assembly: "Chamrajpet" },
        { name: "Manjula Aravind Limbavali", assembly: "Mahadevapura (SC)" }
      ]
    },
    {
      id: "bangalore-south",
      name: "Bangalore South",
      mp: {
        name: "Tejasvi Surya",
        party: "BJP"
      },
      mlAs: [
        { name: "Priyakrishna", assembly: "Govindraj Nagar" },
        { name: "M. Krishnappa", assembly: "Vijay Nagar" },
        { name: "Uday Garudachar", assembly: "Chickpet" },
        { name: "Ravi Subramanya", assembly: "Basavanagudi" },
        { name: "R. Ashoka", assembly: "Padmanabhanagar" },
        { name: "Ramalinga Reddy", assembly: "BTM Layout" },
        { name: "C. K. Ramamurthy", assembly: "Jayanagar" },
        { name: "Satish Reddy", assembly: "Bommanahalli" }
      ]
    },
    {
      id: "bangalore-north",
      name: "Bangalore North",
      mp: {
        name: "Shobha Karandlaje",
        party: "BJP"
      },
      mlAs: [
        { name: "Krishna Byre Gowda", assembly: "Byatarayanapura" },
        { name: "S. R. Vishwanath", assembly: "Yelahanka" },
        { name: "Byrathi Suresh", assembly: "Hebbal" },
        { name: "Akhanda Srinivasa Murthy", assembly: "Pulakeshinagar (SC)" },
        { name: "B. A. Basavaraj", assembly: "K.R. Puram" },
        { name: "S. Muniraju", assembly: "Dasarahalli" },
        { name: "K. Gopalaiah", assembly: "Mahalakshmi Layout" },
        { name: "C. N. Ashwath Narayan", assembly: "Malleshwaram" }
      ]
    },
    {
      id: "bangalore-rural",
      name: "Bangalore Rural",
      mp: {
        name: "C. N. Manjunath",
        party: "BJP"
      },
      mlAs: [
        { name: "Munirathna", assembly: "Rajarajeshwarinagar" },
        { name: "M. Krishnappa", assembly: "Bangalore South (Assembly)" },
        { name: "B. Shivanna", assembly: "Anekal (SC)" }
      ]
    }
  ]
};

// Helper function to get MLA names for a constituency
export const getMLAsByConstituency = (constituencyId) => {
  const constituency = bengaluruPoliticians.constituencies.find(
    c => c.id === constituencyId
  );
  return constituency ? constituency.mlAs : [];
};

// Helper function to get all MLA names
export const getAllMLAs = () => {
  return bengaluruPoliticians.constituencies.flatMap(c => c.mlAs);
};

// Helper function to get all MPs
export const getAllMPs = () => {
  return bengaluruPoliticians.constituencies.map(c => ({
    name: c.mp.name,
    party: c.mp.party,
    constituency: c.name
  }));
};
