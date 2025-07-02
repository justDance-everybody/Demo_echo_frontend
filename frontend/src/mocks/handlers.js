import { rest } from 'msw';
import { v4 as uuidv4 } from 'uuid'; // For generating tool_ids if needed

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
};

const mockSystemTools = [
  {
    tool_id: 'mcp_system_transfer',
    name: 'System MCP Token Transfer',
    description: 'System default token transfer using MCP.',
    type: 'mcp',
    provider: 'System',
    server_name: 'mcp_server_1',
    endpoint: { /* MCP specific endpoint config */ },
    request_schema: { /* schema */ },
    response_schema: { /* schema */ },
    tags: ['system', 'mcp', 'finance'],
    created_at: '2024-01-15T10:00:00Z',
    rating: 4.5,
  },
  {
    tool_id: 'http_system_weather',
    name: 'System HTTP Weather API',
    description: 'System default weather service.',
    type: 'http',
    provider: 'System',
    endpoint: {
      url: 'https://api.weather.example.com/system',
      method: 'GET',
      platform_type: 'generic_http',
    },
    request_schema: { type: 'object', properties: { city: { type: 'string' } }, required: ['city'] },
    response_schema: { /* schema */ },
    tags: ['system', 'http', 'weather'],
    created_at: '2024-02-20T11:00:00Z',
    rating: 4.2,
  },
  {
    tool_id: 'dev_tool_translator',
    name: 'Advanced Translator (Dev)',
    description: 'Community-provided translation service with more languages.',
    type: 'http',
    provider: 'DeveloperCommunity',
    isDeveloperTool: true,
    endpoint: {
      url: 'https://api.devtranslate.example.com/translate',
      method: 'POST',
      platform_type: 'generic_http',
    },
    request_schema: { type: 'object', properties: { text: { type: 'string' }, target_lang: { type: 'string' } }, required: ['text', 'target_lang'] },
    response_schema: { /* schema */ },
    tags: ['developer', 'http', 'translation', 'ai'],
    created_at: '2024-05-01T15:30:00Z',
    rating: 4.8,
  },
  {
    tool_id: 'dev_tool_imagegen',
    name: 'AI Image Generator (Dev)',
    description: 'Generate images from text prompts, by a third-party dev.',
    type: 'http',
    provider: 'ArtAIProvider',
    isDeveloperTool: true,
    endpoint: {
      url: 'https://api.ai-image.example.com/generate',
      method: 'POST',
      platform_type: 'generic_http',
    },
    request_schema: { type: 'object', properties: { prompt: { type: 'string' } }, required: ['prompt'] },
    response_schema: { /* schema */ },
    tags: ['developer', 'http', 'image', 'generation', 'creative'],
    created_at: '2024-04-10T09:00:00Z',
    rating: 4.9,
  },
  {
    tool_id: 'system_music_player',
    name: 'Smart Music Player',
    description: 'Intelligent music streaming service with voice control and personalized recommendations.',
    type: 'http',
    provider: 'System',
    endpoint: {
      url: 'https://api.music.example.com/player',
      method: 'POST',
      platform_type: 'generic_http',
    },
    request_schema: { type: 'object', properties: { action: { type: 'string' }, song: { type: 'string' }, artist: { type: 'string' } }, required: ['action'] },
    response_schema: { /* schema */ },
    tags: ['system', 'http', 'music', 'entertainment', 'voice-control'],
    created_at: '2024-03-25T14:20:00Z',
    rating: 4.6,
  }
];

