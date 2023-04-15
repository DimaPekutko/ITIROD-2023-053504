import psycopg2
from psycopg2 import OperationalError


def raw_sql(db, query, params=None):
    cursor = db.cursor()
    try:
        cursor.execute(query, params)
        db.commit()
        return cursor
    except OperationalError as e:
        return None, e


def __create_db_connection(db_name, db_user, db_password, db_host, db_port):
    connection = None
    try:
        connection = psycopg2.connect(
            database=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
        )
        print("Connection to PostgreSQL DB successful")
    except OperationalError as e:
        print(f"The error '{e}' occurred")
    return connection


def __define_tables(db):
    raw_sql(db, open("sql/tables.sql", "r").read())
    res = raw_sql(db, open("sql/fake.sql", "r").read())
    # for r in res:
    #     print(r)


def get_db():
    db = __create_db_connection("postgres", "postgres", "postgres", "localhost", "5433")
    __define_tables(db)

    return db
