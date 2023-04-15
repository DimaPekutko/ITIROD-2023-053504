from typing import Optional, Union
from pydantic import BaseModel


class User(BaseModel):
    id: int
    name: str
    email: str
    status: str
    user_role: str


class UserLog(BaseModel):
    id: int
    user_id: int
    user_email: str
    content: str


class ProductCategory(BaseModel):
    id: int
    name: str


class ProductSubCategory(BaseModel):
    id: int
    parent_id: int
    name: str


class Product(BaseModel):
    id: Optional[int]
    user_id: int
    subcategory_id: int
    subcategory_name: str
    category_name: str
    views: int
    name: str
    price: float
    description: str
    status: Optional[str]
    image_url: Union[str, None]
    user_name: str
    user_email: str


class ProductForCreation(BaseModel):
    user_id: int
    category_id: int
    subcategory_id: int
    name: str
    price: float
    description: str
    image_url: str


class ProductForUpdation(BaseModel):
    id: int
    user_id: int
    subcategory_id: int
    name: str
    price: float
    description: str
    image_url: str


class ProductDesc(BaseModel):
    product_id: int
    name: str
    price: float
    description: str
