from fastapi import APIRouter, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.db import get_async_db_session
from app.controllers.intent_controller import intent_controller
from app.schemas.intent import (
    IntentRequest,
    InterpretSuccessResponse,
)
from app.models.user import User
from app.utils.security import get_optional_user
from app.config import settings
from typing import Optional

# 创建路由器
router = APIRouter(
    tags=["intent"],
    responses={404: {"description": "Not found"}},
)


@router.post("/interpret", 
             response_model=InterpretSuccessResponse,
             response_model_exclude_none=False)
# @stable(tested=2025-04-30, test_script=backend/test_api.py)
async def process_intent(
    request: IntentRequest = Body(...), 
    db: AsyncSession = Depends(get_async_db_session),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    处理用户意图。根据用户查询，可能返回需要调用的工具列表，或直接返回回复内容。

    Args:
        request: 意图请求
        db: 数据库会话 (由 FastAPI 注入)
        current_user: 当前认证用户 (由JWT令牌提供，可为None)

    Returns:
        意图响应
    """
    # 在测试环境中，如果没有current_user，使用请求中提供的user_id
    if current_user is None and settings.ENV == 'development':
        # 确保请求中包含user_id
        if not request.user_id:
            request.user_id = 1  # 测试环境中使用ID为1的默认用户
    else:
        # 将用户ID从认证用户中获取，确保安全
        if current_user:
            request.user_id = current_user.id
    
    # 调用控制器时传递 request 和 db
    return await intent_controller.process_intent(request=request, db=db)
