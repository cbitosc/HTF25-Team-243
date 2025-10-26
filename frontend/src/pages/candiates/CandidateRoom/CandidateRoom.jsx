import React, { useState } from "react";
import axios from "axios";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  TrackRefContext,
  useTracks,
  VideoTrack,
  TrackLoop,
  Chat,
  ControlBar,
  DisconnectButton,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useParams } from "react-router-dom";
import { CollaborativeEditor } from "../../../CollaborativeEditor";
import { Clock, User, Video, Play, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Dummy questions
const questionSet = [
  {
    id: "prob-4",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "Medium",
    initialCode: {
      javascript:
        "function twoSum(nums, target) {\n    // Write your code here\n    for(let i=0;i<nums.length;i++){\n        for(let j=i+1;j<nums.length;j++){\n            if(nums[i]+nums[j]===target) return [i,j];\n        }\n    }\n    return [];\n}",
      python3:
        "def two_sum(nums, target):\n    # Write your code here\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i]+nums[j]==target: return [i,j]\n    return []",
    },
    testCases: [
      { input: [[2, 7, 11, 15], 9], output: [0, 1], is_hidden: false },
      { input: [[3, 2, 4], 6], output: [1, 2], is_hidden: true },
      { input: [[1, 1, 2], 2], output: [0, 1], is_hidden: true },
    ],
    hints: ["Use nested loops", "Check all pairs"],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists"
    ]
  },
  {
    id: "prob-5",
    title: "Remove Duplicates",
    description: "Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.",
    difficulty: "Medium",
    initialCode: {
      javascript:
        "function removeDuplicates(nums) {\n    // Write your code here\n    return [...new Set(nums)];\n}",
      python3:
        "def remove_duplicates(nums):\n    # Write your code here\n    return list(dict.fromkeys(nums))",
    },
    testCases: [
      { input: [[1, 1, 2]], output: [1, 2], is_hidden: false },
      { input: [[2, 2, 2, 3]], output: [2, 3], is_hidden: true },
      { input: [[0, 0, 0, 0]], output: [0], is_hidden: true },
    ],
    hints: ["Use set or hashmap"],
    constraints: [
      "1 <= nums.length <= 3 * 10^4",
      "-100 <= nums[i] <= 100",
      "nums is sorted in non-decreasing order"
    ]
  },
  {
    id: "prob-6",
    title: "Rotate Array",
    description: "Given an array, rotate the array to the right by k steps, where k is non-negative.",
    difficulty: "Medium",
    initialCode: {
      javascript:
        "function rotate(nums,k) {\n    // Write your code here\n    k %= nums.length;\n    return nums.slice(-k).concat(nums.slice(0,-k));\n}",
      python3:
        "def rotate(nums,k):\n    # Write your code here\n    k %= len(nums)\n    return nums[-k:] + nums[:-k]",
    },
    testCases: [
      {
        input: [[1, 2, 3, 4, 5, 6, 7], 3],
        output: [5, 6, 7, 1, 2, 3, 4],
        is_hidden: false,
      },
      {
        input: [[-1, -100, 3, 99], 2],
        output: [3, 99, -1, -100],
        is_hidden: true,
      },
      { input: [[1, 2, 3], 4], output: [3, 1, 2], is_hidden: true },
    ],
    hints: ["Use slicing or reverse segments"],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-2^31 <= nums[i] <= 2^31 - 1",
      "0 <= k <= 10^5"
    ]
  },
];

// Video track component
function TracksView() {
  const tracks = useTracks([{ source: Track.Source.Camera }], {
    onlySubscribed: true,
  });
  return (
    <div className="card bg-base-200 w-full aspect-video flex items-center justify-center">
      {tracks.length > 0 ? (
        <TrackLoop tracks={tracks}>
          <TrackRefContext.Consumer>
            {(trackRefs) => trackRefs && <VideoTrack trackRef={trackRefs} />}
          </TrackRefContext.Consumer>
        </TrackLoop>
      ) : (
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-base-300 p-6 mb-3">
            <Video className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-base-content/70 text-sm font-medium">
            Waiting for video...
          </p>
        </div>
      )}
    </div>
  );
}

