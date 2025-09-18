
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store";

const DoctorPublicRoute = () => {
  const admin = useSelector((state: RootState) => state.admin.admin);
  const user = useSelector((state: RootState) => state.user.user);
  const doctor = useSelector((state: RootState) => state.doctor.doctor);

  if(doctor){
   return <Navigate to="/doctor/dashboard" />
  }else if(user){
    return <Navigate to="/user/dashboard" />
  }else if(admin){
    return <Navigate to="/admin/dashboard" />
  }else{
    return <Outlet />
  }


};

export default DoctorPublicRoute;


