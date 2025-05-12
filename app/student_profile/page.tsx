'use client';

import { useState, useEffect } from 'react';
import { Student, Assessment } from './types';
import { getStudentsFromStorage, saveStudentsToStorage, generateId, createEmptyAssessment } from './utils';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import StudentVisualizations from './components/StudentVisualizations';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// 客户端组件，用于避免服务器端渲染时的Supabase错误
const StudentProfileContent = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [isCreatingAssessment, setIsCreatingAssessment] = useState<boolean>(false);
  const [realtimeAssessment, setRealtimeAssessment] = useState<Assessment | null>(null);
  const [isEditingSidebar, setIsEditingSidebar] = useState<boolean>(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isExampleMode, setIsExampleMode] = useState<boolean>(false);
  const router = useRouter();
  
  // 仅在客户端导入和使用Supabase
  useEffect(() => {
    async function checkAuth() {
      // 检查URL中是否包含example参数
      const urlParams = new URLSearchParams(window.location.search);
      const isExample = urlParams.get('example') === 'true';
      
      if (isExample) {
        setIsExampleMode(true);
        setIsCheckingAuth(false);
        return;
      }
      
      // 仅在客户端导入Supabase
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      
      // 如果不是示例模式，则检查是否已登录
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // 未登录则重定向到登录页面
        router.push('/sign-in');
      } else {
        setIsCheckingAuth(false);
      }
    }
    
    checkAuth();
  }, [router]);

  // 如果正在检查认证状态，显示加载状态
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // 选择学生的回调
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSelectedAssessment(null);
    setIsCreatingAssessment(false);
    setRealtimeAssessment(null);
  };

  // 创建新评估的回调
  const handleCreateAssessment = () => {
    if (!selectedStudent) return;
    setIsCreatingAssessment(true);
    setSelectedAssessment(null);
    setRealtimeAssessment(null);
  };

  // 保存评估回调
  const handleAssessmentSaved = (student: Student, savedAssessment: Assessment) => {
    // 更新本地存储
    const students = getStudentsFromStorage();
    const studentIndex = students.findIndex(s => s.id === student.id);
    
    if (studentIndex >= 0) {
      // 如果是更新现有评估
      const assessmentIndex = student.assessments.findIndex(a => a.id === savedAssessment.id);
      
      if (assessmentIndex >= 0) {
        students[studentIndex].assessments[assessmentIndex] = savedAssessment;
      } else {
        // 如果是新评估
        students[studentIndex].assessments.push(savedAssessment);
      }
      
      saveStudentsToStorage(students);
      
      // 更新选中的学生
      setSelectedStudent(students[studentIndex]);
      setSelectedAssessment(savedAssessment);
      setIsCreatingAssessment(false);
    }
  };

  // 实时评估更新回调
  const handleAssessmentChange = (updatedAssessment: Assessment) => {
    setRealtimeAssessment(updatedAssessment);
  };

  // 切换左侧栏的显示/隐藏
  const toggleSidebar = () => {
    setIsEditingSidebar(!isEditingSidebar);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg 
              className="w-8 h-8 mr-3" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
            <h1 className="text-2xl font-bold">学生个人档案应用</h1>
          </div>
          <div className="flex space-x-3">
            {isExampleMode ? (
              <div className="px-3 py-2 bg-yellow-500 text-white rounded-md flex items-center text-sm">
                <svg 
                  className="w-5 h-5 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                示例模式
              </div>
            ) : null}
            <button
              onClick={toggleSidebar}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-md flex items-center text-sm transition"
            >
              <svg 
                className="w-5 h-5 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
              {isEditingSidebar ? '隐藏侧边栏' : '显示侧边栏'}
            </button>
            {selectedStudent && (
              <button
                onClick={handleCreateAssessment}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center text-sm transition"
              >
                <svg 
                  className="w-5 h-5 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4" 
                  />
                </svg>
                创建新评估
              </button>
            )}
            {isExampleMode && (
              <button
                onClick={() => router.push('/sign-in')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center text-sm transition"
              >
                <svg 
                  className="w-5 h-5 mr-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                  />
                </svg>
                登录系统
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* 三栏布局主体 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧栏：学生目录 */}
        {isEditingSidebar && (
          <div className="w-1/4 max-w-xs border-r border-gray-200 bg-white shadow-md flex-shrink-0 overflow-y-auto">
            <StudentList
              onSelectStudent={handleSelectStudent}
              selectedStudentId={selectedStudent?.id || null}
            />
          </div>
        )}

        {/* 中间栏：评估内容 */}
        <div className={`${isEditingSidebar ? 'w-2/5' : 'w-3/5'} overflow-y-auto`}>
          {selectedStudent ? (
            isCreatingAssessment ? (
              <AssessmentForm
                student={selectedStudent}
                onAssessmentSaved={handleAssessmentSaved}
                onAssessmentChange={handleAssessmentChange}
              />
            ) : selectedAssessment ? (
              <AssessmentForm
                student={selectedStudent}
                existingAssessment={selectedAssessment}
                onAssessmentSaved={handleAssessmentSaved}
                onAssessmentChange={handleAssessmentChange}
              />
            ) : selectedStudent.assessments.length > 0 ? (
              <div className="h-full flex flex-col p-6 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name} - 评估记录</h2>
                    <p className="text-gray-600 mt-1">{selectedStudent.grade}</p>
                  </div>
                  <button
                    onClick={handleCreateAssessment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
                  >
                    <svg 
                      className="w-5 h-5 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                      />
                    </svg>
                    创建新评估
                  </button>
                </div>
                
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b">
                    <h3 className="text-lg font-medium">历史评估记录</h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {selectedStudent.assessments.map((assessment, index) => (
                      <li 
                        key={assessment.id}
                        className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => setSelectedAssessment(assessment)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-medium text-blue-600">
                              评估 #{selectedStudent.assessments.length - index}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(assessment.date).toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <svg 
                            className="w-5 h-5 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M9 5l7 7-7 7" 
                            />
                          </svg>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center bg-blue-50 p-8 rounded-lg max-w-md">
                  <svg 
                    className="w-16 h-16 mx-auto text-blue-500 mb-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-800 mb-3">尚无评估记录</p>
                  <p className="text-gray-600 mb-4">创建第一个评估来开始记录学生的学习情况</p>
                  <button
                    onClick={handleCreateAssessment}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition"
                  >
                    创建第一个评估
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center p-6 bg-white">
              <div className="text-center bg-blue-50 p-8 rounded-lg max-w-md">
                <svg 
                  className="w-16 h-16 mx-auto text-blue-500 mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                  />
                </svg>
                <p className="text-lg font-medium text-gray-800 mb-3">请从左侧选择一个学生</p>
                <p className="text-gray-600">或者添加一个新的学生档案</p>
              </div>
            </div>
          )}
        </div>
        
        {/* 右侧栏：数据可视化 */}
        <div className={`${isEditingSidebar ? 'w-2/5' : 'w-2/5'} overflow-y-auto`}>
          {selectedStudent ? (
            <StudentVisualizations
              student={selectedStudent}
              assessment={realtimeAssessment || selectedAssessment}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 bg-white">
              <div className="text-center bg-blue-50 p-8 rounded-lg max-w-md">
                <svg 
                  className="w-16 h-16 mx-auto text-blue-500 mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
                <p className="text-lg font-medium text-gray-800 mb-3">无数据可视化</p>
                <p className="text-gray-600">请先选择一个学生并创建评估</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 使用动态导入避免服务器端渲染
export default function StudentProfilePage() {
  return <StudentProfileContent />;
} 