const CandidateRoom = () => {
  const { token } = useParams();
  const [activeTab, setActiveTab] = useState(questionSet[0].id);
  const [runResult, setRunResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRunCode = async (problemId) => {
    setLoading(true);
    setRunResult(null);

    const code = window.getCollaborativeEditorCode?.(problemId) || "";
    const language = "python3"; 
    const problemSetId = "set-2";

    try {
      const res = await axios.post(`http://localhost:3000/run/${problemId}`, {
        code,
        language,
        problemSetId,
      });
      setRunResult(res.data);
    } catch (err) {
      setRunResult({
        error: err.response?.data?.error || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeQuestion = questionSet.find((q) => q.id === activeTab);

  return (
    <div className="min-h-screen bg-base-100">
      <LiveKitRoom
        token={token}
        serverUrl="wss://hackoctober-y7aeqri9.livekit.cloud"
        connect
        audio
        video
      >
        <RoomAudioRenderer />

        {/* Top Bar */}
        <div className="navbar bg-base-200 shadow-lg border-b border-base-300">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-12">
                  <User className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Candidate Interview</h1>
                <p className="text-sm opacity-70">Software Engineer Position</p>
              </div>
            </div>
          </div>
          
          <div className="flex-none flex items-center gap-4">
            <div className="flex items-center gap-2 bg-base-300 px-4 py-2 rounded-box">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-mono text-2xl font-bold">
                45:00
              </span>
            </div>
            <DisconnectButton className="btn btn-error btn-sm">
              Exit Interview
            </DisconnectButton>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-[calc(100vh-64px)]">
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Problems & Test Cases */}
            <div className="w-96 bg-base-200 border-r border-base-300 flex flex-col">
              {/* Problem Tabs */}
              <div className="p-4 border-b border-base-300">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-lg">Problems</h3>
                </div>
                <div className="space-y-2">
                  {questionSet.map((q) => (
                    <button
                      key={q.id}
                      className={`btn btn-block justify-start ${
                        activeTab === q.id ? 'btn-primary' : 'btn-ghost'
                      }`}
                      onClick={() => setActiveTab(q.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm font-medium">{q.title}</span>
                        <span className={`badge ${
                          q.difficulty === "Easy" ? "badge-success" :
                          q.difficulty === "Medium" ? "badge-warning" :
                          "badge-error"
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Details & Test Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeQuestion && (
                  <>
                    {/* Problem Description */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3 text-lg">{activeQuestion.title}</h4>
                      <p className="text-base-content/80 leading-relaxed text-sm">
                        {activeQuestion.description}
                      </p>
                    </div>

                    {/* Constraints */}
                    <div className="mb-6">
                      <h5 className="font-semibold mb-2 text-sm uppercase tracking-wide opacity-70">
                        Constraints
                      </h5>
                      <ul className="space-y-2 text-sm text-base-content/70">
                        {activeQuestion.constraints?.map((constraint, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="font-mono text-xs">{constraint}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Run Button */}
                    <button
                      onClick={() => handleRunCode(activeQuestion.id)}
                      disabled={loading}
                      className="btn btn-primary btn-block mb-4"
                    >
                      {loading ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          Running Tests...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run Code
                        </>
                      )}
                    </button>

                    {/* Test Results */}
                    {runResult && runResult.results && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <h5 className="font-semibold">Test Results</h5>
                          {runResult.allPassed ? (
                            <CheckCircle className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-error" />
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {runResult.results.map((result, index) => (
                            <div
                              key={result.test_case_id || index}
                              className={`card ${
                                result.passed ? 'bg-success/20 border-success' : 'bg-error/20 border-error'
                              } border`}
                            >
                              <div className="card-body p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">
                                    Test Case {index + 1}
                                    {result.is_hidden && " (Hidden)"}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {result.passed ? (
                                      <CheckCircle className="w-4 h-4 text-success" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-error" />
                                    )}
                                    <span className={`text-sm font-semibold ${
                                      result.passed ? "text-success" : "text-error"
                                    }`}>
                                      {result.passed ? "Passed" : "Failed"}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-xs space-y-1 font-mono">
                                  <div><strong>Input:</strong> {JSON.stringify(result.input)}</div>
                                  <div><strong>Expected:</strong> {JSON.stringify(result.expected_output)}</div>
                                  <div><strong>Actual:</strong> {JSON.stringify(result.actual_output)}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Display */}
                    {runResult && runResult.error && (
                      <div className="alert alert-error">
                        <AlertCircle className="w-4 h-4" />
                        <span>{runResult.error}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Center - Collaborative Editor */}
            <div className="flex-1 bg-base-100 border-r border-base-300">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Code Editor</h3>
                    {activeQuestion && (
                      <span className="text-sm opacity-70 ml-2">
                        {activeQuestion.title}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <CollaborativeEditor
                    currentProblemId={activeTab}
                    initialCode={
                      activeQuestion?.initialCode || { javascript: "", python3: "" }
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Sidebar - Video & Chat */}
            <div className="w-96 bg-base-200 flex flex-col">
              {/* Video Section */}
              <div className="p-4 border-b border-base-300">
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Your Video</h3>
                </div>
                <TracksView />
              </div>

              {/* Chat Section */}
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-base-300">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Interview Chat</h3>
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <Chat />
                </div>
              </div>
            </div>
          </div>
        </div>
      </LiveKitRoom>
    </div>
  );
};

export default CandidateRoom;