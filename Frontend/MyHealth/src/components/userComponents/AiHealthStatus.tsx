import { useState, useMemo } from "react";
import { FaHeartbeat, FaInfoCircle, FaSpinner, FaUser, FaWeight, FaRuler, FaTint, FaCheckCircle, FaExclamationTriangle, FaVenusMars } from "react-icons/fa";
import { GoogleGenerativeAI } from "@google/generative-ai";

const AiHealthStatusGenerator = () => {
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [sugar, setSugar] = useState<string>("");
  const [pressure, setPressure] = useState<string>("");
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const genAI = useMemo(() => new GoogleGenerativeAI(apiKey), [apiKey]);
  const model = useMemo(() => genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  }), [genAI]);
  const generationConfig = useMemo(() => ({
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  }), []);
  const run = useMemo(() => async (prompt: string) => {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text());
    return result.response.text();
  }, [model, generationConfig]);

  const generateHealthStatus = async () => {
    setError(null);
    setHealthStatus(null);
    setLoading(true);

    if (!height || !weight || !age || !gender) {
      setError("Please fill in height, weight, age, and gender.");
      setLoading(false);
      return;
    }

    const prompt = `Generate a basic health status and provide concise tips and awareness paragraphs for a person with the following details:
    Height: ${height} cm
    Weight: ${weight} kg
    Age: ${age} years
    Gender: ${gender}
    ${sugar ? `Blood Sugar: ${sugar} mg/dL` : ""}
    ${pressure ? `Blood Pressure: ${pressure} (e.g., 120/80 mmHg)` : ""}

    Please provide the output in a conversational, friendly, and informative tone.
    Structure the response clearly with sections like:
    1. Overall Health Summary: (1-2 paragraphs)
    2. Personalized Tips: (bullet points or short paragraphs based on provided data, if applicable)
    3. General Health Awareness: (1-2 paragraphs on common healthy habits)

    Crucial Disclaimer: This information is for general knowledge and informational purposes only, and does not constitute medical advice. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read here.`;

    try {
      const generatedText = await run(prompt);
      setHealthStatus(generatedText);
    } catch (err) {
      console.error("Error generating health status:", err);
      setError(
        `Failed to generate health status: ${
          typeof err === "object" && err !== null && "message" in err
            ? (err as { message?: string }).message
            : "An unknown error occurred."
        } Please check your Gemini API key and quota.`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatHealthResponse = (text: string) => {
    const sections = text.split(/(?=\d+\.\s+[A-Z][^:]*:)|(?=##\s+[A-Z])/m).filter(Boolean);

    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return null;

      if (/^\d+\.\s+[A-Z]/.test(trimmedSection) || /^##\s+[A-Z]/.test(trimmedSection)) {
        const [heading, ...content] = trimmedSection.split(/:\s*/);
        const headingText = heading.replace(/^\d+\.\s+|^##\s+/, '').trim();

        return (
          <div key={index} className="mb-6 sm:mb-8">
            <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 mb-3 sm:mb-4 flex items-center gap-2">
              {headingText.includes('Summary') && <FaHeartbeat className="text-red-500" />}
              {headingText.includes('Tips') && <FaCheckCircle className="text-green-500" />}
              {headingText.includes('Awareness') && <FaInfoCircle className="text-blue-500" />}
              {headingText}
            </h4>
            <div className="space-y-3 sm:space-y-4">
              {content.join(':').split('\n').map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;

                const cleanLine = trimmedLine
                  .replace(/^[•\-*]\s*/, '') // Remove bullet markers
                  .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>') // Handle bold
                  .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>'); // Handle italic

                if (/^[•\-*]\s+/.test(trimmedLine)) {
                  return (
                    <div key={lineIndex} className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border-l-4 border-blue-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p
                        className="text-gray-700 leading-relaxed text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: cleanLine }}
                      />
                    </div>
                  );
                }

                return (
                  <p
                    key={lineIndex}
                    className="text-gray-700 leading-relaxed text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: cleanLine }}
                  />
                );
              }).filter(Boolean)}
            </div>
          </div>
        );
      }

      const cleanText = trimmedSection
        .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
        .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>');
      return (
        <p
          key={index}
          className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base"
          dangerouslySetInnerHTML={{ __html: cleanText }}
        />
      );
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 sm:mb-6">
            <FaHeartbeat className="text-white text-2xl sm:text-3xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            AI Health Status Generator
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get personalized health insights and recommendations based on your vital statistics
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
          {/* Disclaimer Section */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-yellow-200 p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-amber-600 text-xl sm:text-2xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-amber-800 text-sm sm:text-base mb-2">Important Disclaimer</h3>
                <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">
                  This tool provides informational insights based on basic details. It is NOT a substitute
                  for professional medical advice, diagnosis, or treatment. Always consult
                  with a qualified healthcare professional for any health concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Enter Your Health Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {/* Height Input */}
              <div className="group">
                <label htmlFor="height" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  <FaRuler className="inline mr-2 text-blue-500" />
                  Height (cm) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-gray-50 hover:bg-white group-hover:border-gray-300"
                    placeholder="175"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-xs sm:text-sm font-medium">
                    cm
                  </div>
                </div>
              </div>

              {/* Weight Input */}
              <div className="group">
                <label htmlFor="weight" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  <FaWeight className="inline mr-2 text-green-500" />
                  Weight (kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-gray-50 hover:bg-white group-hover:border-gray-300"
                    placeholder="70"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-xs sm:text-sm font-medium">
                    kg
                  </div>
                </div>
              </div>

              {/* Age Input */}
              <div className="group">
                <label htmlFor="age" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-purple-500" />
                  Age (years) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-gray-50 hover:bg-white group-hover:border-gray-300"
                    placeholder="30"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-xs sm:text-sm font-medium">
                    yrs
                  </div>
                </div>
              </div>

              {/* Gender Input */}
              <div className="group">
                <label htmlFor="gender" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  <FaVenusMars className="inline mr-2 text-pink-500" />
                  Gender *
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-gray-50 hover:bg-white group-hover:border-gray-300"
                  required
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Sugar Input */}
              <div className="group">
                <label htmlFor="sugar" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  <FaTint className="inline mr-2 text-red-500" />
                  Blood Sugar (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="sugar"
                    value={sugar}
                    onChange={(e) => setSugar(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-gray-50 hover:bg-white group-hover:border-gray-300"
                    placeholder="90"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-xs sm:text-sm font-medium">
                    mg/dL
                  </div>
                </div>
              </div>

              {/* Blood Pressure Input */}
              <div className="group">
                <label htmlFor="pressure" className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                  <FaHeartbeat className="inline mr-2 text-indigo-500" />
                  Blood Pressure (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="pressure"
                    value={pressure}
                    onChange={(e) => setPressure(e.target.value)}
                    className="w-full px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base bg-gray-50 hover:bg-white group-hover:border-gray-300"
                    placeholder="120/80"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 text-xs sm:text-sm font-medium">
                    mmHg
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateHealthStatus}
              className="w-full sm:w-auto min-w-[200px] mx-auto block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <FaSpinner className="animate-spin text-xl" />
                  Analyzing Your Health...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <FaHeartbeat className="text-xl" />
                  Generate Health Status
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 sm:mt-8 bg-red-50 border-l-4 border-red-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl sm:text-2xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-red-800 text-sm sm:text-base mb-2">Error</h3>
                <p className="text-red-700 text-sm sm:text-base leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Health Status Results */}
        {healthStatus && (
          <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <FaHeartbeat className="text-white text-xl sm:text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                    Your Health Analysis
                  </h3>
                  <p className="text-green-100 text-sm sm:text-base leading-relaxed">
                    Personalized insights and recommendations
                  </p>
                </div>
              </div>
            </div>

            {/* Results Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="prose max-w-none">
                {formatHealthResponse(healthStatus)}
              </div>

              {/* Bottom Disclaimer */}
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl border-l-4 border-gray-400">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="text-gray-500 text-lg sm:text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      <span className="font-bold">Medical Disclaimer:</span> This information is for general knowledge and informational purposes only. 
                      It does not constitute medical advice and is not a substitute for professional medical advice, diagnosis, or treatment. 
                      Always consult with qualified healthcare professionals for any health concerns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiHealthStatusGenerator;