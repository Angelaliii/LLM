import React, { useState, useEffect } from 'react';

const ConnectionTest: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<string>('檢查中...');
  const [apiTest, setApiTest] = useState<string>('檢查中...');
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    // 測試後端健康狀況
    try {
      const healthResponse = await fetch('/api/health');
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        setBackendStatus(`✅ 健康 - ${data.timestamp}`);
      } else {
        setBackendStatus('❌ 後端回應錯誤');
      }
    } catch (error) {
      setBackendStatus(`❌ 連接失敗: ${error}`);
    }

    // 測試基本 API
    try {
      const testResponse = await fetch('/api/test');
      if (testResponse.ok) {
        const data = await testResponse.json();
        setApiTest(`✅ ${data.message}`);
      } else {
        setApiTest('❌ API 測試失敗');
      }
    } catch (error) {
      setApiTest(`❌ API 測試錯誤: ${error}`);
    }

    // 測試任務 API
    try {
      const missionsResponse = await fetch('/api/missions');
      if (missionsResponse.ok) {
        const data = await missionsResponse.json();
        setMissions(data.missions);
      }
    } catch (error) {
      console.error('任務 API 測試失敗:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔧 系統連接測試</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">後端健康檢查</h3>
          <p className="text-sm">{backendStatus}</p>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2">API 基本測試</h3>
          <p className="text-sm">{apiTest}</p>
        </div>
      </div>

      <div className="border p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">任務資料測試</h3>
        {missions.length > 0 ? (
          <div>
            <p className="text-green-600 mb-2">✅ 找到 {missions.length} 個任務</p>
            {missions.map(mission => (
              <div key={mission.id} className="bg-gray-50 p-3 rounded mb-2">
                <h4 className="font-medium">{mission.title}</h4>
                <p className="text-sm text-gray-600">{mission.period}</p>
                <p className="text-sm">{mission.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-yellow-600">⏳ 載入任務資料中...</p>
        )}
      </div>

      <button 
        onClick={checkConnections}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        🔄 重新檢查
      </button>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">📋 檢查清單</h3>
        <ul className="text-sm space-y-1">
          <li>• 確認後端運行在 http://localhost:4000</li>
          <li>• 確認前端運行在 http://localhost:3000</li>
          <li>• 檢查 Ollama 服務是否啟動</li>
          <li>• 驗證 API 代理設定是否正確</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;