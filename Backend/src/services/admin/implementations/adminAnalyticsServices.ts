import { inject, injectable } from "inversify";
import IAdminAnalyticsServices from "../interfaces/IAdminAnalyticsServices";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IAnalyticsRepository from "../../../repositories/interfaces/IAnalyticsRepository";
import { MESSAGES } from "../../../utils/messages";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import { PipelineStage } from "mongoose";
import { analyticsResponseDTO } from "../../../dto/analyticsDto";
import { AnalyticsMapper } from "../../../mappers/analytics.mapper";

// Define interfaces for aggregation pipeline stages
interface MatchStage {
  createdAt?: { $gte: Date; $lte: Date };
  date?: { $gte: string; $lte: string };
  appointmentStatus?: { $in: string[] };
  analysisStatus?: { $in: string[] };
}

interface GroupStage {
  _id: string | { $dateToString: { format: string; date: string | { $toDate: string } } } | { $year: string };
  count?: { $sum: number };
  pending?: { $sum: { $cond: [{ $eq: [string, string] }, number, number] } };
  submited?: { $sum: { $cond: [{ $eq: [string, string] }, number, number] } };
}

interface ProjectStage {
  name?: string | { $toString: string };
  value?: string;
  day?: string | { $toString: string };
  appointments?: string;
  pending?: string;
  submited?: string;
}

@injectable()
export default class AdminAnalyticsServices implements IAdminAnalyticsServices {
  constructor(
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,
    @inject("IAnalyticsRepository")
    private _analyticsRepository: IAnalyticsRepository,
    @inject("IAppointmentsRepository")
    private _appointmentRepository: IAppointmentsRepository,
    @inject("IReportAnalysisRepository")
    private _reportAnalysisRepository: IReportAnalysisRepository
  ) {}

  async getUserAnalytics(
    filter: string
  ): Promise<{ name: string; value: number }[]> {
    try {
      const now = new Date();
      let matchStage: MatchStage = {};
      let groupStage: GroupStage;
      let projectStage: ProjectStage = {};
      let sortStage: PipelineStage.Sort = { $sort: { _id: 1 } };

      switch (filter) {
        case "day": {
          const startDate = new Date();
          startDate.setDate(now.getDate() - 14); // Last 15 days
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setHours(23, 59, 59, 999);

          matchStage = {
            createdAt: { $gte: startDate, $lte: endDate },
          };
          groupStage = {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          };
          projectStage = {
            name: "$_id",
            value: "$count",
          };
          break;
        }

        case "month": {
          const startDate = new Date();
          startDate.setMonth(now.getMonth() - 11); // Last 12 months
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setHours(23, 59, 59, 999);

          matchStage = {
            createdAt: { $gte: startDate, $lte: endDate },
          };
          groupStage = {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            count: { $sum: 1 },
          };
          projectStage = {
            name: "$_id",
            value: "$count",
          };
          break;
        }

        case "year": {
          const startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 7); // Last 8 years
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setHours(23, 59, 59, 999);

          matchStage = {
            createdAt: { $gte: startDate, $lte: endDate },
          };
          groupStage = {
            _id: { $year: "$createdAt" },
            count: { $sum: 1 },
          };
          projectStage = {
            name: { $toString: "$_id" },
            value: "$count",
          };
          break;
        }

        default:
          throw MESSAGES.analytics.missingFilter
      }

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        { $group: groupStage },
        sortStage,
        { $project: projectStage },
      ];

      const rawData = await this._userRepository.aggregate<{
        name: string;
        value: number;
      }>(pipeline);

      if(!rawData.length){
        throw new Error(MESSAGES.analytics.notFound)
      }

