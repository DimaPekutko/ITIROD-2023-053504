from fastapi import status, HTTPException
import psycopg2
from server.db import get_db, raw_sql
from server.models import Product, ProductForCreation, ProductForUpdation, ProductCategory, ProductDesc, ProductSubCategory, User, UserLog


db = get_db()


def __row_to_entity(row, pydantic_model):
  return pydantic_model(**{
    key: row[i] for i, key in enumerate(pydantic_model.__fields__.keys())
  })


def __cursor_to_entities(cursor, pydantic_model):
  entities = []
  for row in cursor:
    entity = __row_to_entity(row, pydantic_model)
    entities.append(entity)
  return entities


def get_all_users():
  result = raw_sql(db,
  """
    SELECT 
      users.id, 
      users.name, 
      users.email, 
      users.status,
      users_roles.name 
    FROM users
    LEFT JOIN users_roles ON 
      users_roles.id = users.role_id;
  """)
  
  users = __cursor_to_entities(result, User)
  return users, status.HTTP_200_OK


def get_all_user_logs():
  result = raw_sql(db,
  """
    SELECT
      users_logs.id,
      users.id,
      users.email,
      users_logs.content
    FROM users_logs
    LEFT JOIN users ON
      users.id = users_logs.user_id;
  """)

  logs = __cursor_to_entities(result, UserLog)
  return logs, status.HTTP_200_OK

def get_all_categories():
  result = raw_sql(db,
  """
    SELECT
      id,
      name
    FROM categories;
  """)

  categories = __cursor_to_entities(result, ProductCategory)
  return categories, status.HTTP_200_OK


def get_all_subcategories():
  result = raw_sql(db,
  """
    SELECT
      subcategories.id,
      categories.id,
      subcategories.name
    FROM subcategories
    LEFT JOIN categories ON 
      categories.id = subcategories.category_id;
  """)

  subcategories = __cursor_to_entities(result, ProductSubCategory)
  return subcategories, status.HTTP_200_OK


def get_all_products():
  result = raw_sql(db,
  """
    SELECT
      products.id,
      products.user_id,
      subcategories.id,
      subcategories.name,
      categories.name,
      products.views,
      products_descs.name,
      products_descs.price,
      products_descs.description,
      products.status,
      product_images.url,
      users.name,
      users.email

    FROM products
    LEFT JOIN products_descs ON
      products.products_desc_id = products_descs.id
    LEFT JOIN subcategories ON
      products.subcategory_id = subcategories.id
    LEFT JOIN categories ON
      subcategories.category_id = categories.id
    LEFT JOIN product_images ON
      products.id = product_images.product_id
    LEFT JOIN users ON
      products.user_id = users.id;
  """)
  products = __cursor_to_entities(result, Product)  
  return products, status.HTTP_200_OK


def get_product(id: int):
  result = raw_sql(db,
  """
    SELECT
      products.id,
      products.user_id,
      subcategories.id,
      subcategories.name,
      categories.name,
      products.views,
      products_descs.name,
      products_descs.price,
      products_descs.description,
      products.status,
      product_images.url,
      users.name,
      users.email

    FROM products
    LEFT JOIN products_descs ON
      products.products_desc_id = products_descs.id
    LEFT JOIN subcategories ON
      products.subcategory_id = subcategories.id
    LEFT JOIN categories ON
      subcategories.category_id = categories.id
    LEFT JOIN product_images ON
      products.id = product_images.product_id
    LEFT JOIN users ON
      products.user_id = users.id
  WHERE products.id = %s;
  """, (id,))
  products = __cursor_to_entities(result, Product)  
  return products, status.HTTP_200_OK

def product_view(id: int):
  result = raw_sql(db,
  """
    UPDATE products
    SET
      views = (SELECT views FROM products WHERE id = %s) + 1
    WHERE
      id = %s;
  """, (id, id))

  return {"status": "updated"}, status.HTTP_200_OK

def login(email: str, password: str):
  result = raw_sql(db,
  """
    SELECT 
      users.id, 
      users.name, 
      users.email, 
      users.status,
      users_roles.name 
    FROM users
    LEFT JOIN users_roles ON 
      users_roles.id = users.role_id
    WHERE 
      users.email = %s AND users.password = %s;
  """, (email, password))

  records = __cursor_to_entities(result, User)

  if len(records) > 0:
    return records[0], status.HTTP_200_OK

  return "Cannot find user", status.HTTP_404_NOT_FOUND


def register(name: str, email: str, password: str):
  try:
    result = raw_sql(db,
    """
      INSERT INTO users (
        name,
        email,
        password
      ) VALUES (%s, %s, %s)
      RETURNING (id);
    """, (name, email, password))
    
  except psycopg2.Error as err:
    db.commit()
    return "Cannot register", status.HTTP_400_BAD_REQUEST

  else:
    return {"id": result.fetchone()[0]}, status.HTTP_200_OK


