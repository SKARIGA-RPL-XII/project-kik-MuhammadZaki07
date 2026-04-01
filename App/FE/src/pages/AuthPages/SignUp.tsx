import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function SignUp() {
  const navigate = useNavigate();
  const isElectron = navigator.userAgent.toLowerCase().includes("electron");

  useEffect(() => {
    if (isElectron) {
      navigate("/auth/sign-in");
    }
  }, [isElectron, navigate]);

  if (isElectron) return null;
  return (
    <>
      <PageMeta
        title="Sign Up | Restaurant Management System"
        description="Create your account to start ordering and manage your dining experience."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
