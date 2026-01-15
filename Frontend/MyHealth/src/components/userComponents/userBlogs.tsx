import { useEffect, useState, useCallback, memo } from "react";
import { FaEye, FaHeart, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getBlogs } from "../../api/user/userApi";

// Define Blog interface for type safety
interface Blog {
  _id: string;
  title: string;
  content: string;
  thumbnail: string;
  likes: number;
  createdAt: string;
  author: string;
  authorId: string;
}

// Custom debounce hook
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Blog Card Component
const BlogCard = memo(
  ({ blog, onView }: { blog: Blog; onView: (blog: Blog) => void }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <img
        src={blog.thumbnail}
        alt={blog.title}
        className="w-full h-48 object-cover rounded-t-xl cursor-pointer"
        onClick={() => onView(blog)}
        loading="lazy"
      />
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-gray-950 text-sm">Dr {blog.author}</p>
        <p className="text-gray-600 text-sm line-clamp-2">{blog.content}</p>
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span className="flex items-center gap-1">
              <FaHeart className="text-red-400" aria-label="Likes" />
              {blog.likes}
            </span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onView(blog)}
              className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
              aria-label={`View ${blog.title}`}
            >
              <FaEye />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
);

const UserBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const limit = 9;

  // Debounce the search input with 300ms delay
  const debouncedSearch = useDebounce(search, 300);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBlogs(debouncedSearch, page, limit);
      setBlogs(response.blogs || []);
      setTotalPages(response.totalPages || 1);
      setError(null);
    } catch (err) {
      setError("Failed to fetch blogs. Please try again.");
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleViewBlog = useCallback(
    (blog: Blog) => {
      navigate(`/user/blog/${blog._id}`);
    },
    [navigate]
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Blogs</h1>
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search blogs by title..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            aria-label="Search blogs by title"
          />
          {loading && search && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-center py-4" role="alert">
          {error}
        </div>
      )}
      {loading && !search ? (
        <div className="text-center text-gray-500 py-4">Loading...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-4">
          {search ? `No blogs found for "${search}".` : "No blogs found."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} onView={handleViewBlog} />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="text-gray-700" aria-live="polite">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserBlogs;