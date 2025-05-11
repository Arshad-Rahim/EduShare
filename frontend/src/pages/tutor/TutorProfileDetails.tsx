"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Header } from "./components/Header";
import { SideBar } from "./components/SideBar";
import { FileIcon, UploadIcon, XIcon } from "lucide-react";
import { tutorService } from "@/services/tutorService/tutorService";
import { ClipLoader } from "react-spinners";

export function TutorProfileDetails() {
  const [email, setEmail] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("John");
  const [phone, setPhone] = useState("+91 (555) 000-0000");
  const [specialization, setSpecialization] = useState("MERN");
  const [existingDocUrl, setExistingDocUrl] = useState<string | null>(null);
  const [bio, setBio] = useState(
    "I'm a dedicated MERN stack developer with a passion for building dynamic and scalable web applications."
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }
      if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Only PDF, JPG, and PNG files are allowed");
        return;
      }
      setSelectedFile(file);
      setExistingDocUrl(null);
      toast.success("File selected successfully");
    }
  };

  async function fetchUser() {
    try {
      const response = await tutorService.tutorDetails();
      setName(response.data.tutor.name);
      setPhone(response.data.tutor.phone);
      setSpecialization(response.data.tutor.specialization);
      setBio(response.data.tutor.bio);
      setEmail(response.data.tutor.email);
      if (response.data.tutor.verificationDocUrl) {
        setExistingDocUrl(response.data.tutor.verificationDocUrl);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSave = async () => {
    // Trim the input values to remove leading/trailing spaces
    const trimmedName = name?.trim() || "";
    const trimmedPhone = phone?.trim() || "";
    const trimmedBio = bio?.trim() || "";
    const trimmedSpecialization = specialization?.trim() || "";

    // Validate that fields are not empty after trimming
    if (
      !trimmedName ||
      !trimmedPhone ||
      !trimmedSpecialization ||
      !trimmedBio
    ) {
      toast.error("Please fill out all required fields with valid data");
      return;
    }

    // Validate phone number: strip formatting characters and ensure exactly 10 digits with no other characters
    const cleanedPhone = trimmedPhone.replace(/[\s\-\(\)\+]/g, ""); // Remove spaces, dashes, parentheses, and +
    const isDigitsOnly = /^\d+$/.test(cleanedPhone); // Check if the cleaned string contains only digits
    if (!isDigitsOnly) {
      toast.error("Phone number must contain only digits");
      return;
    }
    if (cleanedPhone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append("phone", trimmedPhone);
    formData.append("specialization", trimmedSpecialization);
    formData.append("bio", trimmedBio);
    if (selectedFile) {
      formData.append("file", selectedFile);
    }

    setIsLoading(true);
    try {
      const response = await tutorService.profileUpdate(formData);
      console.log("Response:", response.data);
      if (response.data.tutor?.verificationDocUrl && selectedFile) {
        setExistingDocUrl(response.data.tutor.verificationDocUrl);
      }
      setSelectedFile(null);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchUser();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to update profile!");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current && isEditing) {
      fileInputRef.current.click();
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setExistingDocUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileIcon className="h-5 w-5 text-red-500" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FileIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileSize = (file: File) => {
    return `${(file.size / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFileNameFromUrl = (url: string) => {
    return url.split("/").pop() || "Verification Document";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-col md:flex-row gap-6 p-6">
        <div className="w-full md:w-64 flex-shrink-0">
          <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        <div
          className={`flex-1 max-w-4xl w-full ${sidebarOpen ? "md:ml-64" : ""}`}
        >
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Manage your personal information
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={isLoading}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing || isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      defaultValue={email}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Your email address cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing || isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tutor Information</CardTitle>
                <CardDescription>
                  Provide details about your tutoring experience and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">
                      Primary Specialization
                    </Label>
                    <Select
                      value={specialization}
                      onValueChange={setSpecialization}
                      disabled={!isEditing || isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MERN">MERN</SelectItem>
                        <SelectItem value="MEAN">MEAN</SelectItem>
                        <SelectItem value="Data-Science">
                          Data-Science
                        </SelectItem>
                        <SelectItem value="Golang">Golang</SelectItem>
                        <SelectItem value="Flutter">Flutter</SelectItem>
                        <SelectItem value="Swift">Swift</SelectItem>
                        <SelectItem value="Python">Python</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Write a brief professional bio..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="min-h-32"
                      disabled={!isEditing || isLoading}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="verificationDoc"
                      className="text-sm font-medium"
                    >
                      Verification Document
                    </Label>

                    <div
                      className={`border-2 border-dashed rounded-lg ${
                        isEditing && !isLoading
                          ? "border-primary/50 hover:border-primary cursor-pointer"
                          : "border-gray-200"
                      } transition-colors`}
                      onClick={triggerFileInput}
                    >
                      <div className="p-6 flex flex-col items-center justify-center gap-2">
                        <Input
                          ref={fileInputRef}
                          id="verificationDoc"
                          type="file"
                          accept=".pdf,.jpg,.png"
                          onChange={handleFileChange}
                          disabled={!isEditing || isLoading}
                          className="hidden"
                        />

                        {selectedFile ? (
                          <div className="w-full">
                            <div className="flex items-center p-3 bg-muted/50 rounded-md">
                              {getFileTypeIcon(selectedFile.name)}
                              <div className="ml-3 flex-1 truncate">
                                <p className="text-sm font-medium">
                                  {selectedFile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getFileSize(selectedFile)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : existingDocUrl ? (
                          <div className="w-full">
                            <div className="flex items-center p-3 bg-muted/50 rounded-md">
                              {getFileTypeIcon(existingDocUrl)}
                              <div className="ml-3 flex-1 truncate">
                                <p className="text-sm font-medium">
                                  {getFileNameFromUrl(existingDocUrl)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Existing Document
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <UploadIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium">
                                {isEditing && !isLoading ? (
                                  <>
                                    <span className="text-primary">
                                      Click to upload
                                    </span>{" "}
                                    or drag and drop
                                  </>
                                ) : (
                                  "No document uploaded"
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, JPG, or PNG (max 5MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {(selectedFile || existingDocUrl) && isEditing && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          disabled={isLoading}
                        >
                          <XIcon className="h-3 w-3 mr-1" />
                          Remove file
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end mt-6">
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <ClipLoader size={20} color="#ffffff" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
