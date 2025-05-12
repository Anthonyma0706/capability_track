'use client';

import { useState, useEffect } from 'react';
import { Student } from '../types';
import { getStudentsFromStorage, saveStudentsToStorage, generateId } from '../utils';

interface StudentListProps {
  onSelectStudent: (student: Student) => void;
  selectedStudentId: string | null;
}

export default function StudentList({ onSelectStudent, selectedStudentId }: StudentListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 加载学生数据
  useEffect(() => {
    const loadedStudents = getStudentsFromStorage();
    setStudents(loadedStudents);

    // 如果有学生且没有选中学生，默认选择第一个
    if (loadedStudents.length > 0 && !selectedStudentId) {
      onSelectStudent(loadedStudents[0]);
    }
  }, [selectedStudentId, onSelectStudent]);

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

  // 过滤后的学生列表
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {filteredStudents.map(student => (
              <li
                key={student.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors
                  ${selectedStudentId === student.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                onClick={() => onSelectStudent(student)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-lg">{student.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{student.grade}</div>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 