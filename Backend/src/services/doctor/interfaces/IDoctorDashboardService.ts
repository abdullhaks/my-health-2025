interface IDoctorDashboardContent {
    upcomingAppointmentsCount: [string, number][];
    todayAppointmentsCount: number;
    pendingReportsCount: number;
    todaysFirstAppointmentTime: string | null |Date;
  } 



export default interface IDoctorDashboardService {
  getDashboardContent(doctorId: string): Promise<IDoctorDashboardContent>;
  appointmentStats(doctorId: string, filter: string): Promise<any>;
  reportsStats(doctorId: string, filter: string): Promise<any>;
  payoutsStats(doctorId: string): Promise<any>;
}
