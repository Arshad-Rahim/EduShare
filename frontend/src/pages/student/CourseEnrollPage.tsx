"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "./components/Header";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Lock,
  BookOpen,
} from "lucide-react";
import { courseService } from "@/services/courseService";
import { paymentService } from "@/services/enrollmentService/paymentService";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Define Course type
interface Course {
  _id: string;
  title: string;
  tagline: string;
  price: number;
  difficulty: string;
  category: string;
  thumbnail?: string;
}

// Define Razorpay options type
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal: {
    confirm_close: boolean;
    ondismiss: (reason?: any) => void;
  };
  retry: { enabled: boolean };
  timeout: number;
  theme: { color: string };
}

// Extend window to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script
const loadScript = (src: string) =>
  new Promise<boolean>((resolve) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      console.log("Razorpay script already loaded");
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      resolve(false);
    };
    document.body.appendChild(script);
  });

interface RenderRazorpayProps {
  orderId: string;
  keyId: string;
  currency: string;
  amount: number;
  courseId: string;
  setScriptLoading: (loading: boolean) => void;
}

const RenderRazorpay = ({
  orderId,
  keyId,
  currency,
  amount,
  courseId,
  setScriptLoading,
}: RenderRazorpayProps) => {
  const navigate = useNavigate();
  const razorpayInstance = useRef<any>(null);
  const hasOpened = useRef(false);

  const displayRazorpay = useCallback(async () => {
    if (hasOpened.current) {
      console.log("Razorpay modal already opened or attempted");
      return;
    }
    hasOpened.current = true;

    console.log("Initiating Razorpay modal display", {
      orderId,
      keyId,
      amount,
      currency,
    });

    setScriptLoading(true);
    try {
      const res = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!res) {
        console.error("Razorpay SDK failed to load");
        toast.error(
          "Failed to load Razorpay SDK. Please check your connection."
        );
        hasOpened.current = false;
        setScriptLoading(false);
        return;
      }

      if (!window.Razorpay) {
        console.error("Razorpay SDK not available on window object");
        toast.error("Razorpay SDK not available. Please try again.");
        hasOpened.current = false;
        setScriptLoading(false);
        return;
      }

      const options: RazorpayOptions = {
        key: keyId,
        amount,
        currency,
        name: "Your Organization Name",
        order_id: orderId,
        handler: async (response) => {
          console.log("Razorpay payment success", response);
          try {
            await paymentService.payment(orderId, response);
            await paymentService.enroll(courseId, orderId, amount / 100);
            toast.success("Payment and enrollment successful!");
            if (razorpayInstance.current) {
              razorpayInstance.current.close();
              razorpayInstance.current = null;
            }
            navigate(`/courses/${courseId}`);
          } catch (error: any) {
            console.error("Payment or enrollment failed:", error);
            toast.error(
              `Payment succeeded, but enrollment failed: ${
                error.response?.data?.error || "Contact support"
              }`
            );
            if (razorpayInstance.current) {
              razorpayInstance.current.close();
              razorpayInstance.current = null;
            }
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: async (reason) => {
            console.log("Razorpay modal dismissed", reason);
            const {
              reason: paymentReason,
              field,
              step,
              code,
            } = reason && reason.error ? reason.error : {};
            const status =
              reason === undefined
                ? "cancelled"
                : reason === "timeout"
                ? "timedout"
                : "failed";
            try {
              await authAxiosInstance.post("/payment", {
                status,
                orderDetails: { orderId, paymentReason, field, step, code },
              });
              toast.info(`Payment ${status}.`);
            } catch (error) {
              console.error("Failed to update payment status:", error);
            } finally {
              if (razorpayInstance.current) {
                razorpayInstance.current = null;
              }
              hasOpened.current = false;
            }
          },
        },
        retry: { enabled: false },
        timeout: 300,
        theme: { color: "#3399cc" },
      };

      console.log("Creating Razorpay instance with options", options);
      const rzp = new window.Razorpay(options);
      razorpayInstance.current = rzp;

      rzp.on("payment.error", (error: any) => {
        console.error("Razorpay payment error", error);
        toast.error(
          `Payment failed: ${error.error.description || "Unknown error"}`
        );
      });

      try {
        console.log("Opening Razorpay modal");
        rzp.open();
      } catch (error) {
        console.error("Failed to open Razorpay modal", error);
        toast.error("Failed to open payment modal. Please try again.");
        hasOpened.current = false;
        razorpayInstance.current = null;
      }
    } catch (error) {
      console.error("Error in displayRazorpay", error);
      toast.error("An error occurred while initiating payment.");
      hasOpened.current = false;
    } finally {
      setScriptLoading(false);
    }
  }, [orderId, keyId, currency, amount, courseId, navigate, setScriptLoading]);

  useEffect(() => {
    console.log("RenderRazorpay useEffect triggered");
    displayRazorpay();

    return () => {
      console.log("RenderRazorpay cleanup");
      if (razorpayInstance.current) {
        razorpayInstance.current.close();
        razorpayInstance.current = null;
      }
      // Remove script only if it exists
      const script = document.querySelector(
        `script[src="https://checkout.razorpay.com/v1/checkout.js"]`
      );
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [displayRazorpay]);

  return null;
};

interface RenderStripeProps {
  courseId: string;
  amount: number;
  setScriptLoading: (loading: boolean) => void;
}

const RenderStripe = ({
  courseId,
  amount,
  setScriptLoading,
}: RenderStripeProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleStripePayment = useCallback(async () => {
    if (!stripe || !elements) {
      toast.error("Stripe not initialized");
      return;
    }

    setScriptLoading(true);

    try {
      const response = await authAxiosInstance.post(
        "/payment/stripe/create-payment-intent",
        {
          amount: amount * 100,
          currency: "usd",
          courseId,
        }
      );

      const { clientSecret } = response.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        setError(result.error.message!);
        toast.error(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        try {
          await paymentService.enroll(
            courseId,
            result.paymentIntent.id,
            amount,
            true
          );
          toast.success("Payment and enrollment successful!");
          navigate(`/courses/${courseId}`);
        } catch (error: any) {
          console.error("Stripe enrollment failed:", error);
          toast.error(
            `Payment succeeded, but enrollment failed: ${
              error.response?.data?.error || "Contact support"
            }`
          );
        }
      }
    } catch (error: any) {
      console.error("Stripe payment failed:", error);
      toast.error(
        `Failed to process payment: ${
          error.response?.data?.error || "Please try again"
        }`
      );
    } finally {
      setScriptLoading(false);
    }
  }, [stripe, elements, courseId, amount, navigate, setScriptLoading]);

  return (
    <div className="mt-4">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": { color: "#aab7c4" },
            },
            invalid: { color: "#9e2146" },
          },
        }}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <Button
        className="mt-4 w-full bg-primary hover:bg-primary/90"
        onClick={handleStripePayment}
        disabled={!stripe || !elements}
      >
        Pay with Stripe
      </Button>
    </div>
  );
};