def get_user_products(user_id: int):
  result = raw_sql(db,
  """
    SELECT
      products.id,
      products.user_id,
      subcategories.id,
      subcategories.name,
      categories.name,
      products_descs.name,
      products_descs.price,
      products_descs.description,
      products.status,
      product_images.url,
      users.name,
      users.email

    FROM products
    LEFT JOIN products_descs ON
      products.products_desc_id = products_descs.id
    LEFT JOIN subcategories ON
      products.subcategory_id = subcategories.id
    LEFT JOIN categories ON
      subcategories.category_id = categories.id
    LEFT JOIN product_images ON
      products.id = product_images.product_id
    LEFT JOIN users ON
      products.user_id = users.id
    WHERE products.user_id = %s;
  """, (user_id,))

  products = __cursor_to_entities(result, Product)  
  return products, status.HTTP_200_OK


def create_user_product(product: ProductForCreation):
  with db.cursor() as cursor:
    try:
      cursor.execute(
      """
        INSERT INTO products_descs (
          name,
          price,
          description
        ) VALUES (%s, %s, %s)
        RETURNING id;
      """, (product.name, product.price, product.description))
      
      p_desc_id = cursor.fetchone()[0]

      cursor.execute(
      """
        INSERT INTO products (
          user_id,
          subcategory_id,
          products_desc_id
        ) VALUES (%s, %s, %s)
        RETURNING id;
      """, (product.user_id, product.subcategory_id, p_desc_id))

      p_id = cursor.fetchone()[0]
    
      cursor.execute(
      """
        INSERT INTO product_images (
          product_id,
          url
        ) VALUES (%s, %s);
      """, (p_id, product.image_url))

    except psycopg2.Error as err:
      db.commit()
      return "Cannot create product", status.HTTP_400_BAD_REQUEST
    else:
      db.commit()
      return {"id": p_id}, status.HTTP_200_OK


def delete_user_product(product_id: int):
  try:
    raw_sql(db,
    """
      DELETE FROM products 
      WHERE id = %s;
    """, (product_id,))

  except psycopg2.Error as err:
    db.commit()
    return "Cannot delete product", status.HTTP_400_BAD_REQUEST
  
  else:
    return {"status": "deleted"}, status.HTTP_200_OK


def put_user_product_desc(product: ProductForUpdation):
  with db.cursor() as cursor:
    try:
      cursor.execute(
      """
        UPDATE products_descs
        SET 
          name = %s,
          price = %s,
          description = %s
        WHERE id = (
          SELECT products_desc_id FROM products
          WHERE id = %s
        ) RETURNING id;
      """, (
        product.name, 
        product.price, 
        product.description, 
        product.id))

      p_desc_id = cursor.fetchone()[0]

      cursor.execute(
      """
        UPDATE products
        SET
          subcategory_id = %s
        WHERE products_desc_id = %s;
      """, (product.subcategory_id, p_desc_id))

      cursor.execute(
      """
        UPDATE product_images
        SET
          url = %s
        WHERE product_id = %s;
      """, (product.image_url, product.id))

    except psycopg2.Error as err:
      db.commit()
      return "Cannot update product", status.HTTP_400_BAD_REQUEST

    else:
      return {"status": "updated"}, status.HTTP_200_OK


def update_product_status(user_id: int, target_product_id: int, new_status: str):
  try:
    result = raw_sql(db,
    """
      UPDATE products
      SET
        status = %s
      WHERE 
        id = %s AND 
        (user_id = %s OR (SELECT role_id FROM users WHERE id = %s) < 3)
      RETURNING status;
    """, (new_status, target_product_id, user_id, user_id))

  except psycopg2.Error as err:
    db.commit()
    return "Cannot update product status", status.HTTP_400_BAD_REQUEST

  else:
    updated_status = result.fetchone()
    if not updated_status:
      return "Cannot update product status", status.HTTP_403_FORBIDDEN

    return {"status": updated_status[0]}, status.HTTP_200_OK


def update_user_status(user_id: int, target_user_id: int, new_status: str):
  try:
    result = raw_sql(db,
    """
      UPDATE users
      SET
        status = %s
      WHERE 
        id = %s AND 
        (SELECT role_id FROM users WHERE id = %s) <
        (SELECT role_id FROM users WHERE id = %s)
      RETURNING status;
    """, (new_status, target_user_id, user_id, target_user_id))

  except psycopg2.Error as err:
    print(err)
    db.commit()
    return "Cannot update user status", status.HTTP_400_BAD_REQUEST

  else:
    updated_status = result.fetchone()
    if not updated_status:
      return "Cannot update user status", status.HTTP_403_FORBIDDEN

    return {"status": updated_status[0]}, status.HTTP_200_OK