// Database for developer-specific tools
let developerToolsDb = [
  {
    tool_id: 'dev_owned_dify_app_123',
    name: 'My Custom Dify App (Dev)',
    description: 'A Dify application integrated by the developer.',
    type: 'http',
    provider: 'devuser',
    isDeveloperTool: true,
    status: 'enabled',
    endpoint: {
      url: 'https://dify.example.com/api/dev-app-1/completion-messages',
      method: 'POST',
      platform_type: 'dify',
      authentication: { type: 'bearer', token: 'dify-secret-token-dev1' },
      dify_config: {
        app_id: 'dify-app-id-123', // Example app_id
        user_query_variable: 'query',
        fixed_inputs: { "scene_mode": "chat" }
      }
    },
    documentation: 'This is a Dify app for testing. Input: query (string). Output: text response.',
    request_schema: {},
    response_schema: {},
    tags: ['developer', 'http', 'dify', 'custom'],
    created_at: '2024-05-15T10:00:00Z',
    rating: 0,
  },
  {
    tool_id: 'dev_owned_coze_bot_456',
    name: 'Personal Coze Bot (Dev)',
    description: 'A Coze bot for personal assistance, by the developer.',
    type: 'http',
    provider: 'devuser',
    isDeveloperTool: true,
    status: 'disabled',
    endpoint: {
      url: 'https://coze.example.com/api/v2/chat',
      method: 'POST',
      platform_type: 'coze',
      authentication: { type: 'api_key', key_name: 'Authorization', api_key: 'Bearer coze-secret-key-dev1' },
      coze_config: {
        bot_id: 'coze-bot-xyz789',
        user_query_variable: 'query'
      }
    },
    documentation: 'This is a Coze bot. Input: query (string). Output: chat message.',
    request_schema: {},
    response_schema: {},
    tags: ['developer', 'http', 'coze', 'chatbot'],
    created_at: '2024-05-16T11:30:00Z',
    rating: 0,
  }
];

