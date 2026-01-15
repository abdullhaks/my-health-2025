import { Heart, ArrowLeft, Share2 } from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { blogResponse } from "../../interfaces/blog";
import { getBlog } from "../../api/doctor/doctorApi";
import { message } from "antd";


const DoctorBlogDetails = () => {
  const navigate = useNavigate();
  const { blogId } = useParams<{ blogId: string }>();
  const [blog, setBlog] = useState<blogResponse | null>(null);


  useEffect(() => {
    const fetchArticle = async () => {
      if (!blogId) {
        message.error("Article ID is missing");
        return;
      }

      try {
        const response = await getBlog(blogId);
        console.log("Article from frontend:", response);
        setBlog(response);
      } catch (error: any) {
        message.error(error.message || "Failed to fetch article");
      }
    };

    fetchArticle();
  }, [blogId]);


  
    const handleShare = () => {
    if (navigator.share) {

      let link = window.location.href;
      if(link.includes("doctor")){
        link = link.replace("doctor", "user");
      };

      navigator.share({ title: blog?.title, url: link});
    } else {
      message.success("Share link copied!");
    }
  };

  // Split content into paragraphs and insert images strategically
  const contentParagraphs = blog?.content
    .split("\n\n")
    .filter((p: string) => p.trim());
  const images = [blog?.img1, blog?.img2, blog?.img3].filter((img) => img);

  const renderContentWithImages = () => {
    const elements: JSX.Element[] = [];

     if(!contentParagraphs){
      return elements;
    }

    contentParagraphs.forEach((paragraph: string, index: number) => {
      elements.push(
        <p
          key={`p-${index}`}
          className="text-gray-700 text-base sm:text-lg leading-7 sm:leading-8 mb-6 font-serif"
        >
          {paragraph}
        </p>
      );

      if (images.length > 0) {
        const shouldInsertImage =
          (index === Math.floor(contentParagraphs.length * 0.3) && images[0]) ||
          (index === Math.floor(contentParagraphs.length * 0.6) && images[1]) ||
          (index === Math.floor(contentParagraphs.length * 0.8) && images[2]);

        if (shouldInsertImage) {
          const imageIndex =
            index === Math.floor(contentParagraphs.length * 0.3)
              ? 0
              : index === Math.floor(contentParagraphs.length * 0.6)
              ? 1
              : 2;

          if (images[imageIndex]) {
            elements.push(
              <figure key={`img-${imageIndex}`} className="my-6 sm:my-8">
                <img
                  src={images[imageIndex]}
                  alt={`Blog illustration ${imageIndex + 1}`}
                  className="w-full h-auto max-h-[400px] object-cover rounded-lg shadow-md"
                />
              </figure>
            );
          }
        }
      }
    });

    return elements;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              className="p-2 sm:p-3 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* <button
                className="p-2 sm:p-3 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label="Bookmark"
              >
                <Bookmark size={20} className="sm:w-6 sm:h-6" />
              </button> */}
               <button className="p-2 cursor-pointer shadow-sm shadow-green-600  text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
                <Share2 size={20} onClick={handleShare}/>
              </button>
            </div>
          </div>
        </div>
      </nav>


     {blog === null ? (
        <div className="text-center text-gray-500 py-20">Loading blog...</div>
      ) : blog === undefined ? (
        <div className="text-center text-red-500 py-20">Blog not found.</div>
      ) : ( 

              <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Title Section */}
        <header className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 font-serif tracking-tight">
            {blog.title}
          </h1>

          {/* Author and Meta Information */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-gray-200">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg sm:text-xl shadow-md">
              {blog.author.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-3">
                <span className="font-medium text-gray-900 text-base sm:text-lg">
                  Dr. {blog.author}
                </span>
                <span className="text-emerald-600 text-sm font-medium cursor-pointer hover:text-emerald-700">
                  • Follow
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                <span>
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>8 min read</span>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Heart className="text-red-500" size={14} />
                  {/* <span>{blog.likes}</span> */}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        <figure className="mb-8 sm:mb-12">
          <img
            src={blog.thumbnail}
            alt={blog.title}
            className="w-full h-auto max-h-[500px] object-cover rounded-xl shadow-lg"
          />
        </figure>

        {/* Article Content */}
        <div className="prose prose-sm sm:prose-base max-w-none">
          <div className="first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-gray-900 first-letter:float-left first-letter:mr-2 sm:first-letter:mr-3 first-letter:mt-0.5">
            {renderContentWithImages()}
          </div>
        </div>

        {/* Tags Section */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
            {blog.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-105 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Engagement Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-6 border-t border-b border-gray-200 gap-4 sm:gap-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors duration-200 group">
                <Heart
                  size={20}
                  className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform"
                />
                {/* <span className="font-medium text-sm sm:text-base">
                  {blog.likes}
                </span> */}
              </button>

               <button className="text-gray-600 hover:text-blue-500 p-2 rounded-full transition-colors duration-200 cursor-pointer shadow-sm shadow-green-600">
                <Share2 size={18} onClick={handleShare}/>
              </button>
            </div>

            {/* <button className="text-gray-600 hover:text-emerald-500 transition-colors duration-200">
              <Bookmark size={20} className="sm:w-6 sm:h-6" />
            </button> */}
          </div>
        </div>

        {/* Author Bio Section */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-md">
              {blog.author.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Dr. {blog.author}
              </h3>
            
            </div>
          </div>
        </div>

      </article>

      )

    }

      {/* Article Container */}

    </div>
  );
};

export default DoctorBlogDetails;
