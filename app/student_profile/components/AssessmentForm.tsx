'use client';

import { useState, useEffect, useRef } from 'react';
import { Student, Assessment, DimensionKey, SubDimensionKey } from '../types';
import { 
  getStudentsFromStorage, 
  saveStudentsToStorage, 
  createEmptyAssessment, 
  getDimensionName, 
  getSubDimensionName 
} from '../utils';

// 添加自定义动画
const styles = `
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

.animate-fade-in-out {
  animation: fadeInOut 3s ease-in-out;
}
`;

interface AssessmentFormProps {
  student: Student;
  existingAssessment?: Assessment | null;
  onAssessmentSaved: (student: Student, assessment: Assessment) => void;
  onAssessmentChange: (assessment: Assessment) => void;
}

export default function AssessmentForm({ 
  student, 
  existingAssessment, 
  onAssessmentSaved,
  onAssessmentChange 
}: AssessmentFormProps) {
  const [assessment, setAssessment] = useState<Assessment>(() => {
    return existingAssessment || createEmptyAssessment(student.id);
  });
  
  // 用于跟踪上一次发送的评估数据，避免无限循环
  const prevAssessmentRef = useRef<Assessment | null>(null);
  
  const [notEvaluatedKeys, setNotEvaluatedKeys] = useState<string[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [assessmentDate, setAssessmentDate] = useState<string>(() => {
    // 如果是编辑现有评估，使用其日期；否则使用今天的日期
    if (existingAssessment) {
      return new Date(existingAssessment.date).toISOString().split('T')[0];
    } else {
      return new Date().toISOString().split('T')[0];
    }
  });
  
  // 重置表单
  useEffect(() => {
    const newAssessment = existingAssessment || createEmptyAssessment(student.id);
    setAssessment(newAssessment);
    
    // 设置日期
    if (existingAssessment) {
      setAssessmentDate(new Date(existingAssessment.date).toISOString().split('T')[0]);
    } else {
      setAssessmentDate(new Date().toISOString().split('T')[0]);
    }
    
    // 初始化未评估指标列表
    const notEvaluated: string[] = [];
    Object.keys(newAssessment.scores).forEach(dimension => {
      Object.keys(newAssessment.scores[dimension as DimensionKey]).forEach(subDimension => {
        Object.keys((newAssessment.scores[dimension as DimensionKey] as any)[subDimension]).forEach(indicator => {
          const value = (newAssessment.scores[dimension as DimensionKey] as any)[subDimension][indicator];
          if (value === 0) {
            notEvaluated.push(`${dimension}.${subDimension}.${indicator}`);
          }
        });
      });
    });
    setNotEvaluatedKeys(notEvaluated);
  }, [student.id, existingAssessment]);

  // 当评估数据变化时，触发回调
  useEffect(() => {
    if (onAssessmentChange) {
      // 创建更新后的评估对象
      const updatedAssessment = {
        ...assessment,
        date: new Date(assessmentDate).toISOString()
      };
      
      // 使用 ref 来跟踪上一次发送的评估数据
      if (!prevAssessmentRef.current || 
          JSON.stringify(prevAssessmentRef.current) !== JSON.stringify(updatedAssessment)) {
        prevAssessmentRef.current = updatedAssessment;
        onAssessmentChange(updatedAssessment);
      }
    }
  }, [assessment, assessmentDate, onAssessmentChange]);

  // 保存评估
  const handleSaveAssessment = () => {
    const students = getStudentsFromStorage();
    const studentIndex = students.findIndex(s => s.id === student.id);
    
    if (studentIndex === -1) return;
    
    const updatedStudent = { ...students[studentIndex] };
    
    // 准备要保存的评估数据
    const updatedAssessment = {
      ...assessment,
      date: new Date(assessmentDate).toISOString()
    };
    
    // 获取当前评估的日期 (YYYY-MM-DD 格式)
    const currentDate = new Date(assessmentDate).toISOString().split('T')[0];
    
    // 查找该日期是否已有评估记录
    const existingAssessmentOnSameDate = updatedStudent.assessments.find(a => {
      const existingDate = new Date(a.date).toISOString().split('T')[0];
      return existingDate === currentDate;
    });
    
    // 查找当前正在编辑的评估在数组中的索引（如果存在）
    let currentAssessmentIndex = -1;
    if (existingAssessment) {
      currentAssessmentIndex = updatedStudent.assessments.findIndex(a => a.id === existingAssessment.id);
    }
    
    // 处理评估保存逻辑
    if (existingAssessmentOnSameDate) {
      // 该日期已有评估记录
      
      // 如果当前编辑的就是该日期的评估，直接更新
      if (existingAssessment && existingAssessmentOnSameDate.id === existingAssessment.id) {
        if (currentAssessmentIndex !== -1) {
          updatedStudent.assessments[currentAssessmentIndex] = updatedAssessment;
        }
      } else {
        // 如果当前编辑的是其他日期的评估，但改成了已有评估的日期
        // 1. 删除当前编辑的评估（如果存在）
        if (existingAssessment && currentAssessmentIndex !== -1) {
          updatedStudent.assessments.splice(currentAssessmentIndex, 1);
        }
        
        // 2. 更新该日期的已有评估
        const sameDataAssessmentIndex = updatedStudent.assessments.findIndex(
          a => a.id === existingAssessmentOnSameDate.id
        );
        
        if (sameDataAssessmentIndex !== -1) {
          // 合并评估数据，保留原ID
          updatedStudent.assessments[sameDataAssessmentIndex] = {
            ...updatedAssessment,
            id: existingAssessmentOnSameDate.id
          };
          
          // 更新引用，以便后续使用
          updatedAssessment.id = existingAssessmentOnSameDate.id;
        }
      }
    } else {
      // 该日期没有评估记录
      
      if (existingAssessment) {
        // 如果是编辑现有评估，直接更新
        if (currentAssessmentIndex !== -1) {
          updatedStudent.assessments[currentAssessmentIndex] = updatedAssessment;
        }
      } else {
        // 如果是新建评估，添加到列表
        updatedStudent.assessments.push(updatedAssessment);
      }
    }
    
    // 保存更新后的学生数据
    students[studentIndex] = updatedStudent;
    saveStudentsToStorage(students);
    
    // 显示保存成功提示
    setShowSaveSuccess(true);
    
    // 3秒后隐藏提示
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
    
    // 找到最终保存的评估记录
    const finalAssessment = updatedStudent.assessments.find(a => {
      const aDate = new Date(a.date).toISOString().split('T')[0];
      return aDate === currentDate;
    });
    
    onAssessmentSaved(student, finalAssessment || updatedAssessment);
  };

  // 处理日期变更
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssessmentDate(e.target.value);
  };

  // 更新评分
  const handleScoreChange = (
    dimension: DimensionKey,
    subDimension: SubDimensionKey,
    indicator: string,
    value: number
  ) => {
    const keyPath = `${dimension}.${subDimension}.${indicator}`;
    const currentValue = (assessment.scores[dimension] as any)[subDimension][indicator];
    
    // 如果点击当前已选中的按钮，则清除评分（设为0）
    const newValue = currentValue === value ? 0 : value;
    
    setAssessment(prev => {
      const newAssessment = { ...prev };
      // 使用类型断言确保访问是安全的
      (newAssessment.scores[dimension] as any)[subDimension][indicator] = newValue;
      return newAssessment;
    });
    
    // 更新未评估列表
    setNotEvaluatedKeys(prev => {
      if (newValue === 0) {
        // 添加到未评估列表
        if (!prev.includes(keyPath)) {
          return [...prev, keyPath];
        }
      } else {
        // 从未评估列表移除
        return prev.filter(key => key !== keyPath);
      }
      return prev;
    });
  };

  // 更新反馈
  const handleFeedbackChange = (field: keyof Assessment['feedback'], value: string) => {
    setAssessment(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        [field]: value
      }
    }));
  };

  // 获取指标的中文显示名称
  const getIndicatorDisplayName = (indicator: string): string => {
    const displayNames: Record<string, string> = {
      // 学习能力 - 题目掌握度
      oneStar: '1⭐题正确率',
      twoStar: '2⭐题正确率',
      threeStar: '3⭐题正确率',
      fourStar: '4⭐题正确率',
      oneStarSimilar: '1⭐相似题正确率',
      twoStarSimilar: '2⭐相似题正确率',
      threeStarSimilar: '3⭐相似题正确率',
      fourStarSimilar: '4⭐相似题正确率',
      
      // 学习能力 - 错题自学能力
      selfUnderstandingRatio: '自学理解比例',
      explainToCoachRatio: '能向教练清晰讲解比例',
      initiativeWhenFacingDifficulties: '遇到困难主动寻求解决的积极性',
      
      // 学习能力 - 思维能力
      structuredThinking: '解题思路结构化能力',
      selfBottleneckIdentification: '自我卡点定位能力',
      knowledgeTransfer: '知识点联系与迁移能力',
      
      // 学习能力 - 学习元能力
      problemDescriptionAccuracy: '问题精确描述能力',
      aiToolUtilization: 'AI工具有效利用能力',
      selfReflection: '自我反思总结能力',
      
      // 时间利用效率 - 做题效率
      oneStarTimeEfficiency: '1⭐题平均完成时间效率',
      twoStarTimeEfficiency: '2⭐题平均完成时间效率',
      threeStarTimeEfficiency: '3⭐题平均完成时间效率',
      fourStarTimeEfficiency: '4⭐题平均完成时间效率',
      
      // 时间利用效率 - 错题攻克效率
      selfLearningSpeed: '错题自学理解速度',
      pomodoroEfficiency: '番茄钟利用效率',
      
      // 时间利用效率 - 注意力管理
      focusDuration: '专注持续时间',
      distractionHandling: '学习过程中干扰应对能力',
      goalClarity: '目标明确度',
      
      // 学习习惯 - 主动学习习惯
      activeQuestioning: '主动提问解决问题习惯',
      dualNoteMethod: '使用双格笔记法记录知识点和困惑的习惯',
      reviewHabits: '课前预习/课后复习习惯',
      
      // 学习习惯 - 工具使用习惯
      aiToolQuestioning: 'AI工具有效提问习惯',
      pomodoroUse: '合理运用番茄钟习惯',
      mistakeCollection: '错题收集整理习惯',
      
      // 学习习惯 - 学习系统性
      knowledgeIntegration: '知识整合与复习习惯',
      keyPointAwareness: '考点关联意识习惯',
      selfTesting: '自我检验习惯',
      
      // 配合执行力 - 任务执行
      taskCompletionRate: '任务完成度',
      taskQuality: '任务质量',
      taskInitiative: '任务主动性',
      
      // 配合执行力 - 教练互动
      proactiveCommunication: '主动沟通频率',
      feedbackReceptivity: '反馈接受度',
      guidanceImplementation: '指导落实度',
      
      // 配合执行力 - 心态管理
      positivityTowardsChallenges: '面对挑战积极性',
      frustrationHandling: '挫折应对能力',
      motivationSustainability: '学习动力持续性'
    };
    
    return displayNames[indicator] || indicator;
  };

  // 获取当前维度的背景色
  const getDimensionColor = (dimension: DimensionKey): string => {
    const colorMap: Record<DimensionKey, string> = {
      learningAbility: 'bg-blue-50 border-blue-500',
      timeEfficiency: 'bg-yellow-50 border-yellow-500',
      learningHabits: 'bg-green-50 border-green-500',
      executionAbility: 'bg-purple-50 border-purple-500'
    };
    return colorMap[dimension];
  };

  // 渲染星级评分按钮组
  const renderRatingButtons = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-10 h-10 rounded-full focus:outline-none transition-all duration-200 flex items-center justify-center
              ${star === value 
                ? 'bg-yellow-400 text-white shadow-md transform scale-110' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:transform hover:scale-105'
              }`}
            title={`评分: ${star}分`}
          >
            <span className="font-medium">{star}</span>
          </button>
        ))}
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 text-xs text-gray-500 hover:text-red-500 transition-colors"
            title="清除评分"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // 获取未评估的指标列表
  const getNotEvaluatedList = () => {
    const notEvaluated: Array<{path: string, name: string}> = [];
    
    notEvaluatedKeys.forEach(keyPath => {
      const [dimension, subDimension, indicator] = keyPath.split('.');
      notEvaluated.push({
        path: keyPath,
        name: `${getDimensionName(dimension as DimensionKey)} - ${getSubDimensionName(subDimension as SubDimensionKey)} - ${getIndicatorDisplayName(indicator)}`
      });
    });
    
    return notEvaluated;
  };
  
  // 获取所有子维度数据
  const getAllSubDimensions = () => {
    const dimensions: DimensionKey[] = ['learningAbility', 'timeEfficiency', 'learningHabits', 'executionAbility'];
    const subDimensions: Record<DimensionKey, SubDimensionKey[]> = {
      learningAbility: ['problemMastery', 'selfLearning', 'thinkingAbility', 'metaLearning'],
      timeEfficiency: ['problemSolvingEfficiency', 'mistakeOvercomingEfficiency', 'attentionManagement'],
      learningHabits: ['proactiveHabits', 'toolUseHabits', 'systematicLearning'],
      executionAbility: ['taskExecution', 'coachInteraction', 'mentalityManagement']
    };
    
    return { dimensions, subDimensions };
  };

  // 获取特定子维度的指标
  const getIndicatorsForSubDimension = (dimension: DimensionKey, subDimension: SubDimensionKey): Record<string, number> => {
    // 使用类型断言确保访问是安全的
    const subDimensionData = (assessment.scores[dimension] as any)[subDimension];
    const indicators: Record<string, number> = {};
    
    // 获取当前子维度下的所有指标
    for (const indicator in subDimensionData) {
      indicators[indicator] = subDimensionData[indicator];
    }
    
    return indicators;
  };

  const { dimensions, subDimensions } = getAllSubDimensions();

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-white">
      {/* 添加自定义样式 */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      {/* 保存成功提示 */}
      {showSaveSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-lg animate-fade-in-out flex items-center">
          <div className="bg-green-100 rounded-full p-2 mr-3">
            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-medium">评估已保存成功!</p>
            <p className="text-sm text-green-600">学生档案已更新</p>
          </div>
          <button 
            onClick={() => setShowSaveSuccess(false)} 
            className="ml-6 text-green-500 hover:text-green-700"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {existingAssessment ? '修改评估' : '创建新评估'}
          </h2>
          <p className="text-gray-600 mt-1">{student.name} - {student.grade}</p>
        </div>
        
        <button
          onClick={handleSaveAssessment}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          保存评估
        </button>
      </div>
      
      {/* 日期选择器 */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">评估日期</label>
        <input
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={assessmentDate}
          onChange={handleDateChange}
          max={new Date().toISOString().split('T')[0]} // 限制最大日期为今天
        />
      </div>
      
      {/* 未评估指标列表 */}
      {notEvaluatedKeys.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-3 text-gray-700">本周未评估指标 ({notEvaluatedKeys.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            <ul className="space-y-1">
              {getNotEvaluatedList().map((item, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* 所有维度的评估指标 */}
      {dimensions.map(dimension => (
        <div key={dimension} className="mb-10">
          <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">
            {getDimensionName(dimension)}
          </h2>
          
          {subDimensions[dimension].map(subDimension => {
            const indicators = getIndicatorsForSubDimension(dimension, subDimension);
            
            return (
              <div 
                key={`${dimension}-${subDimension}`} 
                className={`mb-6 rounded-lg border-l-4 p-6 ${getDimensionColor(dimension)}`}
              >
                <h3 className="text-xl font-semibold mb-4">
                  {getSubDimensionName(subDimension)}
                </h3>
                
                <div className="space-y-6">
                  {Object.entries(indicators).map(([indicator, value]) => (
                    <div key={indicator} className="bg-white p-4 rounded-md shadow-sm">
                      <div className="flex justify-between mb-3">
                        <label className="block font-medium">
                          {getIndicatorDisplayName(indicator)}
                        </label>
                        {value === 0 && (
                          <span className="text-gray-500 text-sm">未评估</span>
                        )}
                      </div>
                      
                      {renderRatingButtons(value, (newValue) => 
                        handleScoreChange(
                          dimension,
                          subDimension,
                          indicator,
                          newValue
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* 教练反馈 */}
      <div className="mb-24">
        <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-200">教练反馈</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
          <label className="block mb-2 font-medium text-gray-700">学生优势</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-md h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={assessment.feedback.strengths}
            onChange={(e) => handleFeedbackChange('strengths', e.target.value)}
            placeholder="学生的优势和突出能力..."
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
          <label className="block mb-2 font-medium text-gray-700">需要改进的地方</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-md h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={assessment.feedback.improvements}
            onChange={(e) => handleFeedbackChange('improvements', e.target.value)}
            placeholder="需要改进的地方..."
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <label className="block mb-2 font-medium text-gray-700">下一步计划</label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-md h-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={assessment.feedback.nextSteps}
            onChange={(e) => handleFeedbackChange('nextSteps', e.target.value)}
            placeholder="具体的改进计划..."
          />
        </div>
      </div>
      
      {/* 底部保存按钮 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6 flex justify-center shadow-md z-10">
        <button
          onClick={handleSaveAssessment}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          保存评估
        </button>
      </div>
    </div>
  );
} 