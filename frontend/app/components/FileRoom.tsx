import React, { useRef, useState, useEffect } from 'react';

type FileCard = {
  id: string;
  title: string;
  snippet?: string;
};

export default function FileRoom() {
  const handRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [files] = useState<FileCard[]>([
    { id: 'f1', title: '總督府報告（殘缺）', snippet: '抗爭時間：19xx 年...' },
    { id: 'f2', title: '傳單（殘缺）', snippet: '訴求：恢復...' },
    { id: 'f3', title: '日誌（殘缺）', snippet: '當時現場看到...' }
  ]);

  const [floating, setFloating] = useState<null | {
    id: string;
    text: string;
    style: React.CSSProperties;
  }>(null);

  const [pickedIds, setPickedIds] = useState<Record<string, boolean>>({});

  // Create floating animation: on click, clone card position and animate to hand
  const handlePick = (e: React.MouseEvent, file: FileCard) => {
    const cardEl = (e.currentTarget as HTMLElement);
    const cardRect = cardEl.getBoundingClientRect();
    const handRect = handRef.current?.getBoundingClientRect();
    if (!handRect) return;

    const initialStyle: React.CSSProperties = {
      position: 'fixed',
      top: cardRect.top + 'px',
      left: cardRect.left + 'px',
      width: cardRect.width + 'px',
      height: cardRect.height + 'px',
      margin: 0,
      zIndex: 60,
      transition: 'all 520ms cubic-bezier(.2,.9,.2,1)'
    };

    setFloating({ id: file.id, text: file.title, style: initialStyle });

    // next tick animate to hand center
    requestAnimationFrame(() => {
      const targetTop = handRect.top + handRect.height / 2 - cardRect.height / 2;
      const targetLeft = handRect.left + handRect.width / 2 - cardRect.width / 2;
      setFloating(prev => prev && ({
        ...prev,
        style: {
          ...prev.style,
          top: targetTop + 'px',
          left: targetLeft + 'px',
          transform: 'scale(0.6) rotate(-6deg)',
          opacity: 0.95
        }
      }));
    });

    // after animation finishes, mark picked and remove floating
    setTimeout(() => {
      setPickedIds(prev => ({ ...prev, [file.id]: true }));
      setFloating(null);
    }, 600);
  };

  // drag handlers (basic): set dataTransfer with id
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropToSlot = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    // basic behavior: mark as picked
    if (id) setPickedIds(prev => ({ ...prev, [id]: true }));
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div ref={containerRef} className="p-6 bg-gray-50 min-h-[60vh]">
      <div className="flex items-start gap-6">
        {/* 左：檔案櫃區 */}
        <div className="w-2/3">
          <h2 className="text-xl font-semibold mb-4">檔案室</h2>

          <div className="grid grid-cols-3 gap-4">
            {files.map(file => (
              <div
                key={file.id}
                className={`relative p-4 rounded-md shadow-md bg-white border ${pickedIds[file.id] ? 'opacity-40 grayscale' : ''}`}
                onClick={(e) => handlePick(e, file)}
                draggable={!pickedIds[file.id]}
                onDragStart={(e) => handleDragStart(e, file.id)}
                role="button"
                aria-pressed={!!pickedIds[file.id]}
              >
                <div className="h-32 flex flex-col justify-between">
                  <div className="bg-gray-200 h-8 rounded w-3/4 animate-pulse" />
                  <div className="text-sm text-gray-600">{file.snippet}</div>
                  <div className="text-xs text-gray-400 mt-2">{pickedIds[file.id] ? '已取得' : '點擊取出 / 拖拉'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">修復檔案區</h3>
            <div className="grid grid-cols-3 gap-4">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="h-24 border-2 border-dashed rounded flex items-center justify-center bg-white"
                  onDrop={(e) => handleDropToSlot(e, `slot-${i}`)}
                  onDragOver={handleDragOver}
                >
                  <div className="text-sm text-gray-500">拖拉檔案到此 ({i+1})</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右：手/收集區 (Notebook/hand) */}
        <div className="w-1/3">
          <div className="sticky top-6">
            <div ref={handRef} className="w-full h-36 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 border p-4 flex flex-col items-center justify-center">
              <div className="text-sm text-yellow-800 font-semibold">筆記本 / 拾取區</div>
              <div className="mt-2 text-xs text-gray-600">已取得: {Object.keys(pickedIds).length}</div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">說明</h4>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                <li>點擊卡片會播放「拿取」動畫。</li>
                <li>拖拉卡片到空格可以模擬 S4 檔案修復步驟。</li>
                <li>已取得卡片會變灰並標記「已取得」。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating clone for animation */}
      {floating && (
        <div style={floating.style} className="rounded-md shadow-lg bg-white p-3 flex items-center justify-center">
          <div className="text-sm font-medium">{floating.text}</div>
        </div>
      )}
    </div>
  );
}
