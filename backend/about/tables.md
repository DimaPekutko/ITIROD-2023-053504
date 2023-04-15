# Описание сущностей (таблиц)
## users (Пользователи)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| cart_id | fk(INT) | auto increment; not null; unique | корзина пользователя |
| name | VARCHAR(100) | not null | ФИО пользователя |
| email | VARCHAR(50) | not null | почта пользователя |
| password | VARCHAR(255) | not null | пароль пользователя |
| status | VARCHAR(100) | not null; default(active) | статус пользователя |


## roles (Роли Пользователей)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| name | VARCHAR(100) | not null | название роли |


## users_logs (Логи Пользователей)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| user_id | fk(INT) | not null | пользователь |
| message | VARCHAR(300) | not tull | сообщение |


## products (Товары)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| user_id | fk(INT) | not null | пользователь |
| sub_category_id | fk(INT) | not null | побоч. категория |
| products_descs_id | fk(INT) | not null | описание товара |
| status | VARCHAR(100) | not null; default(moderation) | статус |


## products_descs (Описания товаров)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| name | VARCHAR(150) | not null | название товара |
| price | INT | not null | цена товара |
| description | VARCHAR(1000) | not null | описание товара |


## categories (Категории товаров)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| name | VARCHAR(100) | not null | Название категории |


## subcategories (Побочные категории товаров)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| category_id | fk(INT) | not null | роительская категория |
| name | VARCHAR(100) | not null | название категории |


## carts (Понравившиеся товары пользователя, корзина)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| user_id | fk(INT) | not null; unique | пользователь |
| product_id | fk(INT) | not null | товар |
| added_date | date | not null | дата добавления |


## product_images (Фото товара)
|имя поля | тип | ограничения | описание |
|:---:|:---:|:---:|:---:|
| id | pk(INT) | auto increment; not null; unique | первичный ключ |
| product_id | fk(INT) | not null | товар |
| url | VARCHAR(300) | not null | путь к фото |


