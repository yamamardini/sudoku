import React, { useState, useEffect, useRef } from 'react';

// دالة لإنشاء لوحة سودوكو صالحة وقابلة للحل
const generateValidBoard = () => {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));

  // دالة لملء اللوحة بأرقام صالحة
  const fillBoard = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (let num of numbers) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard(board)) {
                return true;
              }
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  fillBoard(board);
  return board;
};

// دالة لخلط الأرقام عشوائيًا
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// دالة للتحقق من صحة الرقم وفقًا لقواعد السودوكو
const isValid = (board, row, col, num) => {
  if (num === 0) return false; // إذا كانت الخلية فارغة

  // التحقق من الصف
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num && i !== col) return false;
  }

  // التحقق من العمود
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num && i !== row) return false;
  }

  // التحقق من المربع 3x3
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) return false;
    }
  }

  return true;
};

// دالة لإزالة بعض الأرقام لإنشاء لوحة قابلة للحل
const removeNumbers = (board, count) => {
  while (count > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      count--;
    }
  }
};

// دالة لحل اللوحة تلقائيًا
const solveBoard = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoard(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

// دالة للتحقق من أن الخطوة الحالية لا تجعل اللعبة غير قابلة للحل
const isMoveValid = (board, row, col, num) => {
  // إنشاء نسخة من اللوحة الحالية
  const tempBoard = JSON.parse(JSON.stringify(board));
  tempBoard[row][col] = num;

  // محاولة حل النسخة المؤقتة
  return solveBoard(tempBoard);
};

// دالة للتحقق من اكتمال اللوحة
const isBoardComplete = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0 || !isValid(board, row, col, board[row][col])) {
        return false;
      }
    }
  }
  return true;
};

