import { ReactNode } from "react";
import { Navigate, Outlet} from "react-router";

type Props = {
  children: ReactNode;
};

export const AuthMiddleware = ({children} : Props) => {
    const token = localStorage.getItem("token");
    return !token ? <Navigate to={'/auth/sign-in'} replace/> : children
}

export const GuestMiddleware = () => {
    const token = localStorage.getItem("token");
    return token ? <Navigate to={'/'} replace/> : <Outlet/>
}