"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";
import { useState } from "react";
import { AxiosError } from "axios"; // Import AxiosError type

// Define the shape of the form inputs
type Inputs = {
  name: string;
  email: string;
  password: string;
};

// Define the shape of the error response from your API
interface ApiErrorResponse {
  message: string;
  error?: string; // Optional field if your API sends an 'error' field
}

const RegisterPage = () => {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const { register: authRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    try {
      console.log("Submitting email:", data.email); // ADD THIS LINE TEMPORARILY
      await authRegister(data);
      toast.success("Registration successful! Please login.");
      // The register function in AuthContext handles redirection to /login
    } catch (error) { // Removed ': any'. 'error' is now 'unknown' or 'any' (implicitly)
      // Type-safe handling for Axios errors
      if (error instanceof AxiosError && error.response) {
        const apiError = error.response.data as ApiErrorResponse; // Cast to your API error response type
        toast.error(apiError.message || "An error occurred during registration.");
      } else if (error instanceof Error) {
        toast.error(error.message); // For standard JavaScript errors
      } else {
        toast.error("An unexpected error occurred during registration."); // Fallback for unknown error types
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create an Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              type="text"
              {...formRegister("name", { required: "Name is required" })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...formRegister("email", { required: "Email is required" })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...formRegister("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;