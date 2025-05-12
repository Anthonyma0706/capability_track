'use client';

import { useState, useEffect } from 'react';
import { Student, Assessment, DimensionKey, SubDimensionKey } from '../types';
import { 
  getStudentsFromStorage, 
  saveStudentsToStorage, 
  createEmptyAssessment, 
  getDimensionName, 
  getSubDimensionName 
} from '../utils';

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
  
  const [currentDimension, setCurrentDimension] = useState<DimensionKey>('learningAbility');
  const [currentSubDimension, setCurrentSubDimension] = useState<SubDimensionKey>('problemMastery');
  const [notEvaluatedKeys, setNotEvaluatedKeys] = useState<string[]>([]);
  
  // 重置表单
  useEffect(() => {
    const newAssessment = existingAssessment || createEmptyAssessment(student.id);
    setAssessment(newAssessment);
    
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
      onAssessmentChange(assessment);
    }
  }, [assessment, onAssessmentChange]);

  // 保存评估
  const handleSaveAssessment = () => {
    const students = getStudentsFromStorage();
    const studentIndex = students.findIndex(s => s.id === student.id);
    
    if (studentIndex === -1) return;
    
    const updatedStudent = { ...students[studentIndex] };
    
    if (existingAssessment) {
      // 更新现有评估
      const assessmentIndex = updatedStudent.assessments.findIndex(
        a => a.id === existingAssessment.id
      );
      
      if (assessmentIndex !== -1) {
        updatedStudent.assessments[assessmentIndex] = assessment;
      }
    } else {
      // 添加新评估
      updatedStudent.assessments.push(assessment);
    }
    
    students[studentIndex] = updatedStudent;
    saveStudentsToStorage(students);
    onAssessmentSaved(student, assessment);
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

  // 导航到下一个子维度
  const navigateToNextSubDimension = () => {
    const dimensions: DimensionKey[] = ['learningAbility', 'timeEfficiency', 'learningHabits', 'executionAbility'];
    const subDimensions: Record<DimensionKey, SubDimensionKey[]> = {
      learningAbility: ['problemMastery', 'selfLearning', 'thinkingAbility', 'metaLearning'],
      timeEfficiency: ['problemSolvingEfficiency', 'mistakeOvercomingEfficiency', 'attentionManagement'],
      learningHabits: ['proactiveHabits', 'toolUseHabits', 'systematicLearning'],
      executionAbility: ['taskExecution', 'coachInteraction', 'mentalityManagement']
    };
    
    const currentDimensionIndex = dimensions.indexOf(currentDimension);
    const currentSubDimensions = subDimensions[currentDimension];
    const currentSubDimensionIndex = currentSubDimensions.indexOf(currentSubDimension);
    
    if (currentSubDimensionIndex < currentSubDimensions.length - 1) {
      // 移动到当前维度的下一个子维度
      setCurrentSubDimension(currentSubDimensions[currentSubDimensionIndex + 1]);
    } else if (currentDimensionIndex < dimensions.length - 1) {
      // 移动到下一个维度的第一个子维度
      const nextDimension = dimensions[currentDimensionIndex + 1];
      setCurrentDimension(nextDimension);
      setCurrentSubDimension(subDimensions[nextDimension][0]);
    }
  };

  // 导航到上一个子维度
  const navigateToPrevSubDimension = () => {
    const dimensions: DimensionKey[] = ['learningAbility', 'timeEfficiency', 'learningHabits', 'executionAbility'];
    const subDimensions: Record<DimensionKey, SubDimensionKey[]> = {
      learningAbility: ['problemMastery', 'selfLearning', 'thinkingAbility', 'metaLearning'],
      timeEfficiency: ['problemSolvingEfficiency', 'mistakeOvercomingEfficiency', 'attentionManagement'],
      learningHabits: ['proactiveHabits', 'toolUseHabits', 'systematicLearning'],
      executionAbility: ['taskExecution', 'coachInteraction', 'mentalityManagement']
    };
    
    const currentDimensionIndex = dimensions.indexOf(currentDimension);
    const currentSubDimensions = subDimensions[currentDimension];
    const currentSubDimensionIndex = currentSubDimensions.indexOf(currentSubDimension);
    
    if (currentSubDimensionIndex > 0) {
      // 移动到当前维度的上一个子维度
      setCurrentSubDimension(currentSubDimensions[currentSubDimensionIndex - 1]);
    } else if (currentDimensionIndex > 0) {
      // 移动到上一个维度的最后一个子维度
      const prevDimension = dimensions[currentDimensionIndex - 1];
      setCurrentDimension(prevDimension);
      setCurrentSubDimension(subDimensions[prevDimension][subDimensions[prevDimension].length - 1]);
    }
  };

  // 根据维度和子维度获取当前的评分项
  const getCurrentIndicators = (): Record<string, number> => {
    // 使用类型断言确保访问是安全的
    const subDimensionData = (assessment.scores[currentDimension] as any)[currentSubDimension];
    const indicators: Record<string, number> = {};
    
    // 获取当前子维度下的所有指标
    for (const indicator in subDimensionData) {
      indicators[indicator] = subDimensionData[indicator];
    }
    
    return indicators;
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

  // 显示当前的评估进度
  const getAssessmentProgress = (): string => {
    const dimensions: DimensionKey[] = ['learningAbility', 'timeEfficiency', 'learningHabits', 'executionAbility'];
    const subDimensions: Record<DimensionKey, SubDimensionKey[]> = {
      learningAbility: ['problemMastery', 'selfLearning', 'thinkingAbility', 'metaLearning'],
      timeEfficiency: ['problemSolvingEfficiency', 'mistakeOvercomingEfficiency', 'attentionManagement'],
      learningHabits: ['proactiveHabits', 'toolUseHabits', 'systematicLearning'],
      executionAbility: ['taskExecution', 'coachInteraction', 'mentalityManagement']
    };
    
    let totalSubDimensions = 0;
    let currentPosition = 0;
    
    for (let i = 0; i < dimensions.length; i++) {
      const dimension = dimensions[i];
      const dimensionSubDimensions = subDimensions[dimension];
      totalSubDimensions += dimensionSubDimensions.length;
      
      if (dimension === currentDimension) {
        currentPosition += subDimensions[dimension].indexOf(currentSubDimension) + 1;
        break;
      } else {
        currentPosition += dimensionSubDimensions.length;
      }
    }
    
    return `${currentPosition}/${totalSubDimensions}`;
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

  const indicators = getCurrentIndicators();

  // 渲染星级评分按钮组
  const renderRatingButtons = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-10 h-10 rounded-full focus:outline-none transition-all ${
              star === value 
                ? 'bg-yellow-400 text-white shadow-md transform scale-110' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            {star}
          </button>
        ))}
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

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {existingAssessment ? '修改评估' : '创建新评估'}
          </h2>
          <p className="text-gray-600 mt-1">{student.name} - {student.grade}</p>
        </div>
        
        {/* 评估进度 */}
        <div className="bg-blue-100 px-4 py-2 rounded-full">
          <div className="flex items-center">
            <span className="text-blue-800 font-medium">评估进度:</span>
            <div className="ml-2 text-blue-800 font-bold">{getAssessmentProgress()}</div>
          </div>
        </div>
      </div>
      
      {/* 维度导航标签 */}
      <div className="flex mb-6 border-b border-gray-200 overflow-x-auto">
        {(['learningAbility', 'timeEfficiency', 'learningHabits', 'executionAbility'] as DimensionKey[]).map((dimension) => (
          <button
            key={dimension}
            className={`px-4 py-2 font-medium whitespace-nowrap ${
              currentDimension === dimension 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setCurrentDimension(dimension);
              const subDimensions: Record<DimensionKey, SubDimensionKey[]> = {
                learningAbility: ['problemMastery', 'selfLearning', 'thinkingAbility', 'metaLearning'],
                timeEfficiency: ['problemSolvingEfficiency', 'mistakeOvercomingEfficiency', 'attentionManagement'],
                learningHabits: ['proactiveHabits', 'toolUseHabits', 'systematicLearning'],
                executionAbility: ['taskExecution', 'coachInteraction', 'mentalityManagement']
              };
              setCurrentSubDimension(subDimensions[dimension][0]);
            }}
          >
            {getDimensionName(dimension)}
          </button>
        ))}
      </div>
      
      {/* 子维度和指标评分 */}
      <div className={`mb-6 rounded-lg border-l-4 p-6 ${getDimensionColor(currentDimension)}`}>
        <h3 className="text-xl font-semibold mb-4">
          {getSubDimensionName(currentSubDimension)}
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
                  currentDimension,
                  currentSubDimension,
                  indicator,
                  newValue
                )
              )}
            </div>
          ))}
        </div>
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
      
      {/* 导航按钮 */}
      <div className="flex justify-between mb-6">
        <button
          onClick={navigateToPrevSubDimension}
          className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          上一项
        </button>
        <button
          onClick={navigateToNextSubDimension}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          下一项
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      {/* 教练反馈 */}
      {currentDimension === 'executionAbility' && currentSubDimension === 'mentalityManagement' && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">教练反馈</h3>
          
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
      )}
      
      {/* 保存按钮 */}
      <div className="mt-auto">
        <button
          onClick={handleSaveAssessment}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md flex items-center justify-center text-lg font-medium transition"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          保存评估
        </button>
      </div>
    </div>
  );
} 