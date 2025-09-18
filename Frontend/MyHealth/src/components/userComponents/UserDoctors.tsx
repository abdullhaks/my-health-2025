import { useEffect, useState } from "react";
import { fetchingDoctors } from "../../api/user/userApi";
import { useNavigate } from "react-router-dom";
import { IDoctor } from "../../interfaces/doctor";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 3;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDoctors();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, location, category, sortBy, page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetchingDoctors({
        searchTerm,
        location,
        category,
        sortBy,
        page,
        limit,
      });
      console.log("doctors response is :", res);
      setDoctors(res.doctors);
      setTotalPages(res.totalPages);
      setPage(res.page);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleDoctorClick = (doctor: IDoctor) => {
    navigate(`/user/doctor-details/${doctor._id}`, { state: { doctor } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 text-center sm:text-left">
          Doctors and Centers
        </h2>

        {/* Search and Filter Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Find doctors and take an appointment"
            className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="General Physician">General Physician</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Endocrinologist">Endocrinologist</option>
            <option value="Gastroenterologist">Gastroenterologist</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Nephrologist">Nephrologist</option>
            <option value="Oncologist">Oncologist</option>
            <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
            <option value="Pediatrician">Pediatrician</option>
            <option value="Psychiatrist">Psychiatrist</option>
            <option value="Pulmonologist">Pulmonologist</option>
            <option value="Radiologist">Radiologist</option>
            <option value="Rheumatologist">Rheumatologist</option>
            <option value="Surgeon">Surgeon</option>
            <option value="Urologist">Urologist</option>
            <option value="ENT Specialist">ENT Specialist</option>
            <option value="Ophthalmologist">Ophthalmologist</option>
            <option value="Gynecologist">Gynecologist</option>
            <option value="Dentist">Dentist</option>
            <option value="Physiotherapist">Physiotherapist</option>
            <option value="Dietitian/Nutritionist">
              Dietitian/Nutritionist
            </option>
            <option value="Emergency Medicine">Emergency Medicine</option>
            <option value="Pathologist">Pathologist</option>
            <option value="Family Medicine">Family Medicine</option>
            <option value="Hematologist">Hematologist</option>
            <option value="Plastic Surgeon">Plastic Surgeon</option>
            <option value="Anesthesiologist">Anesthesiologist</option>
            <option value="Sports Medicine">Sports Medicine</option>
            <option value="Other">Other</option>
          </select>
          <select
            className="w-full px-4 py-3 sm:py-4 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sort By</option>
            <option value="experience">Experience</option>
            <option value="alphabet">Name</option>
          </select>
        </div>

        {/* Doctors List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-base sm:text-lg">No doctors found.</p>
            </div>
          ) : (
            doctors.map((doc: IDoctor) => (
              <div
                key={doc._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 cursor-pointer p-4 sm:p-6"
                onClick={() => handleDoctorClick(doc)}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  <img
                    src={
                      doc.profile ||
                      "https://myhealth-app-storage.s3.ap-south-1.amazonaws.com/users/profile-images/avatar.png"
                    }
                    alt="Doctor"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                      Dr. {doc.fullName}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 line-clamp-2">
                      {doc.category} specialist | {doc.experience} years
                      experience
                    </p>
                    <span className="inline-block px-3 py-1 text-xs sm:text-sm rounded-full bg-blue-100 text-blue-700 font-medium">
                      {doc.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 rounded-xl sm:rounded-2xl hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base font-medium text-gray-800 transition-colors min-w-[80px] sm:min-w-[100px]"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Prev
            </button>
            <span className="text-sm sm:text-base font-medium text-gray-800">
              {page} / {totalPages}
            </span>
            <button
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 rounded-xl sm:rounded-2xl hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base font-medium text-gray-800 transition-colors min-w-[80px] sm:min-w-[100px]"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* Nearby Doctors Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Nearby Doctors
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Find doctors near your location (coming soon).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Doctors;