export const handlers = [
  // Authentication
  rest.post('/auth/register', async (req, res, ctx) => {
    const { username, email, password } = await req.json();
    if (!username || !email || !password) {
      return res(ctx.status(400), ctx.json({ error: { code: 'INVALID_PARAM', msg: 'Missing fields' } }));
    }
    // Check for existing user (for testing error cases)
    if (email === 'existing@example.com') {
      return res(ctx.status(400), ctx.json({ error: { code: 'VALIDATION_ERROR', msg: 'Email already exists' } }));
    }
    // Simulate successful registration with token
    return res(
      ctx.status(201),
      ctx.json({
        token: 'fake-jwt-register-token-string',
        user: {
          id: Math.floor(Math.random() * 1000),
          username,
          email,
          role: 'user'
        }
      })
    );
  }),

  rest.post('/auth/login', async (req, res, ctx) => {
    const { username, password } = await req.json();
    if (username === 'testuser' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'abc',  // 符合文档要求的token值
          user: mockUser,
        })
      );
    } else if (username === 'devuser' && password === 'password') {
      return res(
        ctx.status(200),
        ctx.json({
          token: 'abc-dev',  // 开发者token保持区别但简化
          user: { ...mockUser, id: 2, username: 'devuser', role: 'developer' }
        })
      );
    } else {
      return res(
        ctx.status(401),
        ctx.json({ error: { code: 'AUTH_FAILED', msg: 'Invalid credentials' } })
      );
    }
  }),

  // Mock getUserInfo API
  rest.get('/api/auth/me', (req, res, ctx) => {
    const authToken = req.headers.get('Authorization');

    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res(ctx.status(401), ctx.json({ error: { code: 'UNAUTHORIZED', msg: 'No token provided' } }));
    }

    const token = authToken.replace('Bearer ', '');

    // Mock user based on token
    if (token === 'abc-dev') {  // 更新为新的开发者token
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          user: {
            id: 2,
            username: 'devuser',
            email: 'dev@example.com',
            role: 'developer'
          }
        })
      );
    } else if (token === 'abc') {  // 更新为新的用户token
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          }
        })
      );
    }

    return res(ctx.status(401), ctx.json({ error: { code: 'INVALID_TOKEN', msg: 'Invalid token' } }));
  }),

  // MOCK GET ALL SERVICES (服务列表) - 支持分页
  rest.get('/api/services', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page')) || 1;
    const pageSize = parseInt(req.url.searchParams.get('page_size')) || 10;

    console.log(`MSW intercepted GET /api/services - 页码: ${page}, 每页数量: ${pageSize}`);

    // 计算分页
    const totalItems = mockSystemTools.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const itemsForPage = mockSystemTools.slice(startIndex, endIndex);

    return res(
      ctx.status(200),
      ctx.json({
        items: itemsForPage,
        current_page: page,
        total_pages: totalPages,
        total_items: totalItems,
        page_size: pageSize,
        has_next: page < totalPages,
        has_prev: page > 1
      })
    );
  }),

  // Core API
  rest.post('/api/interpret', async (req, res, ctx) => {
    const { sessionId, userId, query } = await req.json(); // Changed text to query
    if (!sessionId || userId === undefined || !query) {
      return res(ctx.status(400), ctx.json({ error: { code: 'INVALID_PARAM', msg: 'Missing fields for interpret' } }));
    }

    // 简单的STT识别结果处理 - 直接返回"你好"作为响应
    console.log(`MSW intercepted interpret request with query: "${query}"`);

    // 检查是否是简单的问候语或测试语音输入
    const lowerText = query.toLowerCase();
    if (lowerText.includes('你好') || lowerText.includes('hello') || lowerText.includes('hi') || query.trim().length < 10) {
      // 对于简单问候语，直接返回友好回应，不需要工具调用
      return res(
        ctx.status(200),
        ctx.json({
          sessionId,
          action: 'respond',
          content: '你好！我是你的语音助手，很高兴为你服务。你可以问我任何问题或请求帮助。',
          type: 'direct_response'
        })
      );
    }

    let action = 'unknown_tool';
    let params = {};
    let confirmText = `我理解了："${query}"。这样对吗？`;

    if (lowerText.includes('transfer') || lowerText.includes('转账') || lowerText.includes('mcp')) {
      action = mockSystemTools.find(t => t.tool_id === 'mcp_system_transfer').tool_id;
      params = { amount: 100, currency: 'ETH', recipient: '0x123...' };
      confirmText = `你想要使用MCP转账100 ETH到0x123...吗？`;
    } else if (lowerText.includes('weather') || lowerText.includes('天气')) {
      action = mockSystemTools.find(t => t.tool_id === 'http_system_weather').tool_id;
      params = { city: 'Beijing' };
      confirmText = `要查询北京的天气吗？`;
    } else if (lowerText.includes('translate') || lowerText.includes('翻译') || lowerText.includes('translator')) {
      action = mockSystemTools.find(t => t.tool_id === 'dev_tool_translator').tool_id;
      params = { text: '你好世界', target_lang: 'en' };
      confirmText = `要将"你好世界"翻译成英文吗？`;
    } else if (lowerText.includes('image') || lowerText.includes('图片') || lowerText.includes('generate picture') || lowerText.includes('生成图片')) {
      action = mockSystemTools.find(t => t.tool_id === 'dev_tool_imagegen').tool_id;
      params = { prompt: '一只戴帽子的猫' };
      confirmText = `要生成一张戴帽子的猫的图片吗？`;
    } else if (lowerText.includes('music') || lowerText.includes('音乐') || lowerText.includes('play') || lowerText.includes('播放') || lowerText.includes('song') || lowerText.includes('歌曲')) {
      action = mockSystemTools.find(t => t.tool_id === 'system_music_player').tool_id;
      params = { action: 'play', song: '流行歌曲', artist: '各种艺术家' };
      confirmText = `要为你播放一些音乐吗？`;
    } else {
      // Try to match against developer tools if no system tool matches
      const devToolMatch = developerToolsDb.find(tool => lowerText.includes(tool.name.toLowerCase().split(' ')[0]));
      if (devToolMatch) {
        action = devToolMatch.tool_id;
        // For simplicity, let's assume all dev tools take a generic 'input' param for now
        params = { input: query };
        confirmText = `要使用'${devToolMatch.name}'服务处理你的查询："${query}"吗？`;
      }
    }

    return res(
      ctx.status(200),
      ctx.json({
        sessionId,
        tool_calls: [{
          tool_id: action,
          parameters: params
        }],
        confirm_text: confirmText,
        type: 'tool_call_required'
      })
    );
  }),

  rest.post('/api/v1/execute', async (req, res, ctx) => {
    const { sessionId, userId, tool_id, params } = await req.json();
    if (!sessionId || !tool_id || !params) {
      return res(ctx.status(400), ctx.json({ error: { code: 'INVALID_PARAM', msg: 'Missing fields for execute' } }));
    }

    const tool = [...mockSystemTools, ...developerToolsDb].find(t => t.tool_id === tool_id);
    if (!tool) {
      return res(ctx.status(404), ctx.json({ error: { code: 'TOOL_NOT_FOUND', msg: `Tool ${tool_id} not found` } }));
    }

    if (tool.isDeveloperTool && tool.status === 'disabled') {
      return res(ctx.status(403), ctx.json({ error: { code: 'TOOL_DISABLED', msg: `Tool ${tool_id} is currently disabled by the developer.` } }));
    }

    let responseData = {};
    // Simulate execution based on tool type or platform_type
    if (tool.type === 'mcp') {
      responseData = { success: true, data: { transactionHash: `0x_mcp_tx_${Date.now()}`, message: `MCP call to ${tool.name} successful.` } };
    } else if (tool.type === 'http') {
      if (tool.endpoint?.platform_type === 'dify') {
        responseData = { success: true, data: { answer: `Dify app '${tool.name}' processed '${params[tool.endpoint.dify_config?.user_query_variable || 'query']}'. Mocked response.`, conversation_id: `dify_conv_${Date.now()}` } };
      } else if (tool.endpoint?.platform_type === 'coze') {
        responseData = { success: true, data: { answer: `Coze bot '${tool.name}' responded to '${params[tool.endpoint.coze_config?.user_query_variable || 'query']}'. This is a mock.`, conversation_id: `coze_conv_${Date.now()}` } };
      } else if (tool.tool_id === 'system_music_player') {
        // Special handling for music player
        const action = params.action || 'play';
        const song = params.song || 'Unknown Song';
        const artist = params.artist || 'Unknown Artist';
        responseData = {
          success: true,
          data: {
            message: `🎵 Music Player: ${action === 'play' ? 'Now playing' : action} "${song}" by ${artist}`,
            status: 'playing',
            track: { title: song, artist: artist, duration: '3:42' },
            volume: 75
          }
        };
      } else { // Generic HTTP
        responseData = { success: true, data: { message: `HTTP call to ${tool.name} successful. Input was: ${JSON.stringify(params)}` } };
      }
    } else {
      responseData = { success: false, error: { code: 'UNKNOWN_TOOL_TYPE', msg: `Tool type ${tool.type} not supported for execution.` } };
    }

    return res(ctx.status(200), ctx.json({ sessionId, ...responseData }));
  }),

  // Developer API Endpoints
  rest.get('/api/dev/tools', (req, res, ctx) => {
    // This should ideally be user-specific, but for mock, return all dev tools
    return res(ctx.status(200), ctx.json({ tools: developerToolsDb }));
  }),

  rest.post('/api/dev/tools', async (req, res, ctx) => {
    const serviceData = await req.json();
    const newTool = {
      tool_id: `dev_tool_${uuidv4().slice(0, 8)}`,
      provider: 'devuser', // Assuming current authenticated user is the provider
      isDeveloperTool: true,
      status: 'enabled', // Default to enabled
      created_at: new Date().toISOString(),
      rating: 0,
      tags: serviceData.tags || ['custom', serviceData.platformType || 'http'],
      // Carry over all relevant fields from serviceData
      name: serviceData.serviceName,
      description: serviceData.serviceDescription,
      type: 'http', // All dev tools are HTTP for now in this mock
      endpoint: {
        url: serviceData.endpointUrl,
        method: serviceData.method || 'POST', // Default to POST if not provided
        platform_type: serviceData.platformType,
        authentication: { type: 'bearer', token: serviceData.apiKey }, // Simplify auth for mock
        // Add platform-specific configs if they exist
        ...(serviceData.platformType === 'dify' && { dify_config: { app_id: serviceData.difyAppId, user_query_variable: serviceData.userInputVar } }),
        ...(serviceData.platformType === 'coze' && { coze_config: { bot_id: serviceData.cozeBotId, user_query_variable: serviceData.userInputVar } }),
      },
      documentation: serviceData.documentation, // Save documentation
      // request_schema and response_schema can be added later if needed for dev tools
    };
    developerToolsDb.push(newTool);
    return res(ctx.status(201), ctx.json({
      message: `服务 "${serviceData.serviceName}" 已成功创建！`,
      tool: newTool
    }));
  }),

  rest.put('/api/dev/tools/:toolId', async (req, res, ctx) => {
    const { toolId } = req.params;
    const updateData = await req.json();
    const toolIndex = developerToolsDb.findIndex(t => t.tool_id === toolId);
    if (toolIndex === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Tool not found' }));
    }
    // Only allow status updates for simplicity in mock
    if (updateData.status) {
      developerToolsDb[toolIndex].status = updateData.status;
    }
    // Could extend to update other fields if necessary
    return res(ctx.status(200), ctx.json(developerToolsDb[toolIndex]));
  }),

  rest.delete('/api/dev/tools/:toolId', (req, res, ctx) => {
    const { toolId } = req.params;
    const initialLength = developerToolsDb.length;
    developerToolsDb = developerToolsDb.filter(t => t.tool_id !== toolId);
    if (developerToolsDb.length < initialLength) {
      return res(ctx.status(200), ctx.json({ message: 'Tool deleted successfully' }));
    }
    return res(ctx.status(404), ctx.json({ error: 'Tool not found for deletion' }));
  }),

  // NEW: Mock for testing an unsaved developer tool configuration
  rest.post('/api/dev/tools/test', async (req, res, ctx) => {
    const requestData = await req.json();
    console.log('Testing tool config:', JSON.stringify(requestData, null, 2));

    const { tool_config, test_input } = requestData;
    const testInput = test_input;

    if (!testInput || testInput.trim() === '') {
      return res(ctx.status(400), ctx.json({ success: false, error: 'Test input is required.' }));
    }

    const { platform_type: platformType, authentication, dify_config, coze_config, endpoint_config } = tool_config || {};
    const apiKey = authentication?.token;
    const difyAppId = dify_config?.app_id;
    const cozeBotId = coze_config?.bot_id;
    const endpointUrl = endpoint_config?.url;

    let responseData = { success: false, error: 'Unknown platform or configuration error.', raw_response: null };

    if (platformType === 'dify') {
      if (apiKey && difyAppId && endpointUrl) {
        responseData = {
          success: true,
          message: 'Dify API test successful!',
          raw_response: {
            dify_answer: `Mock Dify response for '${testInput}' using app ${difyAppId}. This is a simulated test.`,
            conversation_id: `test_dify_conv_${uuidv4()}`,
          }
        };
      } else {
        responseData.error = 'Dify configuration incomplete (API Key, App ID, or URL missing).';
      }
    } else if (platformType === 'coze') {
      if (apiKey && cozeBotId && endpointUrl) {
        responseData = {
          success: true,
          message: 'Coze API test successful!',
          raw_response: {
            coze_message: `Mock Coze bot ${cozeBotId} response for '${testInput}'. Simulation successful.`,
            messages: [{ type: 'answer', content: `Mocked Coze: ${testInput}` }],
            conversation_id: `test_coze_conv_${uuidv4()}`,
          }
        };
      } else {
        responseData.error = 'Coze configuration incomplete (API Key, Bot ID, or URL missing).';
      }
    } else if (platformType === 'http') {
      if (apiKey && endpointUrl) {
        responseData = {
          success: true,
          message: 'Generic HTTP API test successful!',
          raw_response: {
            generic_http_data: `Mock generic HTTP response for input '${testInput}' to URL ${endpointUrl}. Test OK.`,
            status_code: 200
          }
        };
      } else {
        responseData.error = 'Generic HTTP configuration incomplete (API Key or URL missing).';
      }
    } else {
      responseData.error = `Platform type '${platformType}' not supported for testing in mock.`;
    }
    await new Promise(resolve => setTimeout(resolve, 750)); // Simulate network delay
    return res(ctx.status(200), ctx.json(responseData));
  }),

  // Example for /api/dev/upload (placeholder)
  rest.post('/api/dev/upload', (req, res, ctx) => {
    // This would normally handle file uploads. For mock, just acknowledge.
    return res(ctx.status(200), ctx.json({ message: 'File upload acknowledged (mock)' }));
  }),
];

// Helper to simulate getting the authenticated user's ID or context if needed later
// function getAuthenticatedDeveloperId(req) {
//   // In a real scenario, you'd inspect the Authorization header or session
//   // For now, we can assume a fixed developer ID or a mock mechanism
//   const authToken = req.headers.get('Authorization');
//   if (authToken === 'Bearer fake-jwt-developer-token-string') {
//       return 2; // Matches devuser in login mock
//   }
//   return null; 
// } 