export function CourseEnrollPage() {
  const params = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [displayStripe, setDisplayStripe] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "razorpay" | "stripe" | null
  >(null);
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string | null;
    currency: string | null;
    amount: number | null;
  }>({
    orderId: null,
    currency: null,
    amount: null,
  });
  const currentUser = useSelector((state: any) => state.user.userDatas);

  // Memoized courseId
  const courseId = useMemo(() => params.courseId, [params.courseId]);

  // Check if user is authenticated
  const isAuthenticated = useMemo(() => !!currentUser, [currentUser]);

  // Fetch course and purchase status
  const fetchCourseDetails = useCallback(async () => {
    if (!courseId) {
      toast.error("Invalid course ID");
      navigate("/courses");
      return;
    }

    try {
      const foundCourse = await courseService.getCourseDetails(courseId);
      if (foundCourse) {
        setCourse(foundCourse);
      } else {
        toast.error("Course not found");
        navigate("/courses");
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error);
      toast.error("Failed to load course details");
      navigate("/courses");
    }
  }, [courseId, navigate]);

  const checkPurchaseStatus = useCallback(async () => {
    if (!courseId) {
      toast.error("Invalid course ID");
      navigate("/courses");
      return;
    }

    if (isAuthenticated) {
      try {
        const purchaseStatus = await courseService.checkCoursePurchase(
          courseId
        );
        setIsPurchased(purchaseStatus || false);
      } catch (error) {
        console.error("Failed to check purchase status:", error);
        setIsPurchased(false);
      }
    } else {
      setIsPurchased(false);
    }
  }, [courseId, navigate, isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCourseDetails(), checkPurchaseStatus()]);
      } catch (error) {
        console.error("Error fetching enrollment data:", error);
        toast.error("Failed to load enrollment page");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchCourseDetails, checkPurchaseStatus]);

  // Event handlers
  const handleCreateOrder = useCallback(
    async (amount: number, currency: string) => {
      setPaymentProcessing(true);
      try {
        const response = await authAxiosInstance.post("/payment/order", {
          amount: amount * 100,
          currency,
          courseId,
        });

        if (response.data && response.data.id) {
          setOrderDetails({
            orderId: response.data.id,
            currency: response.data.currency,
            amount: response.data.amount,
          });
          setDisplayRazorpay(true);
        } else {
          throw new Error("Order creation failed");
        }
      } catch (error) {
        console.error("Failed to create order:", error);
        toast.error("Failed to initiate payment. Please try again.");
      } finally {
        setPaymentProcessing(false);
      }
    },
    [courseId]
  );

  const handleEnroll = useCallback(() => {
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (course) {
      if (paymentMethod === "razorpay") {
        handleCreateOrder(course.price, "INR");
      } else if (paymentMethod === "stripe") {
        setDisplayStripe(true);
      }
    }
  }, [paymentMethod, course, handleCreateOrder]);

  const handleBackToCourse = useCallback(() => {
    navigate(`/courses/${courseId}`);
  }, [courseId, navigate]);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-emerald-100 text-emerald-800";
      case "Intermediate":
        return "bg-amber-100 text-amber-800";
      case "Advanced":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  }, []);

  // Memoized payment details rendering
  const paymentDetails = useMemo(
    () =>
      course && (
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800">
            Payment Details
          </h3>
          <div className="mt-4 p-4 bg-slate-50 rounded-lg w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-slate-600">Course Price</span>
              <span className="font-medium text-sm sm:text-base">
                ₹{course.price}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-2">
              <span className="text-slate-600">Tax</span>
              <span className="font-medium text-sm sm:text-base">₹0.00</span>
            </div>
            <Separator className="my-2" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-slate-800 font-semibold">Total</span>
              <span className="text-primary font-semibold text-sm sm:text-base">
                ₹{course.price}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Secure payment processing
          </p>
        </div>
      ),
    [course]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8">
        <section className="w-full py-12">
          <div className="container mx-auto w-full">
            <Card className="border-0 shadow-md w-full rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">
                    Enroll in {course.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="border-gray-300 hover:bg-white hover:border-blue-600 transition-all duration-200 shadow-sm w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                </div>
                <CardDescription className="text-gray-600 mt-2 text-sm sm:text-base">
                  {course.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 w-full p-6 lg:p-8">
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="aspect-square w-full sm:w-24 h-24 overflow-hidden rounded-lg bg-slate-100 flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">
                        Category: {course.category}
                      </p>
                      <div className="flex items-center gap-2 text-gray-700 mt-1">
                        <span className="font-medium text-blue-600 text-sm sm:text-base">
                          ₹{course.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {isPurchased ? (
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-lg font-semibold text-gray-800 mb-2">
                        You're Already Enrolled!
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        You have access to {course.title}. Continue your
                        learning journey.
                      </p>
                      <Button
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-lg transition-all duration-200 text-sm font-semibold"
                        onClick={handleBackToCourse}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go to Course
                      </Button>
                    </div>
                  ) : (
                    <>
                      {paymentDetails}

                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                          Select Payment Method
                        </h3>
                        <div className="mt-4 flex flex-col gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="razorpay"
                              checked={paymentMethod === "razorpay"}
                              onChange={() => setPaymentMethod("razorpay")}
                              className="h-4 w-4"
                            />
                            <span className="text-sm text-gray-600">
                              Pay with Razorpay
                            </span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="stripe"
                              checked={paymentMethod === "stripe"}
                              onChange={() => setPaymentMethod("stripe")}
                              className="h-4 w-4"
                            />
                            <span className="text-sm text-gray-600">
                              Pay with Stripe
                            </span>
                          </label>
                        </div>
                      </div>

                      {displayStripe && (
                        <Elements stripe={stripePromise}>
                          <RenderStripe
                            courseId={courseId!}
                            amount={course.price}
                            setScriptLoading={setScriptLoading}
                          />
                        </Elements>
                      )}

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-6 rounded-lg shadow-md text-sm font-semibold"
                        onClick={handleEnroll}
                        disabled={paymentProcessing || scriptLoading}
                      >
                        {paymentProcessing || scriptLoading ? (
                          "Processing..."
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Pay and Enroll
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {displayRazorpay && orderDetails.orderId && (
        <RenderRazorpay
          amount={orderDetails.amount!}
          currency={orderDetails.currency!}
          orderId={orderDetails.orderId}
          keyId={import.meta.env.VITE_RAZORPAY_KEY_ID}
          courseId={courseId!}
          setScriptLoading={setScriptLoading}
        />
      )}
    </div>
  );
}

export default React.memo(CourseEnrollPage);
