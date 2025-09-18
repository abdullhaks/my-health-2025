import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaLock, FaUnlock, FaSearch } from "react-icons/fa";
import { getDoctors, manageDoctors } from "../../api/admin/adminApi";
import { Link } from "react-router-dom";
import { Popconfirm } from "antd";

interface Doctor {
  _id: string;
  fullName: string;
  email: string;
  isBlocked: boolean;
  adminVerified: number;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onlyPremium, setOnlyPremium] = useState(false);

  const limit = 5;

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getDoctors(search, page, limit, onlyPremium);
      setDoctors(response.doctors);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (id: string, isBlocked: boolean) => {
    try {
      const response = await manageDoctors(id, isBlocked);
      if (!response) {
        toast.error(`Doctor ${isBlocked ? "unblocked" : "blocked"} failed`);
      }
      setDoctors((prevDoctor) =>
        prevDoctor.map((doctor) =>
          doctor._id === id ? { ...doctor, isBlocked: !isBlocked } : doctor
        )
      );
      toast.success(
        `Doctor ${isBlocked ? "unblocked" : "blocked"} successfully`
      );
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, onlyPremium]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-xl sm:text-2xl font-semibold text-green-700 mb-6">
        Manage Doctors
      </h1>

      {/* Search and Filter */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6"
      >
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base bg-white"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center"
        >
          <FaSearch className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Search
        </button>
        <label className="flex items-center text-sm sm:text-base text-gray-700">
          <input
            type="checkbox"
            checked={onlyPremium}
            onChange={(e) => setOnlyPremium(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          Show only premium doctors
        </label>
      </form>

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-600 text-sm sm:text-base">
          Loading...
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="min-w-[600px] w-full">
            <thead className="bg-green-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold text-gray-700">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold text-gray-700">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-sm sm:text-base font-semibold text-gray-700">
                  Status
                </th>
                <th className="py-3 px-4 text-center text-sm sm:text-base font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-6 text-gray-500 text-sm sm:text-base"
                  >
                    No doctors found.
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm sm:text-base text-gray-700 truncate">
                      Dr. {doctor.fullName}
                    </td>
                    <td className="py-3 px-4 text-sm sm:text-base text-gray-700 truncate">
                      {doctor.email}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/doctor/${doctor._id}`}
                        className={`text-sm sm:text-base font-semibold underline transition-colors ${
                          doctor.adminVerified === 0
                            ? "text-blue-600 hover:text-blue-800"
                            : doctor.adminVerified === 1
                            ? "text-green-600 hover:text-green-800"
                            : "text-red-600 hover:text-red-800"
                        }`}
                      >
                        {doctor.adminVerified === 0
                          ? "Verify"
                          : doctor.adminVerified === 1
                          ? "Verified"
                          : "Rejected"}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Popconfirm
                        title="Manage doctor"
                        description={`Are you sure to ${
                          doctor.isBlocked ? "unblock" : "block"
                        } this doctor?`}
                        onConfirm={() =>
                          handleBlockUnblock(doctor._id, doctor.isBlocked)
                        }
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-white text-sm sm:text-base font-medium transition-colors ${
                            doctor.isBlocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {doctor.isBlocked ? (
                            <span className="flex items-center justify-center">
                              <FaUnlock className="mr-1 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                              Unblock
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <FaLock className="mr-1 w-4 h-4 sm:w-5 sm:h-5" />{" "}
                              Block
                            </span>
                          )}
                        </button>
                      </Popconfirm>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 space-x-3 sm:space-x-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          Prev
        </button>
        <span className="text-sm sm:text-base text-gray-700">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminDoctors;
