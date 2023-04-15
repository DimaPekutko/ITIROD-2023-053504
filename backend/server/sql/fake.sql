INSERT INTO users (role_id, name, email, password) VALUES
    (1, 'hola1', 'some1@lol.com', '12345'),
    (2, 'hola2', 'some2@lol.com', '12345'),
    (3, 'hola3', 'some3@lol.com', '12345'),
    (3, 'hola4', 'hello@hello.com', '12345');


-- SELECT * FROM users WHERE email LIKE "%@gmail.com";


INSERT INTO categories (name) VALUES
    ('tech'),
    ('clothes'),
    ('transport');


INSERT INTO subcategories (category_id, name) VALUES
    (2, 'tshirt'),
    (2, 'shoes'),
    (3, 'car');


INSERT INTO products_descs (name, price, description) VALUES
    ('Some tshirt', 20, 'Amazing tshirt desc...'),
    ('Some car', 20, 'Amazing car desc...'),
    ('Some shoes', 20, 'Amazing shoes desc...');


INSERT INTO products (user_id, subcategory_id, products_desc_id) VALUES
    (3, 1, 1),
    (4, 2, 3),
    (3, 3, 2);

INSERT INTO product_images (product_id, url) VALUES
    (1, 'https://upcdn.io/W142hJk/raw/demo/4mXShkWyFz.png'),
    (2, 'https://upcdn.io/W142hJk/raw/demo/4mXShkWyFz.png'),
    (3, 'https://upcdn.io/W142hJk/raw/demo/4mXShkWyFz.png');



INSERT INTO users_logs (user_id, content) VALUES
    (3, 'hello');


-- delete user
-- DELETE FROM users WHERE users.id = 4;


-- -- update product description
-- UPDATE products_descs SET description = 'some new desc' WHERE products_descs.id = 1;


-- -- product page instance
-- SELECT products_descs.name, products_descs.price, products_descs.description, users.name, users.email FROM products_descs
--     INNER JOIN products
--         ON products.products_desc_id = products_descs.id
--     INNER JOIN users
--         ON products.user_id = users.id;


-- -- user with role
-- SELECT users.name, users.email, users.status, users_roles.name FROM users
--     INNER JOIN users_roles
--         ON users.role_id = users_roles.id;






