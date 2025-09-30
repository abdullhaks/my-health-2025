import { analyticsResponseDTO, IAnalytics } from "../dto/analyticsDto";

export class AnalyticsMapper {
    static async toResponseDTO(analytics: IAnalytics): Promise<analyticsResponseDTO> {
        return {
            _id: analytics._id.toString(),
            dataSet: analytics.dataSet,
            totalUsers: analytics.totalUsers,
            totalDoctors: analytics.totalDoctors,
            totalRevenue: analytics.totalRevenue,
            totalPaid: analytics.totalPaid,
            totalConsultations: analytics.totalConsultations,
            createdAt: analytics.createdAt,
            updatedAt: analytics.updatedAt,
        }
    }
}