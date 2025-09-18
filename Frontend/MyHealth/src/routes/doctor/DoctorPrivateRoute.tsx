import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../../redux/store/store"; 

const DoctorPrivateRoute = () => {
  const doctor = useSelector((state: RootState) => state.doctor.doctor);
  const admin = useSelector((state: RootState) => state.admin.admin);
  const user = useSelector((state: RootState) => state.user.user);

  if(doctor){
    return <Outlet />
  }else if(admin){
    return <Navigate to="/admin/dashboard" />
  }else if(user){
    return <Navigate to="/user/dashboard" />
  }else{
    return <Navigate to="/" />
  }


};

export default DoctorPrivateRoute;