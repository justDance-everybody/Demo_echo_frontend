from sqlalchemy import Column, BigInteger, String, JSON, DateTime, Boolean, SmallInteger
from sqlalchemy.sql import func
from app.utils.db import Base

class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(64), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=True)  # 密码哈希字段，修改为nullable
    email = Column(String(120), nullable=True)  # 添加email字段
    full_name = Column(String(120), nullable=True)  # 添加全名
    is_active = Column(SmallInteger, default=1, nullable=True)  # 用户是否激活
    is_superuser = Column(SmallInteger, default=0, nullable=True)  # 是否超级用户
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>" 