const SudokuBoard = () => {
  const [board, setBoard] = useState(() => {
    const validBoard = generateValidBoard();
    removeNumbers(validBoard, 30); // إزالة 30 رقمًا فقط (زيادة الأرقام في اللوحة)
    return validBoard;
  });
  const [selectedCell, setSelectedCell] = useState(null); // الخلية المحددة
  const [numberCounts, setNumberCounts] = useState(Array(9).fill(9)); // عداد الأرقام
  const [errors, setErrors] = useState([]); // قائمة بالأخطاء
  const [time, setTime] = useState(0); // الوقت بالثواني
  const [isTimerRunning, setIsTimerRunning] = useState(false); // حالة تشغيل/إيقاف الموقت
  const [errorCount, setErrorCount] = useState(0); // عداد الأخطاء
  const [gameOver, setGameOver] = useState(false); // حالة انتهاء اللعبة
  const [gameResult, setGameResult] = useState(null); // نتيجة اللعبة (فوز/خسارة)
  const [modifiedCells, setModifiedCells] = useState([]); // تتبع الخلايا المعدلة من قبل اللاعب
  const timerRef = useRef(null); // مرجع للموقت

  // بدء الموقت
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  // دالة لتحديد الخلية عند النقر عليها
  const handleCellClick = (rowIndex, cellIndex) => {
    if (board[rowIndex][cellIndex] === 0 && !gameOver) {
      setSelectedCell({ row: rowIndex, col: cellIndex });
      setErrors([]); // إخفاء الأخطاء عند النقر على مربع آخر
      if (!isTimerRunning) {
        setIsTimerRunning(true); // بدء الموقت عند أول حركة
      }
    }
  };

  // دالة لتحديد لون الخلية
  const getCellStyle = (rowIndex, cellIndex) => {
    const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === cellIndex;
    const isSameRow = selectedCell && selectedCell.row === rowIndex;
    const isSameCol = selectedCell && selectedCell.col === cellIndex;
    const isSameBox =
      selectedCell &&
      Math.floor(selectedCell.row / 3) === Math.floor(rowIndex / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(cellIndex / 3);
    const isError = errors.some((error) => error.row === rowIndex && error.col === cellIndex);

    let style = {};

    if (isSelected) {
      style.backgroundColor = '#1d998b'; // لون الخلية المحددة (أزرق)
    } else if (isSameRow || isSameCol || isSameBox) {
      style.backgroundColor = '#dddcdc'; // لون الصف والعمود والمربع المرتبط (غامق قليلاً)
    }
    if (isError) {
      style.backgroundColor = '#931919'; // لون الخلية الخطأ (أحمر)
    }

    return style;
  };

  // دالة لوضع رقم في الخلية المحددة
  const handleNumberClick = (num) => {
    if (selectedCell && numberCounts[num - 1] > 0 && !gameOver) {
      const { row, col } = selectedCell;

      // التحقق من صلاحية الخطوة
      if (isValid(board, row, col, num) && isMoveValid(board, row, col, num)) {
        const newBoard = [...board];
        newBoard[row][col] = num;
        setBoard(newBoard);

        const newCounts = [...numberCounts];
        newCounts[num - 1] -= 1;
        setNumberCounts(newCounts);

        setErrors([]); // إخفاء الأخطاء عند وضع رقم صحيح

        // إضافة الخلية إلى القائمة المعدلة
        setModifiedCells((prev) => [...prev, { row, col }]);

        // التحقق من الفوز
        if (isBoardComplete(newBoard)) {
          setIsTimerRunning(false);
          setGameOver(true);
          setGameResult('won');
        }
      } else {
        setErrors([{ row, col }]); // إظهار الخطأ في الخلية المحددة فقط
        setErrorCount((prev) => prev + 1); // زيادة عداد الأخطاء

        // التحقق من الخسارة
        if (errorCount + 1 >= 3) {
          setIsTimerRunning(false);
          setGameOver(true);
          setGameResult('lost');
        }
      }
      setSelectedCell(null);
    }
  };

  // دالة لتنسيق الوقت إلى تنسيق MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // دالة لإعادة تشغيل اللعبة
  const restartGame = () => {
    const newBoard = generateValidBoard();
    removeNumbers(newBoard, 30); // إزالة 30 رقمًا فقط
    setBoard(newBoard);
    setNumberCounts(Array(9).fill(9));
    setErrors([]);
    setTime(0);
    setIsTimerRunning(false);
    setErrorCount(0);
    setGameOver(false);
    setGameResult(null);
    setModifiedCells([]); // إعادة تعيين الخلايا المعدلة
  };

  return (
    <div>
      <div className="game-info">
        <div className="timer">Timer: {formatTime(time)}</div>
        <div className="error-count">Error count: {errorCount}/3</div>
      </div>

      {gameOver && (
        <div className="game-over-message">
          <h2>{gameResult === 'won' ? 'You won!' : 'You lost!'}</h2>
          <p>Time: {formatTime(time)}</p>
          <p>Error count: {errorCount}</p>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}

      <div className="sudoku-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="sudoku-row">
            {row.map((cell, cellIndex) => (
              <div
                key={cellIndex}
                className="sudoku-cell"
                style={getCellStyle(rowIndex, cellIndex)} // تطبيق الأنماط
                onClick={() => handleCellClick(rowIndex, cellIndex)} // إضافة حدث النقر
              >
                {cell !== 0 ? (
                  <span
                    style={{
                      color: modifiedCells.some((c) => c.row === rowIndex && c.col === cellIndex)
                        ? '#1d998b' // لون الأرقام التي يضعها اللاعب
                        : '#000', // لون الأرقام الأصلية
                    }}
                  >
                    {cell}
                  </span>
                ) : (
                  ''
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="number-panel">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
          numberCounts[num - 1] > 0 && (
            <div
              key={num}
              className="number-card"
              onClick={() => handleNumberClick(num)} // إضافة حدث النقر
            >
              <div className="number">{num}</div>
              <div className="count">{numberCounts[num - 1]}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default SudokuBoard;