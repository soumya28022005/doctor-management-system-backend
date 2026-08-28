import ApiError from "../../utils/apiError.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../../utils/cloudinaryUpload.js";
import { findUserAvatarById, updateUserAvatar } from "./user.repository.js";

// Universal profile photo upload. 
// Updates the "avatar" field in the User table for all supported roles.
export const uploadMyPhoto = async (userId, fileBuffer) => {
  const user = await findUserAvatarById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const oldAvatar = user.avatar;

  // Cloudinary-তে jeet/users ফোল্ডারে সেভ হবে
  const result = await uploadBufferToCloudinary(fileBuffer, "jeet/users");
  const updated = await updateUserAvatar(userId, result.secure_url);

  // যদি ইউজারের আগের কোনো ছবি থাকে, তবে সেটি Cloudinary থেকে ডিলিট করে দেওয়া হবে
  if (oldAvatar) await deleteFromCloudinary(oldAvatar);

  return updated;
};