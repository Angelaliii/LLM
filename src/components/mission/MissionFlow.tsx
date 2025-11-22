import React from "react";
import { useChatStore } from "../../store/useChatStore";
import MissionList from "./MissionList";
import MissionIntro from "./MissionIntro";
import NPCSelector from "./NPCSelector";
import ChatRoom from "./ChatRoom";
import SummaryView from "./SummaryView";
import QuizView from "./QuizView";

const MissionFlow: React.FC = () => {
  const { missionStage } = useChatStore();

  switch (missionStage) {
    case "S0":
      return <MissionList />;
    case "S1":
      return <MissionIntro />;
    case "S2":
      return <NPCSelector />;
    case "S3":
      return <ChatRoom />;
    case "S4":
      return <SummaryView />;
    case "S5":
      return <QuizView />;
    default:
      return <MissionList />;
  }
};

export default MissionFlow;
