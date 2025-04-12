"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  courseService,
} from "@/services/courseService/courseService";

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

// Load Razorpay script
const loadScript = (src: string) =>
  new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
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
  const paymentId = useRef<string | null>(null);
  const navigate = useNavigate();
  const razorpayInstance = useRef<any>(null); // Ref to store Razorpay instance
  const hasOpened = useRef(false); // Prevent multiple openings

  const displayRazorpay = async () => {
    if (hasOpened.current) return; // Prevent re-opening
    hasOpened.current = true;

    setScriptLoading(true);
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    setScriptLoading(false);

    if (!res) {
      toast.error("Failed to load payment gateway. Are you online?");
      hasOpened.current = false; // Reset to allow retry
      return;
    }

    const options: RazorpayOptions = {
      key: keyId,
      amount,
      currency,
      name: "Your Organization Name",
      order_id: orderId,
      handler: async (response) => {
        paymentId.current = response.razorpay_payment_id;
        try {
          await authAxiosInstance.post("/payment", {
            status: "succeeded",
            orderDetails: {
              orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            },
          });
          await authAxiosInstance.post("/purchase/order", {
            courseId,
            orderId: orderId,
            amount: amount,
            status: "paid",
          });
          toast.success("Payment successful! Enrolling in the course...");
          // Explicitly close the modal after successful payment
          if (razorpayInstance.current) {
            razorpayInstance.current.close();
            razorpayInstance.current = null; // Clear the instance
          }
          navigate(`/courses/${courseId}`);
        } catch (error) {
          console.error("Payment update failed:", error);
          toast.error(
            "Payment succeeded, but enrollment failed. Contact support."
          );
          // Close modal even on error
          if (razorpayInstance.current) {
            razorpayInstance.current.close();
            razorpayInstance.current = null; // Clear the instance
          }
        }
      },
      modal: {
        confirm_close: true,
        ondismiss: async (reason) => {
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
            // Clean up instance on dismiss
            if (razorpayInstance.current) {
              razorpayInstance.current = null;
            }
            hasOpened.current = false; // Reset to allow retry if needed
          }
        },
      },
      retry: { enabled: false },
      timeout: 900,
      theme: { color: "#1E40AF" },
    };

    const rzp1 = new window.Razorpay(options);
    razorpayInstance.current = rzp1;
    rzp1.open();

    // Listen for modal close event to ensure cleanup
    rzp1.on("modal.closed", () => {
      razorpayInstance.current = null;
      hasOpened.current = false; // Reset to allow retry if needed
    });
  };

  useEffect(() => {
    displayRazorpay();

    // Cleanup on unmount
    return () => {
      if (razorpayInstance.current) {
        razorpayInstance.current.close();
        razorpayInstance.current = null;
      }
    };
  }, [orderId, keyId, currency, amount, courseId]);

  return null;
};

export function CourseEnrollPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string | null;
    currency: string | null;
    amount: number | null;
  }>({
    orderId: null,
    currency: null,
    amount: null,
  });

  useEffect(() => {
    fetchCourseDetails();
    checkEnrollmentStatus();
  }, [courseId]);

  const fetchCourseDetails = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await authAxiosInstance.get(
        `/enrollments/check/${courseId}`
      );
      setEnrollmentStatus(response.data.isEnrolled ? "enrolled" : null);
    } catch (error) {
      console.error("Failed to check enrollment status:", error);
    }
  };

  const handleCreateOrder = async (amount: number, currency: string) => {
    setPaymentProcessing(true);
    try {
      const response = await authAxiosInstance.post("/payment/order", {
        amount: amount * 100, // Convert to paise
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
  };

  const handleEnroll = () => {
    if (enrollmentStatus === "enrolled") {
      navigate(`/course/${courseId}/learn`);
      return;
    }
    if (course) {
      handleCreateOrder(course.price, "INR");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
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
  };

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
            <Card className="border-0 shadow-md w-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">
                    Enroll in {course.title}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="border-slate-300 hover:bg-slate-50 w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Button>
                </div>
                <CardDescription className="text-slate-600 mt-2 text-sm sm:text-base">
                  {course.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 w-full">
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
                          <BookOpen className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                      <p className="text-sm text-slate-600 mt-2">
                        Category: {course.category}
                      </p>
                      <div className="flex items-center gap-2 text-slate-600 mt-1">
                        <span className="font-medium text-sm sm:text-base">
                          ₹{course.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {enrollmentStatus === "enrolled" ? (
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                      <p className="text-lg sm:text-xl font-semibold text-slate-800">
                        You are already enrolled!
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        Start learning now or revisit your course content.
                      </p>
                      <Button
                        className="mt-4 bg-primary hover:bg-primary/90 w-full sm:w-auto"
                        onClick={() => navigate(`/course/${courseId}/learn`)}
                      >
                        Go to Course
                      </Button>
                    </div>
                  ) : (
                    <>
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
                            <span className="font-medium text-sm sm:text-base">
                              ₹0.00
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="text-slate-800 font-semibold">
                              Total
                            </span>
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

                      <Button
                        className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 text-sm sm:text-base"
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
