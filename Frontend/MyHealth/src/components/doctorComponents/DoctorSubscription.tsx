import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import { handlePayment, getSubscriptions } from "../../api/doctor/doctorApi";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

type Plan = {
  id: string;
  name?: string;
  active: boolean;
  description?: string;
  default_price?: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring?: {
      interval: string;
    };
  };
};

const DoctorSubscriptionPlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const doctor = useSelector((state: RootState) => state.doctor.doctor);
  const isPremium = doctor?.premiumMembership;

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await getSubscriptions();
      if (response.data.length) {
        console.log(
          "ksjfdsk jsoifjsdiofjjsjfoi lskfj----------------",
          response.data
        );
        let existingPlans = response.data.filter((plan: Plan) => plan.active);
        setPlans(existingPlans);
        setLoading(false);
      }
    } catch (error) {
      toast.error("Failed to fetch subscription plans");
      setLoading(false);
    }
  };

  const handleCheckout = async (priceId: string) => {
    if (isPremium) {
      toast.info("You are already a premium member");
      return;
    }

    if (!doctor || !doctor._id) {
      toast.info("Subscription failed");
      return;
    }
    try {
      const data = await handlePayment(priceId, {
        doctorId: doctor?._id,
        type: "subscription",
        role: "doctor",
      });
      const stripe = await stripePromise;
      if (stripe && data.url) {
        console.log("stripe is opening......");
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
          Subscription Plans
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-600 text-sm sm:text-base">
              Loading plans...
            </span>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-sm sm:text-base">
              No plans available
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan, idx) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 sm:p-6 border ${
                  idx === 1 ? "border-purple-300" : "border-gray-100"
                }`}
              >
                {idx === 1 && (
                  <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 rounded-full shadow-sm">
                    POPULAR
                  </span>
                )}
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-4 truncate">
                    {plan.name || "Unnamed Plan"}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                    {plan.default_price
                      ? `${(plan.default_price.unit_amount / 100).toFixed(
                          2
                        )} ${plan.default_price.currency.toUpperCase()}`
                      : "N/A"}
                    <span className="text-xs sm:text-sm font-normal text-gray-600">
                      {plan.default_price?.recurring?.interval
                        ? ` / ${plan.default_price.recurring.interval}`
                        : " / one-time"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {plan.description || "No description available"}
                  </p>
                </div>
                <ul className="mt-4 space-y-2 text-sm sm:text-base text-gray-700">
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                    <span>Online consultations with secure video calls</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                    <span>Report analysis service</span>
                  </li>
                  <li className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                    <span>Advertisement service</span>
                  </li>
                </ul>
                <button
                  onClick={() => handleCheckout(plan.default_price?.id || "")}
                  className={`mt-4 sm:mt-6 w-full px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all duration-200 min-h-[44px] ${
                    isPremium || !plan.default_price
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg"
                  }`}
                  disabled={isPremium || !plan.default_price}
                >
                  {isPremium ? "Already Subscribed" : "Buy Now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSubscriptionPlans;
