import React from "react";
import { Link } from "react-router-dom";
import { path } from "../common/path";
import { useLottie } from "lottie-react";
import pageNotFoundAnimation from "../assets/animation/404_Animation.json";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";
import UserTemplate from "../template/UserTemplate";

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
