import { IAnalytics } from "../../../dto/analyticsDto";
import { analyticsResponseDTO } from "../../../dto/analyticsDto";

export default interface IAdminAnalyticsServices {
  getUserAnalytics(filter: string): Promise<{ name: string; value: number }[]>;
  getDoctorAnalytics(
    filter: string
  ): Promise<{ name: string; value: number }[]>;
  getTotalAnalytics(): Promise<analyticsResponseDTO>;
  appointmentStats(filter: string): Promise<any>;
  reportsStats(filter: string): Promise<any>;
}
