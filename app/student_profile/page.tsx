'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Student, Assessment } from './types';
import { getStudentsFromStorage, saveStudentsToStorage, generateId, createEmptyAssessment } from './utils';
import StudentList from './components/StudentList';
import AssessmentForm from './components/AssessmentForm';
import StudentVisualizations from './components/StudentVisualizations';
import Overview from './components/Overview';
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
  const [resizing, setResizing] = useState<boolean>(false);
  const [splitPosition, setSplitPosition] = useState<number>(40); // 默认分割位置：40% 表单，60% 可视化
  const [activeView, setActiveView] = useState<'overview' | 'assessment' | 'visualization'>('overview');
  const splitPaneRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // 实时评估更新回调
  const handleAssessmentChange = useCallback((updatedAssessment: Assessment) => {
    setRealtimeAssessment(updatedAssessment);
  }, []);
  
  // 处理拖动过程
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing || !splitPaneRef.current) return;
      
      const containerRect = splitPaneRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      
      // 计算鼠标位置相对于容器的百分比
      let newPosition = (mouseX / containerWidth) * 100;
      
      // 限制拖动范围，确保两个面板都至少有20%的宽度
      newPosition = Math.max(20, Math.min(newPosition, 80));
      
      setSplitPosition(newPosition);
    };
    
    const handleMouseUp = () => {
      setResizing(false);
    };
    
    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);
  
  // 检查用户认证状态
  useEffect(() => {
    async function checkAuth() {
      try {
        // 在按钮点击时检查认证，而不是页面加载时
        setIsCheckingAuth(false);
        
        // 示例模式
        const exampleData = localStorage.getItem('example_mode');
        if (exampleData === 'true') {
          setIsExampleMode(true);
          // 如果没有示例数据，创建一些
          const students = getStudentsFromStorage();
          if (students.length === 0) {
            // 这里可以添加示例数据
            console.log('可以添加一些示例数据');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
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
    setActiveView('overview'); // 默认显示总览页面
  };

  // 创建新评估的回调
  const handleCreateAssessment = () => {
    if (!selectedStudent) return;
    
    // 检查今天是否已经有评估
    const today = new Date().toISOString().split('T')[0]; // 获取今天的日期 YYYY-MM-DD
    const existingAssessmentToday = selectedStudent.assessments.find(assessment => {
      const assessmentDate = new Date(assessment.date).toISOString().split('T')[0];
      return assessmentDate === today;
    });
    
    if (existingAssessmentToday) {
      // 如果今天已有评估，导航到该评估
      setSelectedAssessment(existingAssessmentToday);
      setIsCreatingAssessment(false);
      setActiveView('assessment');
      
      // 显示提示
      alert(`今天 (${today}) 已经创建过评估，将为您打开已有评估进行修改。`);
      return;
    }
    
    // 如果今天没有评估，创建新评估
    setIsCreatingAssessment(true);
    setSelectedAssessment(null);
    setActiveView('assessment');
  };

  // 选择特定评估的回调
  const handleSelectAssessment = (studentId: string, assessmentId: string) => {
    const students = getStudentsFromStorage();
    const student = students.find(s => s.id === studentId);
    
    if (student) {
      const assessment = student.assessments.find(a => a.id === assessmentId);
      if (assessment) {
        setSelectedStudent(student);
        setSelectedAssessment(assessment);
        setIsCreatingAssessment(false);
        setRealtimeAssessment(null);
        setActiveView('assessment');
      }
    }
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

  // 切换左侧栏的显示/隐藏
  const toggleSidebar = () => {
    setIsEditingSidebar(!isEditingSidebar);
  };
  
  // 处理拖动开始
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setResizing(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100">
      {/* 顶部导航栏 */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg 
              className="w-8 h-8 mr-3 text-white opacity-90" 
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
              <div className="px-3 py-2 bg-yellow-500 text-white rounded-md flex items-center text-sm shadow-sm">
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
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-md flex items-center text-sm transition duration-200 shadow-sm"
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
                className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-md flex items-center text-sm transition duration-200 shadow-sm"
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
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 rounded-md flex items-center text-sm transition duration-200 shadow-sm"
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

      {/* 主体内容 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧学生列表 */}
        <div 
          className={`border-r border-gray-200 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
            isEditingSidebar ? 'w-80' : 'w-0'
          }`}
        >
          {isEditingSidebar && (
            <StudentList 
              selectedStudentId={selectedStudent?.id || null} 
              onSelectStudent={handleSelectStudent} 
              onSelectAssessment={handleSelectAssessment}
            />
          )}
        </div>
        
        {/* 中间内容区 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedStudent ? (
            <>
              {/* 视图切换导航 */}
              {!isCreatingAssessment && !selectedAssessment && (
                <div className="bg-white border-b border-gray-200 px-4">
                  <nav className="flex space-x-4">
                    <button
                      onClick={() => setActiveView('overview')}
                      className={`px-3 py-4 text-sm font-medium border-b-2 ${
                        activeView === 'overview' 
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      总览
                    </button>
                  </nav>
                </div>
              )}
              
              {/* 内容区域 */}
              <div className="flex-1 overflow-auto">
                {/* 总览视图 */}
                {activeView === 'overview' && !isCreatingAssessment && !selectedAssessment && (
                  <Overview 
                    key={`overview-${selectedStudent.id}`}
                    student={selectedStudent}
                    onSelectAssessment={handleSelectAssessment}
                    onCreateAssessment={handleCreateAssessment}
                  />
                )}
                
                {/* 评估表单和可视化 */}
                {(isCreatingAssessment || selectedAssessment) && (
                  <div ref={splitPaneRef} className="flex flex-1 overflow-hidden relative">
                    {/* 评估表单区域 */}
                    <div 
                      className="h-full overflow-auto" 
                      style={{ width: `${splitPosition}%` }}
                    >
                      <AssessmentForm 
                        student={selectedStudent}
                        existingAssessment={selectedAssessment}
                        onAssessmentSaved={handleAssessmentSaved}
                        onAssessmentChange={handleAssessmentChange}
                      />
                    </div>
                    
                    {/* 可拖动分隔线 */}
                    <div 
                      className={`w-1.5 h-full bg-gray-200 hover:bg-blue-500 cursor-col-resize active:bg-blue-600 transition-colors relative ${resizing ? 'bg-blue-600' : ''}`}
                      onMouseDown={handleMouseDown}
                      style={{ cursor: resizing ? 'col-resize' : 'default' }}
                    >
                      {/* 拖动指示器 */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-12 flex flex-col items-center justify-center">
                        <div className="w-0.5 h-2 bg-gray-400 rounded-full mb-1"></div>
                        <div className="w-0.5 h-2 bg-gray-400 rounded-full mb-1"></div>
                        <div className="w-0.5 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* 数据可视化区域 */}
                    <div 
                      className="h-full overflow-auto" 
                      style={{ width: `${100 - splitPosition}%` }}
                    >
                      <StudentVisualizations 
                        student={selectedStudent} 
                        assessment={selectedAssessment || realtimeAssessment}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium mb-2">请选择一名学生</p>
                <p>从左侧学生列表中选择一名学生以查看其评估数据</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 拖动时的覆盖层，防止选中文本 */}
      {resizing && (
        <div className="fixed inset-0 bg-transparent cursor-col-resize z-50" />
      )}
    </div>
  );
};

// 顶级页面组件
export default function StudentProfilePage() {
  // 使用动态导入来避免服务端渲染issues
  return <StudentProfileContent />;
} 