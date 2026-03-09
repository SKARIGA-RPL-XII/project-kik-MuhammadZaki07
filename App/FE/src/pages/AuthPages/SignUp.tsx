import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
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