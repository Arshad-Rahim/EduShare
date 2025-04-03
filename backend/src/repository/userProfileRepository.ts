import { IUserProfileRepository } from "../interfaces/repositoryInterfaces/IUserProfileRepository";
import { userModel } from "../models/userModels";
import { userProfileModel } from "../models/userProfileModel";
import { TUpdateUserProfile } from "../types/user";


export class UserProfileRepository implements IUserProfileRepository{
    async updateUserProfile(data: TUpdateUserProfile, id: string): Promise<void> {
        await userProfileModel.updateOne(
            {userId:id},
            {
                userId:id,
                education:data.education,
                aboutMe:data.aboutMe,
                interests:data.interests
            },
            {upsert : true}
        );
         await userModel.findOneAndUpdate({ _id: id }, { name: data.name });
    }
}