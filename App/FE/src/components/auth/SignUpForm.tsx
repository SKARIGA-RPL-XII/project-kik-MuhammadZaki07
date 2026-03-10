import { FormEvent, useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Select from "../form/Select";
import { useAuth } from "../../context/AuthContext";
import Alert from "../ui/alert/Alert";
import { useToast } from "@/context/ToastContext";
import GoogleLoginButton from "./GoogleLoginButton";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { register, loading, errors } = useAuth();
  const [gender, setGender] = useState<"LK" | "PR">();
  const { toast } = useToast();

  const [messageError, setMessageError] = useState({
    title: "",
    description: "",
  });

  const options = [
    { value: "PR", label: "Female" },
    { value: "LK", label: "Male" },
  ];
  const handleSelectChange = (value: string) => {
    setGender(value);
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isChecked) {
      return setMessageError({
        title: "Hold on!",
        description:
          "You must agree to the Terms & Conditions before continuing.",
      });
    }

    const formData = new FormData(e.currentTarget);
    formData.set("gender", gender);

    const res = await register(formData);

    if (res?.status !== "success") {
      toast("error", "Register Failed", res?.message || "Something went wrong");
      return;
    }

    toast("success", "Account Created", "Welcome aboard!");

    setTimeout(() => {
      window.location.href = "/";
    }, 800);
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-3">
            <h1 className="mb-2 font-semibold text-neutral-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-5">
              <GoogleLoginButton text="Sign up with Google" />
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
            <form onSubmit={handleRegister}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Username<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="username"
                      name="username"
                      placeholder="Enter your user name"
                      error={errors?.errorField?.username}
                    />
                    {errors?.errorField?.username && (
                      <p className="text-red-500 mt-1 text-sm">
                        {errors?.errorField?.username}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-1">
                    <Label>
                      Gender <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      options={options}
                      placeholder="Select Gender"
                      onChange={handleSelectChange}
                      className="dark:bg-dark-900"
                      error={errors?.errorField?.gender}
                    />
                    {errors?.errorField?.gender && (
                      <p className="text-red-500 mt-1 text-sm">
                        {errors?.errorField?.gender}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    error={errors?.errorField?.email}
                  />
                  {errors?.errorField?.email && (
                    <p className="text-red-500 mt-1 text-sm">
                      {errors?.errorField?.email}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        error={errors?.errorField?.password}
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
                    <Label>
                      Confirm Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="confirm password"
                        type={showPassword ? "text" : "password"}
                        name="password_confirmation"
                        error={errors?.errorField?.password}
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
                    {errors?.errorField?.confirm_password && (
                      <p className="text-red-500 mt-1 text-sm">
                        {errors?.errorField?.confirm_password}
                      </p>
                    )}
                  </div>
                </div>
                {messageError.title && (
                  <Alert
                    title={messageError.title}
                    message={messageError.description}
                    variant="warning"
                  />
                )}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block font-normal text-neutral-500 dark:text-neutral-400">
                    By creating an account means you agree to the{" "}
                    <span className="text-neutral-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="text-neutral-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                <div>
                  <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-red-500 shadow-theme-xs hover:bg-red-600">
                    {loading ? "Sign Up..." : "Sign Up"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-neutral-700 dark:text-neutral-400 sm:text-start">
                Already have an account? {""}
                <Link
                  to="/auth/sign-in"
                  className="text-red-500 hover:text-red-600 dark:text-red-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
