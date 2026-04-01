import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "@/context/ToastContext";
import GoogleLoginButton from "./GoogleLoginButton";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, errors } = useAuth();
  const { toast } = useToast();

  const navigate = useNavigate();
  const isElectron = navigator.userAgent.toLowerCase().includes("electron");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);

    if (res?.status === "login_failed") {
      toast(
        "error",
        "Login Failed",
        res.message || "Incorrect email or password",
      );
      return;
    }

    if (res?.status === "success") {
      toast("success", "Login Success", "Welcome back!");

      if (isElectron && res.user.role_name !== "cashier") {
        toast(
          "error",
          "Access Denied",
          "Desktop version is for Cashiers only.",
        );
        return;
      }

      setTimeout(() => {
        if (res.user.role_name === "admin") {
          window.location.href = "/dashboard";
        } else if (res.user.role_name === "cashier") {
          window.location.href = "/cashier";
        } else if (res.user.role_name === "employe") {
          window.location.href = "/dashboard-employe";
        } else {
          navigate("/");
        }
      }, 800);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-neutral-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5">
              <GoogleLoginButton text="Sign in with Google" />
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-neutral-400 bg-white dark:bg-neutral-900 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="info@gmail.com"
                    name="email"
                    error={errors?.errorField?.email}
                  />
                  {errors?.errorField?.email && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors?.errorField?.email}
                    </p>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      error={errors?.errorField?.password}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-neutral-500 dark:fill-neutral-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-neutral-500 dark:fill-neutral-400 size-5" />
                      )}
                    </span>
                  </div>
                  {errors?.errorField?.password && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors?.errorField?.password}
                    </p>
                  )}
                </div>
                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Sign in...." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>

            {!isElectron && (
              <div className="mt-5">
                <p className="text-sm font-normal text-center text-neutral-700 dark:text-neutral-400 sm:text-start">
                  Don&apos;t have an account? {""}
                  <Link
                    to="/auth/sign-up"
                    className="text-red-500 hover:text-red-600 dark:text-red-400"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
