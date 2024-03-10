export class PaginationWithItems<T> {
  public pagesCount: number;
  public items: T[]; // Явное объявление

  constructor(
    public page: number,
    public pageSize: number,
    public totalCount: number,
    items: T[],
  ) {
    this.pagesCount = Math.ceil(totalCount / pageSize); // Инициализация перед items
    this.items = items; // Присвоение значения
  }
}
