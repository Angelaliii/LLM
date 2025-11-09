import React from "react";
import Icon from "./Icon";

const TeachingFriendly: React.FC = () => {
  return (
    <section id="teaching" className="section-padding bg-white">
      <div className="container-max">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-heading-2 text-dark-900 mb-6">
              為教師設計的專業控制台
            </h2>
            <p className="text-xl text-dark-700 mb-8">
              完全符合教學需求的管理介面，讓教師輕鬆掌控課堂節奏，追蹤學生學習成效。
            </p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="shield" size="sm" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 mb-2">
                    課程主題預設
                  </h3>
                  <p className="text-dark-700">
                    根據教學進度預先設定對話主題，確保學習內容符合課綱要求。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="users" size="sm" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 mb-2">
                    即時監控學習
                  </h3>
                  <p className="text-dark-700">
                    查看學生對話記錄，了解學習困難點，適時給予個別指導。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Icon name="clock" size="sm" className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900 mb-2">
                    零技術門檻
                  </h3>
                  <p className="text-dark-700">
                    5 分鐘完成設定，無需任何技術背景，專注教學本質。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
              <div className="bg-white rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-dark-900 mb-4">
                  教師控制面板
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-700">課程主題</span>
                    <span className="text-sm font-medium text-primary-500">
                      秦朝統一
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-700">在線學生</span>
                    <span className="text-sm font-medium text-green-500">
                      32 人
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-dark-700">對話品質</span>
                    <span className="text-sm font-medium text-primary-500">
                      優良 85%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6">
                <h4 className="font-semibold text-dark-900 mb-4">
                  學生活動狀況
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-dark-700">
                      王小明：正在討論長城建設
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-dark-700">
                      李小華：詢問郡縣制度
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-dark-700">
                      張大明：需要引導回主題
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachingFriendly;
