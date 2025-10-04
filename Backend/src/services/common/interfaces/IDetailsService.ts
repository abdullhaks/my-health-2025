import { IDoctor } from "../../../dto/doctorDTO";
import { IUser } from "../../../dto/userDTO";

export default interface IDetailsService {
  getDoctor(doctorId: string): Promise<IDoctor>;
  getUser(userId: string): Promise<IUser>;
}
