'use client';

import { useState, useEffect } from 'react';
import { Student } from '../types';
import { getStudentsFromStorage, saveStudentsToStorage, generateId } from '../utils';

interface StudentListProps {
  onSelectStudent: (student: Student) => void;
  selectedStudentId: string | null;
  onSelectAssessment?: (studentId: string, assessmentId: string) => void;
}

export default function StudentList({ onSelectStudent, selectedStudentId, onSelectAssessment }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // 加载学生数据
  useEffect(() => {
    const loadedStudents = getStudentsFromStorage();
    
    // 只有当加载的学生数据与当前状态不同时才更新状态
    // 使用 JSON.stringify 进行深比较
    if (JSON.stringify(loadedStudents) !== JSON.stringify(students)) {
      setStudents(loadedStudents);
    }

    // 如果有学生且没有选中学生，默认选择第一个
    if (loadedStudents.length > 0 && !selectedStudentId) {
      onSelectStudent(loadedStudents[0]);
    }
  }, [selectedStudentId, onSelectStudent, students]);

  // 添加新学生
  const handleAddStudent = () => {
    if (!newStudentName.trim() || !newStudentGrade.trim()) return;

    const newStudent: Student = {
      id: generateId(),
      name: newStudentName.trim(),
      grade: newStudentGrade.trim(),
      createdAt: new Date().toISOString(),
      assessments: []
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    saveStudentsToStorage(updatedStudents);
    
    // 重置表单
    setNewStudentName('');
    setNewStudentGrade('');
    setIsAddingStudent(false);
    
    // 选择新创建的学生
    onSelectStudent(newStudent);
  };

  // 删除学生
  const handleDeleteStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除此学生档案吗？此操作不可撤销。')) return;

    const updatedStudents = students.filter(student => student.id !== studentId);
    setStudents(updatedStudents);
    saveStudentsToStorage(updatedStudents);

    // 如果删除的是当前选中的学生，则选择列表中的第一个学生（如果有）
    if (studentId === selectedStudentId) {
      if (updatedStudents.length > 0) {
        onSelectStudent(updatedStudents[0]);
      } else {
        onSelectStudent(null as any);
      }
    }
  };

  // 切换学生评估列表的展开/折叠状态
  const toggleStudentExpand = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  // 选择特定的评估
  const handleSelectAssessment = (studentId: string, assessmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectAssessment) {
      onSelectAssessment(studentId, assessmentId);
    }
  };

  // 过滤后的学生列表
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 格式化简短日期显示（仅年月日）
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 获取最近的评估
  const getLatestAssessment = (student: Student) => {
    if (!student.assessments || student.assessments.length === 0) return null;
    
    return student.assessments.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">学生档案目录</h2>
        
        {/* 搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索学生..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>
        </div>
        
        {/* 添加新学生按钮 */}
        {!isAddingStudent ? (
          <button
            onClick={() => setIsAddingStudent(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" 
                clipRule="evenodd" 
              />
            </svg>
            添加新学生
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-3">添加新学生</h3>
            <input
              type="text"
              placeholder="学生姓名"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
            />
            <input
              type="text"
              placeholder="年级"
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newStudentGrade}
              onChange={(e) => setNewStudentGrade(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={handleAddStudent}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex-1 mr-2"
              >
                保存
              </button>
              <button
                onClick={() => setIsAddingStudent(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex-1 ml-2"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 学生列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery ? '未找到匹配的学生' : '尚无学生档案'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredStudents.map(student => {
              const latestAssessment = getLatestAssessment(student);
              
              // 计算唯一的评估日期数量
              const uniqueAssessmentDates = new Set(
                student.assessments.map(assessment => formatShortDate(assessment.date))
              );
              const uniqueAssessmentCount = uniqueAssessmentDates.size;

              return (
                <li
                  key={student.id}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors
                    ${selectedStudentId === student.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <div 
                    className="p-4"
                    onClick={() => onSelectStudent(student)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-lg">{student.name}</div>
                        <div className="text-sm text-gray-500 mt-1">{student.grade}</div>
                        {/* 添加最近评估日期显示 */}
                        {latestAssessment && (
                          <div className="text-xs text-blue-600 mt-1">
                            最近评估: {formatShortDate(latestAssessment.date)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => handleDeleteStudent(student.id, e)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          title="删除学生"
                        >
                          <svg 
                            className="w-5 h-5" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* 评估信息显示区域 */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        {student.assessments.length > 0 ? (
                          <>
                            <button
                              onClick={(e) => toggleStudentExpand(student.id, e)}
                              className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs hover:bg-blue-200 transition-colors cursor-pointer flex items-center"
                              title={expandedStudentId === student.id ? "收起评估列表" : "展开评估列表"}
                            >
                              {uniqueAssessmentCount} 个评估记录
                              <svg 
                                className={`w-3 h-3 ml-1 transition-transform ${expandedStudentId === student.id ? 'transform rotate-180' : ''}`} 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path 
                                  fillRule="evenodd" 
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                                  clipRule="evenodd" 
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                            暂无评估记录
                          </span>
                        )}
                      </div>
                      
                      {/* 最新评估日期按钮 */}
                      {latestAssessment && (
                        <button 
                          onClick={(e) => handleSelectAssessment(student.id, latestAssessment.id, e)}
                          className="inline-flex items-center text-xs px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200"
                          title="查看最近评估"
                        >
                          <svg 
                            className="w-3 h-3 mr-1" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          最新: {formatShortDate(latestAssessment.date)}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* 评估历史记录 */}
                  {expandedStudentId === student.id && student.assessments.length > 0 && (
                    <div className="bg-gray-50 p-3 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">全部评估历史:</h4>
                      <ul className="space-y-1">
                        {(() => {
                          // 先对评估按日期降序排序
                          const sortedAssessments = [...student.assessments].sort(
                            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                          );
                          
                          // 使用Map按日期分组，保留每个日期最新的评估
                          const uniqueAssessments = new Map();
                          sortedAssessments.forEach(assessment => {
                            const dateKey = formatShortDate(assessment.date); // 只使用年月日作为键
                            if (!uniqueAssessments.has(dateKey)) {
                              uniqueAssessments.set(dateKey, assessment);
                            }
                          });
                          
                          // 将Map转换回数组并返回
                          return Array.from(uniqueAssessments.values());
                        })().map(assessment => (
                          <li 
                            key={formatShortDate(assessment.date)}
                            onClick={(e) => handleSelectAssessment(student.id, assessment.id, e)}
                            className={`text-sm py-2 px-3 rounded flex items-center justify-between border hover:bg-blue-100 cursor-pointer transition-colors
                              ${latestAssessment && assessment.id === latestAssessment.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'}`}
                          >
                            <div className="flex items-center">
                              <svg 
                                className="w-4 h-4 text-blue-500 mr-2" 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path 
                                  fillRule="evenodd" 
                                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
                                  clipRule="evenodd" 
                                />
                              </svg>
                              <span>{formatShortDate(assessment.date)}</span>
                              {latestAssessment && assessment.id === latestAssessment.id && (
                                <span className="ml-2 text-xs text-blue-600 font-medium">(最新)</span>
                              )}
                            </div>
                            <div className="text-xs text-blue-600 flex items-center">
                              查看详情
                              <svg 
                                className="w-3 h-3 ml-1" 
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                              >
                                <path 
                                  fillRule="evenodd" 
                                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                                  clipRule="evenodd" 
                                />
                              </svg>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
} 