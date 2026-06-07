import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Loader2,
  Save,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import Header from "./components/Header";
import SideBar from "./components/SideBar";
import { tutorService } from "@/services/tutorService/tutorService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TutorProfileFormState = {
  name: string;
  phone: string;
  specialization: string;
  bio: string;
};

function TutorProfileDetails() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<TutorProfileFormState>({
    name: "",
    phone: "",
    specialization: "",
    bio: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingDocUrl, setExistingDocUrl] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchTutorProfile = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await tutorService.tutorDetails();
      const tutor = response?.data?.tutor;

      if (tutor) {
        setFormData({
          name: tutor.name || "",
          phone: tutor.phone || "",
          specialization: tutor.specialization || "",
          bio: tutor.bio || "",
        });

        setExistingDocUrl(tutor.verificationDocUrl || "");
        setApprovalStatus(tutor.approvalStatus || "");
        setRejectionReason(tutor.rejectionReason || "");
      }
    } catch (error) {
      console.error("Failed to load tutor profile:", error);
      toast.error("Failed to load profile details");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTutorProfile();
  }, [fetchTutorProfile]);

  const handleChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const { name, value } = event.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed");
        event.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        event.target.value = "";
        return;
      }

      setSelectedFile(file);
      toast.success("Verification document selected");
    },
    []
  );

  const removeSelectedFile = useCallback(() => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      toast.error("Phone number must be 10 digits");
      return false;
    }

    if (!formData.specialization.trim()) {
      toast.error("Specialization is required");
      return false;
    }

    if (!formData.bio.trim()) {
      toast.error("Bio is required");
      return false;
    }

    if (!selectedFile && !existingDocUrl) {
      toast.error("Please upload your verification document");
      return false;
    }

    return true;
  }, [formData, selectedFile, existingDocUrl]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);

      try {
        const payload = new FormData();

        payload.append("name", formData.name.trim());
        payload.append("phone", formData.phone.trim());
        payload.append("specialization", formData.specialization.trim());
        payload.append("bio", formData.bio.trim());

        if (selectedFile) {
          payload.append("file", selectedFile);
        }

        await tutorService.profileUpdate(payload);

        toast.success(
          "Profile submitted successfully. Please wait for admin approval."
        );

        await fetchTutorProfile();
        navigate("/tutor/home");
      } catch (error) {
        console.error("Failed to update tutor profile:", error);
        toast.error("Failed to update profile");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, selectedFile, validateForm, fetchTutorProfile, navigate]
  );

  const statusBadge = (() => {
    if (approvalStatus === "approved") {
      return (
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          Approved
        </span>
      );
    }

    if (approvalStatus === "rejected") {
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          Rejected
        </span>
      );
    }

    return (
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
        Pending
      </span>
    );
  })();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b bg-white">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                      Complete Tutor Profile
                    </CardTitle>
                    <CardDescription className="mt-1 text-gray-600">
                      Submit your profile details for admin verification.
                    </CardDescription>
                  </div>

                  {statusBadge}
                </div>
              </CardHeader>

              <CardContent className="bg-white p-6">
                {isLoading ? (
                  <div className="flex min-h-[300px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {approvalStatus === "rejected" && rejectionReason && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <p className="font-semibold">Rejection Reason</p>
                        <p className="mt-1">{rejectionReason}</p>
                      </div>
                    )}

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Enter 10 digit phone number"
                          maxLength={10}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder="Example: MERN Stack, UI/UX Design, Data Science"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Write a short bio about your teaching experience and skills"
                        className="min-h-[140px]"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Verification Document</Label>

                      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />

                        {selectedFile ? (
                          <div className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                            <div className="flex min-w-0 items-center gap-3">
                              <FileText className="h-5 w-5 shrink-0 text-blue-600" />
                              <span className="truncate text-sm font-medium text-gray-700">
                                {selectedFile.name}
                              </span>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={removeSelectedFile}
                              disabled={isSubmitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Upload ID proof, certificate, or verification document
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              PDF, JPG, PNG up to 5MB
                            </p>

                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isSubmitting}
                            >
                              Choose File
                            </Button>
                          </div>
                        )}

                        {!selectedFile && existingDocUrl && (
                          <div className="mt-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                            Existing verification document is already uploaded.
                            Upload a new file only if you want to replace it.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/tutor/home")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Submit Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

export default memo(TutorProfileDetails);