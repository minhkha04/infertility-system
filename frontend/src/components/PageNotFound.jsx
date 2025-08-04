import { useLottie } from "lottie-react";
import pageNotFoundAnimation from "../assets/animation/404_Animation.json";
import UserHeader from "./UserHeader";

const PageNotFound = () => {
  const options = {
    animationData: pageNotFoundAnimation,
    loop: true,
  };
  const { View } = useLottie(options);

  return (
    <div>
      <UserHeader />
      <div className="404_content flex justify-around items-center h-[69vh]  overflow-hidden mt-20">
        <div className="object-cover object-center">{View}</div>
      </div>
    </div>
  );
};

export default PageNotFound;