      return rawData.map(({ name, value }) => ({ name: String(name), value }));
    } catch (error) {
      console.error("Error in getUserAnalytics:", error);
      throw new Error(MESSAGES.analytics.failedToFetch);
    }
  }

  async getDoctorAnalytics(
    filter: string
  ): Promise<{ name: string; value: number }[]> {
    try {
      const now = new Date();
      let matchStage: MatchStage = {};
      let groupStage: GroupStage;
      let projectStage: ProjectStage = {};
      let sortStage: PipelineStage.Sort = { $sort: { _id: 1 } };

      switch (filter) {
        case "day": {
          const startDate = new Date();
          startDate.setDate(now.getDate() - 14); // Last 15 days
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setHours(23, 59, 59, 999);

          matchStage = {
            createdAt: { $gte: startDate, $lte: endDate },
          };
          groupStage = {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          };
          projectStage = {
            name: "$_id",
            value: "$count",
          };
          break;
        }

        case "month": {
          const startDate = new Date();
          startDate.setMonth(now.getMonth() - 11); // Last 12 months
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setHours(23, 59, 59, 999);

          matchStage = {
            createdAt: { $gte: startDate, $lte: endDate },
          };
          groupStage = {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            count: { $sum: 1 },
          };
          projectStage = {
            name: "$_id",
            value: "$count",
          };
          break;
        }

        case "year": {
          const startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 7); // Last 8 years
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date();
          endDate.setHours(23, 59, 59, 999);

          matchStage = {
            createdAt: { $gte: startDate, $lte: endDate },
          };
          groupStage = {
            _id: { $year: "$createdAt" },
            count: { $sum: 1 },
          };
          projectStage = {
            name: { $toString: "$_id" },
            value: "$count",
          };
          break;
        }

        default:
          throw new Error("Invalid filter");
      }

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        { $group: groupStage },
        sortStage,
        { $project: projectStage },
      ];

      const rawData = await this._doctorRepository.aggregate<{
        name: string;
        value: number;
      }>(pipeline);

      return rawData.map(({ name, value }) => ({ name: String(name), value }));
    } catch (error) {
      console.error("Error in getDoctorAnalytics:", error);
      throw new Error("Failed to fetch doctor analytics");
    }
  }

  async getTotalAnalytics(): Promise<analyticsResponseDTO> {
    try {
      const response = await this._analyticsRepository.findOne({
        dataSet: "1",
      });
      if (!response) {
        throw new Error("internal error in getTotalAnalytics");
      }
      const analyticsDto = await AnalyticsMapper.toResponseDTO(response);

      return analyticsDto;
    } catch (err) {
      console.error("error in getTotalAnalytics service", err);
      throw new Error("error in getTotalAnalytics service");
    }
  }

  async appointmentStats(
    filter: string
  ): Promise<{ day: string; appointments: number }[]> {
    try {
      const now = new Date();
      let startDate: Date;
      let matchStage: MatchStage = {
        appointmentStatus: { $in: ["booked", "completed"] },
      };
      let groupStage: GroupStage;
      let sortStage: PipelineStage.Sort = { $sort: { _id: 1 } };
      let projectStage: ProjectStage = { day: "$_id", appointments: "$count" };

      switch (filter) {
        case "day":
          startDate = new Date();
          startDate.setDate(now.getDate() - 14);
          startDate.setHours(0, 0, 0, 0);
          matchStage.date = {
            $gte: startDate.toISOString().split("T")[0],
            $lte: now.toISOString().split("T")[0],
          };
          groupStage = {
            _id: "$date",
            count: { $sum: 1 },
          };
          break;

        case "month":
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 11);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          matchStage.date = {
            $gte: startDate.toISOString().split("T")[0],
            $lte: now.toISOString().split("T")[0],
          };
          groupStage = {
            _id: {
              $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } },
            },
            count: { $sum: 1 },
          };
          break;

        case "year":
          startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 7);
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          matchStage.date = {
            $gte: startDate.toISOString().split("T")[0],
            $lte: now.toISOString().split("T")[0],
          };
          groupStage = {
            _id: {
              $dateToString: { format: "%Y", date: { $toDate: "$date" } },
            },
            count: { $sum: 1 },
          };
          projectStage.day = { $toString: "$_id" };
          break;

        default:
          throw new Error("Invalid filter");
      }

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        { $group: groupStage },
        sortStage,
        { $project: projectStage },
      ];

      const rawData: { day: string; appointments: number }[] = await this._appointmentRepository.aggregate(pipeline);

      let result: { day: string; appointments: number }[] = [];

      if (filter === "day") {
        const dayMap = new Map(
          rawData.map((r: { day: string; appointments: number }) => [r.day, r.appointments])
        );
        for (let i = 0; i < 15; i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          const key = d.toISOString().split("T")[0];
          result.push({ day: key, appointments: dayMap.get(key) || 0 });
        }
      } else if (filter === "month") {
        const monthMap = new Map(
          rawData.map((r: { day: string; appointments: number }) => [r.day, r.appointments])
        );
        for (let i = 0; i < 12; i++) {
          const d = new Date(startDate);
          d.setMonth(startDate.getMonth() + i);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          result.push({ day: key, appointments: monthMap.get(key) || 0 });
        }
      } else if (filter === "year") {
        const yearMap = new Map(
          rawData.map((r: { day: string; appointments: number }) => [r.day, r.appointments])
        );
        for (let i = 0; i < 8; i++) {
          const d = new Date(startDate);
          d.setFullYear(startDate.getFullYear() + i);
          const key = String(d.getFullYear());
          result.push({ day: key, appointments: yearMap.get(key) || 0 });
        }
      }

      return result;
    } catch (error) {
      console.error("Error in appointmentStats:", error);
      throw new Error("Failed to fetch appointment stats");
    }
  }

  async reportsStats(
    filter: string
  ): Promise<{ day: string; pending: number; submited: number }[]> {
    try {
      const now = new Date();
      let startDate: Date;
      let matchStage: MatchStage = {
        analysisStatus: { $in: ["pending", "submited"] },
      };
      let groupStage: GroupStage;
      let sortStage: PipelineStage.Sort = { $sort: { _id: 1 } };
      let projectStage: ProjectStage = {
        day: "$_id",
        pending: "$pending",
        submited: "$submited",
      };

      switch (filter) {
        case "day":
          startDate = new Date();
          startDate.setDate(now.getDate() - 14);
          startDate.setHours(0, 0, 0, 0);
          matchStage.createdAt = { $gte: startDate, $lte: now };
          groupStage = {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            pending: {
              $sum: { $cond: [{ $eq: ["$analysisStatus", "pending"] }, 1, 0] },
            },
            submited: {
              $sum: {
                $cond: [{ $eq: ["$analysisStatus", "submited"] }, 1, 0],
              },
            },
          };
          break;

        case "month":
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 11);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          matchStage.createdAt = { $gte: startDate, $lte: now };
          groupStage = {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            pending: {
              $sum: { $cond: [{ $eq: ["$analysisStatus", "pending"] }, 1, 0] },
            },
            submited: {
              $sum: {
                $cond: [{ $eq: ["$analysisStatus", "submited"] }, 1, 0],
              },
            },
          };
          break;

        case "year":
          startDate = new Date();
          startDate.setFullYear(now.getFullYear() - 7);
          startDate.setMonth(0);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          matchStage.createdAt = { $gte: startDate, $lte: now };
          groupStage = {
            _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
            pending: {
              $sum: { $cond: [{ $eq: ["$analysisStatus", "pending"] }, 1, 0] },
            },
            submited: {
              $sum: {
                $cond: [{ $eq: ["$analysisStatus", "submited"] }, 1, 0],
              },
            },
          };
          projectStage.day = { $toString: "$_id" };
          break;

        default:
          throw new Error("Invalid filter");
      }

      const pipeline: PipelineStage[] = [
        { $match: matchStage },
        { $group: groupStage },
        sortStage,
        { $project: projectStage },
      ];

      const rawData: { day: string; pending: number; submited: number }[] = await this._reportAnalysisRepository.aggregate(pipeline);

      let result: { day: string; pending: number; submited: number }[] = [];

      if (filter === "day") {
        const dayMap = new Map(
          rawData.map((r: { day: string; pending: number; submited: number }) => [
            r.day,
            { pending: r.pending, submited: r.submited },
          ])
        );
        for (let i = 0; i < 15; i++) {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + i);
          const key = d.toISOString().split("T")[0];
          result.push({
            day: key,
            ...(dayMap.get(key) || { pending: 0, submited: 0 }),
          });
        }
      } else if (filter === "month") {
        const monthMap = new Map(
          rawData.map((r: { day: string; pending: number; submited: number }) => [
            r.day,
            { pending: r.pending, submited: r.submited },
          ])
        );
        for (let i = 0; i < 12; i++) {
          const d = new Date(startDate);
          d.setMonth(startDate.getMonth() + i);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          result.push({
            day: key,
            ...(monthMap.get(key) || { pending: 0, submited: 0 }),
          });
        }
      } else if (filter === "year") {
        const yearMap = new Map(
          rawData.map((r: { day: string; pending: number; submited: number }) => [
            r.day,
            { pending: r.pending, submited: r.submited },
          ])
        );
        for (let i = 0; i < 8; i++) {
          const d = new Date(startDate);
          d.setFullYear(startDate.getFullYear() + i);
          const key = String(d.getFullYear());
          result.push({
            day: key,
            ...(yearMap.get(key) || { pending: 0, submited: 0 }),
          });
        }
      }

      return result;
    } catch (error) {
      console.error("Error in reportsStats:", error);
      throw new Error("Failed to fetch reports stats");
    }
  }
} 