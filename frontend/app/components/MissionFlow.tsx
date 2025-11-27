import React from "react";
import { useMissionStore } from "../store/useMissionStore";
import MissionList from "./MissionList";
import MissionIntro from "./MissionIntro";
import SimpleChatRoom from "./SimpleChatRoom";
import SummaryView from "./SummaryView";
import QuizView from "./QuizView";

// 使用新的簡化對話組件
const MissionFlow: React.FC = () => {
  const { currentStage } = useMissionStore();

  switch (currentStage) {
    case "S0":
      return <MissionList />;
    case "S1":
      return <MissionIntro />;
    case "S3":
      return <SimpleChatRoom />;
    case "S4":
      return <SummaryView />;
    case "S5":
      return <QuizView />;
    default:
      return <MissionList />;
  }
};

export default MissionFlow;
