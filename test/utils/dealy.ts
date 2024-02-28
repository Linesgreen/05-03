/* eslint-disable @typescript-eslint/explicit-function-return-type */

//По умолчанию таймер принимает миллисекунды
export const delay = async (time: number, unit: 'ms' | 's' | 'm' = 'ms', callback?: () => void): Promise<void> => {
  let mil = time;
  switch (unit) {
    case 's':
      mil *= 1000; // Преобразование секунд в миллисекунды
      break;
    case 'm':
      mil *= 60000; // Преобразование минут в миллисекунды
      break;
  }

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      if (callback) callback();
      resolve();
    }, mil);
  });
};
//Примеры работы
// Обратный вызов как анонимная функция
delay(10, 's', () => {
  console.log('Это анонимная функция в обратном вызове');
});

// Обратный вызов как функция
function myCallback() {
  console.log('Это функция в обратном вызове');
}

delay(5, 'm', myCallback);

// Обратный вызов как стрелочная функция
const arrowCallback = () => {
  console.log('Это стрелочная функция в обратном вызове');
};

delay(3, 's', arrowCallback);
// Работа по умолчанию с милисекундвми
delay(3);
