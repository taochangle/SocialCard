/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useAppLogic } from "./hooks/useAppLogic";
import { Sidebar } from "./components/Sidebar";
import { PreviewPanel } from "./components/PreviewPanel";

export default function App() {
  const logic = useAppLogic();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-zinc-950 text-zinc-100 lg:flex-row">
      <Sidebar
        loading={logic.loading}
        isProcessing={logic.isProcessing}
        processProgress={logic.processProgress}
        statusMsg={logic.statusMsg}
        layoutMode={logic.layoutMode}
        setLayoutMode={logic.setLayoutMode}
        selectedTemplate={logic.selectedTemplate}
        setSelectedTemplate={logic.setSelectedTemplate}
        setTheme={logic.setTheme}
        authorName={logic.authorName}
        setAuthorName={logic.setAuthorName}
        selectedDate={logic.selectedDate}
        setSelectedDate={logic.setSelectedDate}
        globalSummary={logic.globalSummary}
        globalHashtags={logic.globalHashtags}
        platformStatus={logic.platformStatus}
        trendingData={logic.trendingData}
        currentIndex={logic.currentIndex}
        fetchTrending={logic.fetchTrending}
        loadCache={logic.loadCache}
        loginPlatform={logic.loginPlatform}
        publishToPlatform={logic.publishToPlatform}
        exportImage={logic.exportImage}
        applyProject={logic.applyProject}
        setStatusMsg={logic.setStatusMsg}
        processStage={logic.processStage}
      />

      <PreviewPanel
        layoutMode={logic.layoutMode}
        theme={logic.theme}
        displayDate={logic.displayDate}
        timeText={logic.timeText}
        weekdayText={logic.weekdayText}
        authorName={logic.authorName}
        globalSummary={logic.globalSummary}
        globalHashtags={logic.globalHashtags}
        trendingData={logic.trendingData}
        projectName={logic.projectName}
        projectUrl={logic.projectUrl}
        stars={logic.stars}
        starsToday={logic.starsToday}
        currentIndex={logic.currentIndex}
        highlightedHtml={logic.highlightedHtml}
        keywordList={logic.keywordList}
        avatarUrl={logic.avatarUrl}
        statusMsg={logic.statusMsg}
        isProcessing={logic.isProcessing}
        processProgress={logic.processProgress}
        previewRef={logic.previewRef}
        setStatusMsg={logic.setStatusMsg}
      />

      {/* Global Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
