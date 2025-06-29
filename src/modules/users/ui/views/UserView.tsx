
import UserSection from "../section/UserSection";
import VideoSection from "../section/VideoSection";

interface UserViewProps {
  userId: string;
}
const UserView = ({ userId }: UserViewProps) => {
  return (
    <div className="flex flex-col max-w-[1300px] gap-y-6 mx-auto pt-2.5 px-4 mb-10">
        <UserSection userId={userId} />
        <VideoSection userId={userId} />
    </div>
  )
}

export default UserView