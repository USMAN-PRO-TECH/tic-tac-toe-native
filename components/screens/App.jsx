import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Initialize board based on the selected game size
const createInitialBoard = (size) => Array(size * size).fill(null);

const App = () => {
  const [board, setBoard] = useState([]); // Board state
  const [isPlayerTurn, setIsPlayerTurn] = useState(true); // Player X's turn
  const [winner, setWinner] = useState(null); // Winner of the game
  const [gameMode, setGameMode] = useState(null); // Game mode (PvP or PvC)
  const [gameSize, setGameSize] = useState(null); // Size of the game board

  // Check for a winner whenever the board state changes
  useEffect(() => {
    if (board.length) {
      checkWinner();
      if (gameMode === 'PvC' && !isPlayerTurn && !winner) {
        handleComputerMove();
      }
    }
  }, [board, isPlayerTurn]);

  // Check winner
  const checkWinner = () => {
    const lines = generateWinningLines(gameSize);

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c, ...rest] = lines[i];
      // Check if the values in the winning combination are the same and not null
      if (board[a] && board[a] === board[b] && board[a] === board[c] && rest.every((index) => board[a] === board[index])) {
        setWinner(board[a]);
        return;
      }
    }

    // Check for draw if all squares are filled
    if (board.every(square => square)) {
      setWinner('draw');
    }
  };

  // Generate winning lines based on the game size
  const generateWinningLines = (size) => {
    let lines = [];
    
    // Rows and columns
    for (let i = 0; i < size; i++) {
      lines.push([...Array(size).keys()].map(k => k + i * size)); // rows
      lines.push([...Array(size).keys()].map(k => k * size + i)); // columns
    }
    
    // Diagonals
    lines.push([...Array(size).keys()].map(i => i * (size + 1))); // main diagonal
    lines.push([...Array(size).keys()].map(i => (i + 1) * (size - 1))); // anti-diagonal

    return lines;
  };

  // Handle square press
  const handleSquarePress = (index) => {
    // Check if the square is empty and there is no winner
    if (!board[index] && !winner) {
      // Update the board with the player's move
      const newBoard = [...board];
      newBoard[index] = isPlayerTurn ? 'X' : 'O';
      setBoard(newBoard);
      // Toggle player turn
      setIsPlayerTurn(!isPlayerTurn);
    }
  };

  // Handle computer move
  const handleComputerMove = () => {
    const emptySquares = board.map((square, index) => (square ? null : index)).filter(val => val !== null);
    
    if (emptySquares.length > 0) {
      const randomIndex1 = emptySquares[Math.floor(Math.random() * emptySquares.length)];
      handleSquarePress(randomIndex1);
    }
    
    if (emptySquares.length > 1) {
      const remainingSquares = board.map((square, index) => (square ? null : index)).filter(val => val !== null);
      const randomIndex2 = remainingSquares[Math.floor(Math.random() * remainingSquares.length)];
      handleSquarePress(randomIndex2);
    }
  };

  // Game reset
  const handleReset = () => {
    setBoard(createInitialBoard(gameSize));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  // Handle game mode selection
  const handleGameModeSelection = (mode) => {
    setGameMode(mode);
    handleReset();
  };

  // Handle game size selection
  const handleGameSizeSelection = (size) => {
    setGameSize(size);
    setBoard(createInitialBoard(size));
    setGameMode(null);
  };

  // Return to the main menu
  const handleMainMenu = () => {
    setGameMode(null);
    setGameSize(null);
    setBoard([]);
    setWinner(null);
  };

  // If game size is not selected, show game size selection screen
  if (!gameSize) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Game Size</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleGameSizeSelection(3)}>
          <Text style={styles.buttonText}>3 x 3</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleGameSizeSelection(4)}>
          <Text style={styles.buttonText}>4 x 4</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.button} onPress={() => handleGameSizeSelection(5)}>
          <Text style={styles.buttonText}>5 x 5</Text>
        </TouchableOpacity> */}
        
      </View>
    );
  }

  // If game mode is not selected, show game mode selection screen
  if (!gameMode) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Game Mode</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleGameModeSelection('PvP')}>
          <Text style={styles.buttonText}>Player vs Player</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleGameModeSelection('PvC')}>
          <Text style={styles.buttonText}>Player vs Computer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {board.map((value, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.square, { width: 300 / gameSize, height: 300 / gameSize }]}
            onPress={() => handleSquarePress(index)}
            disabled={board[index] || winner || (gameMode === 'PvC' && !isPlayerTurn)}
          >
            <Text
              style={[
                styles.squareText,
                { color: value === 'X' ? '#435585' : '#E5C3A6', fontSize: 48 / gameSize },
              ]}
            >
              {value ? value.toString() : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.result}>
        {winner
          ? winner === 'draw'
            ? "It's a draw"
            : `Player ${winner} wins!`
          : `Player ${isPlayerTurn ? 'X' : 'O'}'s turn`}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Game</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleMainMenu}>
        <Text style={styles.buttonText}>Main Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  board: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  square: {
    borderWidth: 2,
    borderColor: '#363062',
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareText: {
    fontSize: 36,
  },
  result: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#363062',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#363062',
    paddingHorizontal: 40,
    paddingVertical: 15,
    marginHorizontal: 60,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default App;
