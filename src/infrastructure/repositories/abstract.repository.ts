/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export abstract class AbstractRepository<T> {
  protected constructor(protected dataSource: DataSource) {}
  /**
   * Добавляет новую запись в указанную таблицу.
   * @param tableName - Название таблицы, в которую будет добавлена запись.
   * @param entity {name: "John Doe",age: 30};- Объект с данными для добавления.
   * @returns Promise<B> - Возвращает добавленную сущность.
   */
  async add(tableName: string, entity: Record<string, unknown>): Promise<T> {
    // columns = '"name","age"'
    const columns = Object.keys(entity)
      .map((column) => `"${column}"`)
      .join(',');
    // values = ['John Doe', 30]
    const values = Object.values(entity);
    // placeholders = '$1,$2'
    const placeholders = values.map((_, index) => `$${index + 1}`).join(',');
    //`INSERT INTO "${tableName}" ("name","age") VALUES ($1,$2) RETURNING id`
    const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) RETURNING id`;
    return this.dataSource.query(query, values);
  }
  /**
   * Проверяет существование записи в таблице по указанным полям.
   * @param tableName - Название таблицы, в которой производится проверка.
   * @param conditions { name: "John", age: 30 } - Условия для проверки существования записи. Объект, ключи - имена полей, значения - значения полей.
   * @returns Promise<boolean> - Возвращает true, если запись существует, и false в противном случае.
   */
  async checkIfExistsByFields(tableName: string, conditions: Record<string, unknown>): Promise<boolean> {
    // conditions = { name: "John", age: 30 }
    // columns = ['"name" = $1', '"age" = $2']
    const columns = Object.entries(conditions).map(([key, value], index) => {
      return `"${key}" = $${index + 1}`;
    });
    // values = ["John", 30]
    const values = Object.values(conditions);
    //`SELECT EXISTS(SELECT id FROM public.${tableName} WHERE "name" = $1 AND "age" = $2) as exists`
    const query = `SELECT EXISTS(SELECT id FROM public.${tableName} WHERE ${columns.join(' AND ')}) as exists`;
    const result = await this.dataSource.query(query, values);
    return result[0].exists;
  }
  /**
   * Получает запись из таблицы по указанному полю и значению этого поля.
   * @param tableName - Название таблицы, из которой будет получена запись.
   * @param fieldsToSelect - Массив из полей для выборки.
   * @param fieldName - Имя поля, по которому будет осуществлен поиск.
   * @param fieldValue - Значение поля, по которому будет осуществлен поиск.
   * @returns Promise<B | null> - Возвращает найденную запись или null, если запись не найдена.
   */
  async getByField(
    tableName: string,
    fieldsToSelect: string[],
    fieldName: string,
    fieldValue: unknown,
  ): Promise<T[] | null> {
    // columns = '"field1","field2","field3"'
    const columns = fieldsToSelect.map((field) => `"${field}"`).join(',');

    const result = await this.dataSource.query(`SELECT ${columns} FROM public.${tableName} WHERE "${fieldName}" = $1`, [
      fieldValue,
    ]);
    if (result.length === 0) return null;
    return result;
  }
  /**
   * Получает запись из таблицы по нескольким полям.
   * @param tableName - Название таблицы, из которой будет получена запись.
   * @param fieldsToSelect - Массив из полей для выборки.
   * @param { "name": "John", "age": 30 } conditions - Условия для выборки записи по нескольким полям.
   * @returns Promise<T | null> - Возвращает найденную запись или null, если запись не найдена.
   */
  async getByFields(
    tableName: string,
    fieldsToSelect: string[],
    conditions: Record<string, unknown>,
  ): Promise<T[] | null> {
    // Формируем список полей для SELECT запроса
    const columns = fieldsToSelect.map((field) => `"${field}"`).join(',');
    // '"field1","field2","field3"'

    // Формируем условия для WHERE запроса
    const conditionsArray = Object.entries(conditions).map(([key, value], index) => {
      return `"${key}" = $${index + 1}`;
    });
    // ['"name" = $1', '"age" = $2']

    const conditionValues = Object.values(conditions);
    //  ["John", 30]

    // Строим SQL-запрос
    const query = `SELECT ${columns} FROM public.${tableName} WHERE ${conditionsArray.join(' AND ')}`;
    //  'SELECT "field1","field2","field3" FROM public.tableName WHERE "name" = $1 AND "age" = $2'

    const result = await this.dataSource.query(query, conditionValues);
    if (result.length === 0) return null;
    return result;
  }

  /**
   * Обновляет указанные поля для пользователя в базе данных.
   * так же можно обновить только одно поле
   * @param tableName - имя таблицы
   * @param searchField - Поле для поиска пользователя.
   * @param searchValue - Значение поля для поиска пользователя.
   * @param fieldsToUpdate - Объект с полями для обновления и их значениями.
   * @returns Promise<void>
   */
  async updateFields(
    tableName: string,
    searchField: string,
    searchValue: string | number,
    fieldsToUpdate: Record<string, unknown>,
  ): Promise<void> {
    // Входные данные: { status: 'active', role: 'admin' }

    // entries = [['status', 'active'], ['role', 'admin']]
    const entries: [string, unknown][] = Object.entries(fieldsToUpdate);
    // setFields = '"status" = $2,"role" = $3'
    const setFields: string = entries.map(([key, value], index) => `"${key}" = $${index + 2}`).join(',');

    // values = ['userId123(searchField)', 'active', 'admin']
    const values: (string | unknown)[] = [searchValue, ...entries.map(([, value]) => value)];

    await this.dataSource.query(`UPDATE public.${tableName} SET ${setFields} WHERE "${searchField}" = $1`, values);
  }
}
