import React, { useState } from 'react';
import InteractionProgressIndicator from '../components/InteractionProgressIndicator';
import { INTERACTION_STATES } from '../config/constants';

const TestProgressBar = () => {
  const [currentState, setCurrentState] = useState(INTERACTION_STATES.IDLE);

  const states = [
    { key: INTERACTION_STATES.IDLE, label: '空闲', description: '等待用户输入' },
    { key: INTERACTION_STATES.LISTENING, label: '监听中', description: '正在识别语音' },
    { key: INTERACTION_STATES.THINKING, label: '思考中', description: '正在理解用户意图' },
    { key: INTERACTION_STATES.CONFIRMING, label: '确认中', description: '等待用户确认操作' },
    { key: INTERACTION_STATES.EXECUTING, label: '执行中', description: '正在执行工具调用' },
    { key: INTERACTION_STATES.SPEAKING, label: '播报中', description: '正在播报结果' },
    { key: INTERACTION_STATES.ERROR, label: '错误', description: '出现错误状态' }
  ];

  // 模拟完整的交互流程
  const simulateInteractionFlow = () => {
    const flow = [
      { state: INTERACTION_STATES.LISTENING, delay: 1000 },
      { state: INTERACTION_STATES.THINKING, delay: 3000 }, // 延长理解时间
      { state: INTERACTION_STATES.CONFIRMING, delay: 1500 },
      { state: INTERACTION_STATES.EXECUTING, delay: 2000 },
      { state: INTERACTION_STATES.SPEAKING, delay: 1500 },
      { state: INTERACTION_STATES.IDLE, delay: 500 }
    ];

    let index = 0;
    const runFlow = () => {
      if (index < flow.length) {
        const step = flow[index];
        setCurrentState(step.state);
        console.log(`流程步骤 ${index + 1}: ${step.state}`);
        index++;
        setTimeout(runFlow, step.delay);
      }
    };
    runFlow();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>进度条测试页面</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>当前状态: {currentState}</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {states.map((state) => (
            <button
              key={state.key}
              onClick={() => setCurrentState(state.key)}
              style={{
                padding: '8px 16px',
                backgroundColor: currentState === state.key ? '#1890ff' : '#f0f0f0',
                color: currentState === state.key ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {state.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={simulateInteractionFlow}
          style={{
            padding: '12px 24px',
            backgroundColor: '#52c41a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          模拟完整交互流程
        </button>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3>完整模式进度条</h3>
        <InteractionProgressIndicator 
          currentState={currentState}
          showDetailedInfo={true}
          compact={false}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3>紧凑模式进度条</h3>
        <InteractionProgressIndicator 
          currentState={currentState}
          showDetailedInfo={false}
          compact={true}
        />
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h4>测试说明:</h4>
        <ul>
          <li><strong>点击上方按钮</strong>：手动切换不同状态</li>
          <li><strong>模拟完整交互流程</strong>：自动演示完整的四阶段进度</li>
          <li><strong>观察进度条变化</strong>：验证当前阶段是否正确高亮</li>
          <li><strong>验证已完成阶段</strong>：检查已完成阶段是否正确标记</li>
        </ul>
        
        <h4>预期行为:</h4>
        <ul>
          <li><strong>IDLE状态</strong>：显示四阶段进度条但未激活，提示"等待语音输入"</li>
          <li><strong>LISTENING状态</strong>：显示第一阶段"识别中"并高亮</li>
          <li><strong>THINKING状态</strong>：显示第二阶段"理解中"并高亮，第一阶段标记为完成（重要：此状态应持续到execute为止）</li>
          <li><strong>CONFIRMING状态</strong>：显示第三阶段"执行中"并高亮，前两阶段标记为完成</li>
          <li><strong>EXECUTING状态</strong>：显示第三阶段"执行中"并高亮，前两阶段标记为完成</li>
          <li><strong>SPEAKING状态</strong>：显示第四阶段"完成"并高亮，前三阶段标记为完成</li>
          <li><strong>ERROR状态</strong>：显示错误状态</li>
        </ul>
        
        <h4>关键测试点:</h4>
        <ul>
          <li><strong>THINKING状态持续时间</strong>：从收到语音到execute之前应该一直保持"理解中"</li>
          <li><strong>状态连续性</strong>：确保状态转换的连续性，不会跳过中间状态</li>
          <li><strong>进度条同步</strong>：进度条显示应该与左下角的状态文本同步</li>
        </ul>
      </div>
    </div>
  );
};

export default TestProgressBar; 